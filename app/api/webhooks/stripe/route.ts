import { NextResponse } from "next/server";
import Stripe from "stripe";

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

    if (isPhysical === "true" && productId) {
      console.log(`Physical order received for product ${productId}. Manual fulfillment required.`);
      // No automated fulfillment — the merchant will receive a Stripe email with the shipping address.
    }
  }

  return NextResponse.json({ received: true });
}
