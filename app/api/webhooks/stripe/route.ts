import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

const GELATO_API_URL = "https://order.gelatoapis.com/v4/orders";

/**
 * Converts a standard Google Drive share link to a direct download link.
 * Example: https://drive.google.com/file/d/1ABC/view -> https://drive.google.com/uc?export=download&id=1ABC
 */
function convertToDirectLink(url: string | null): string {
  if (!url) return "";
  if (!url.includes("drive.google.com")) return url; // Pass through non-drive links

  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return url;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("Missing signature or secret!");
      return new Response(`Webhook Error: Missing Stripe Secret`, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { productId, isPhysical } = session.metadata || {};

    if (isPhysical === "true" && productId) {
      console.log(`Processing physical order fulfillment for product ${productId}...`);

      try {
        // 1. Fetch product details from Supabase
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (productError || !product) {
          throw new Error(`Product ${productId} not found in database.`);
        }

        if (!product.gelato_uid || !product.gelato_file_url) {
          throw new Error(`Product ${productId} is missing Gelato UID or File URL.`);
        }

        // 2. Prepare Shipping Address
        const shipping = (session as any).shipping_details;
        if (!shipping || !shipping.address) {
          throw new Error("No shipping address found in Stripe session.");
        }

        const address = shipping.address;
        const [firstName, ...lastNameParts] = (shipping.name || "Customer Soul").split(" ");
        const lastName = lastNameParts.join(" ") || "Soul";

        // 3. Convert Google Drive link to direct download
        const directFileUrl = convertToDirectLink(product.gelato_file_url);

        // 4. Construct Gelato Order Payload
        // We set to "draft" by default for safety in sandbox, then "order" for live fulfillment
        const gelatoPayload = {
          orderType: "order", 
          orderReferenceId: `stripe_${session.id.slice(-10)}`,
          customerReferenceId: session.customer_email || "guest",
          currency: "USD",
          items: [
            {
              itemReferenceId: `item_${productId}`,
              productUid: product.gelato_uid,
              quantity: 1,
              fileUrl: directFileUrl
            }
          ],
          shippingAddress: {
            firstName: firstName,
            lastName: lastName,
            addressLine1: address.line1,
            addressLine2: address.line2 || "",
            city: address.city,
            postcode: address.postal_code,
            countryCode: address.country, // Stripe uses ISO 2-letter
            stateCode: address.state || "" 
          }
        };

        // 5. Send to Gelato API
        console.log("Sending order to Gelato API...");
        const response = await fetch(GELATO_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": process.env.GELATO_API_KEY || ""
          },
          body: JSON.stringify(gelatoPayload)
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("Gelato API Error Details:", JSON.stringify(result));
          throw new Error(`Gelato API responded with ${response.status}: ${JSON.stringify(result)}`);
        }

        console.log(`Gelato Order Created Successfully: ${result.orderId || "Success"}`);

      } catch (fulfillmentError: any) {
        console.error("Fulfillment Error:", fulfillmentError.message);
        // Alert the admin (log persists)
      }
    }
  }

  return NextResponse.json({ received: true });
}
