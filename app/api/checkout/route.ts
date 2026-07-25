import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-02-24.acacia",
  });
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    // Lookup product in Supabase
    let product: {
      name: string;
      price_cents: number;
      image_url?: string | null;
      is_physical: boolean;
      is_ebook?: boolean;
      description?: string;
    } | null = null;

    const { data: productData } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (productData) {
      const isEbook = (productData.category || "").split(",").includes("ebook");
      product = {
        name: productData.name,
        price_cents: productData.price_cents,
        image_url: productData.image_url,
        is_physical: !!productData.is_physical,
        is_ebook: isEbook,
        description: isEbook
          ? `eBook by ${productData.audio_length || "Unknown"} - Digital EPUB/PDF Download`
          : (productData.is_physical 
              ? "Physical Metal-Framed Poster (Global Shipping)" 
              : "Craven Calm High-Quality Digital Download (MP3/ZIP)"),
      };
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Ensure Stripe is connected
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe key not configured" }, { status: 500 });
    }

    // Get origin for absolute URL routing
    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "link"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              images: product.image_url ? [product.image_url] : [],
              description: product.description,
            },
            unit_amount: typeof product.price_cents === "number" ? product.price_cents : 900,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}&product_id=${productId}`,
      cancel_url: `${origin}/`,
      shipping_address_collection: product.is_physical ? {
        allowed_countries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'DK', 'FI', 'IE', 'NO', 'SE', 'CH', 'PT', 'NZ', 'JP', 'KR', 'SG'],
      } : undefined,
      shipping_options: product.is_physical ? [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1000, // $10.00 flat fee
              currency: 'usd',
            },
            display_name: 'Global Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 15 },
            },
          },
        },
      ] : undefined,
      metadata: {
        productId: productId.toString(),
        isPhysical: product.is_physical ? "true" : "false",
        isEbook: product.is_ebook ? "true" : "false",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
