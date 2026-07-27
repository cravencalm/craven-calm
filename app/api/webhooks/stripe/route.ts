import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

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

    // 1. Resolve product name from database
    let productName = "Unknown Product";
    if (productId) {
      const { data: productData } = await supabase
        .from("products")
        .select("name")
        .eq("id", parseInt(productId))
        .maybeSingle();
      if (productData) {
        productName = productData.name;
      }
    }

    // 2. Log purchase in Supabase
    const customerEmail = session.customer_details?.email || "";
    const customerName = session.customer_details?.name || "";
    const amountTotal = session.amount_total || 0;
    const currency = session.currency || "usd";

    const { error: dbError } = await supabase
      .from("purchases")
      .insert([
        {
          stripe_session_id: session.id,
          customer_email: customerEmail,
          customer_name: customerName,
          product_id: productId ? parseInt(productId) : null,
          product_name: productName,
          amount_total: amountTotal,
          currency: currency,
          is_physical: isPhysical === "true",
          shipping_address: (session as any).shipping_details || null,
        },
      ]);

    if (dbError) {
      console.error("Failed to log purchase to Supabase:", dbError);
    } else {
      console.log(`Purchase logged successfully for session ${session.id}`);
    }

    // 3. Send email notification via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      const toEmail = "info@cravencalm.com";

      const formattedAmount = (amountTotal / 100).toFixed(2);
      const isPhysicalProduct = isPhysical === "true";
      const shipping = (session as any).shipping_details;
      
      let shippingDetailsHtml = "";
      if (isPhysicalProduct && shipping) {
        const address = shipping.address;
        shippingDetailsHtml = `
          <div style="margin-top: 20px; padding: 15px; background-color: #111; border: 1px solid #333; color: #fff; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #e3a968;">Shipping Details</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${shipping.name}</p>
            <p style="margin: 5px 0;"><strong>Address:</strong><br/>
              ${address?.line1 || ""}${address?.line2 ? `, ${address.line2}` : ""}<br/>
              ${address?.city || ""}, ${address?.state || ""} ${address?.postal_code || ""}<br/>
              ${address?.country || ""}
            </p>
          </div>
        `;
      }

      const { error: mailError } = await resend.emails.send({
        from: `Craven Calm Store <${fromEmail}>`,
        to: [toEmail],
        subject: `New Purchase: ${productName} ($${formattedAmount})`,
        html: `
          <div style="background-color: #0b0b0d; color: #d1ccb8; font-family: sans-serif; padding: 40px; border: 1px solid #222; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #e3a968; font-family: serif; letter-spacing: 2px; margin-top: 0;">New Order Received</h1>
            <div style="height: 1px; background-color: #333; margin: 20px 0;"></div>
            
            <p style="font-size: 16px; color: #a4a195;">A purchase has been made on the website.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; color: #d1ccb8;">
              <tr style="border-bottom: 1px solid #222;">
                <td style="padding: 10px 0; font-weight: bold; width: 150px;">Product:</td>
                <td style="padding: 10px 0; color: #fff;">${productName} (ID: ${productId || "N/A"})</td>
              </tr>
              <tr style="border-bottom: 1px solid #222;">
                <td style="padding: 10px 0; font-weight: bold;">Amount Paid:</td>
                <td style="padding: 10px 0; color: #e3a968; font-weight: bold;">$${formattedAmount} ${currency.toUpperCase()}</td>
              </tr>
              <tr style="border-bottom: 1px solid #222;">
                <td style="padding: 10px 0; font-weight: bold;">Customer:</td>
                <td style="padding: 10px 0;">${customerName} (${customerEmail})</td>
              </tr>
              <tr style="border-bottom: 1px solid #222;">
                <td style="padding: 10px 0; font-weight: bold;">Stripe Session:</td>
                <td style="padding: 10px 0; font-size: 12px; font-family: monospace; color: #888;">${session.id}</td>
              </tr>
            </table>

            ${shippingDetailsHtml}

            <div style="margin-top: 40px; text-align: center;">
              <a href="https://dashboard.stripe.com/payments" style="background-color: #e3a968; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">View in Stripe Dashboard</a>
            </div>
          </div>
        `,
      });

      if (mailError) {
        console.error("Resend delivery failed for purchase notification:", mailError);
      } else {
        console.log("Purchase notification email sent successfully.");
      }
    } else {
      console.warn("RESEND_API_KEY missing - purchase logged but no email notification sent.");
    }
  }

  return NextResponse.json({ received: true });
}

