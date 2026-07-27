import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-02-24.acacia",
  });

  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe key not configured" }, { status: 500 });
    }

    // 1. Fetch completed checkout sessions from Stripe (limit 100 for sync)
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: "complete",
    });

    let syncCount = 0;

    for (const session of sessions.data) {
      if (session.payment_status !== "paid") continue;

      const { productId, isPhysical } = session.metadata || {};
      if (!productId) continue;

      // Check if already in DB
      const { data: existing } = await supabase
        .from("purchases")
        .select("id")
        .eq("stripe_session_id", session.id)
        .maybeSingle();

      if (existing) continue;

      // Resolve product name
      let productName = "Unknown Product";
      const { data: productData } = await supabase
        .from("products")
        .select("name")
        .eq("id", parseInt(productId))
        .maybeSingle();
      
      if (productData) {
        productName = productData.name;
      }

      // Insert purchase
      const { error: dbError } = await supabase
        .from("purchases")
        .insert([
          {
            stripe_session_id: session.id,
            customer_email: session.customer_details?.email || "",
            customer_name: session.customer_details?.name || "",
            product_id: parseInt(productId),
            product_name: productName,
            amount_total: session.amount_total || 0,
            currency: session.currency || "usd",
            is_physical: isPhysical === "true",
            shipping_address: (session as any).shipping_details || null,
            created_at: new Date(session.created * 1000).toISOString(),
          },
        ]);

      if (!dbError) {
        syncCount++;
      } else {
        console.error(`Error syncing session ${session.id}:`, dbError);
      }
    }

    return NextResponse.json({ success: true, synced: syncCount });
  } catch (error: any) {
    console.error("Sync Purchases Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
