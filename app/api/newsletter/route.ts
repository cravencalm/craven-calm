import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email address" }, { status: 400 });
    }

    // 1. Insert into Supabase
    const { error: dbError } = await supabase.from("subscribers").insert([{ email }]);

    if (dbError) {
      if (dbError.code === "23505") { // Unique violation
        return NextResponse.json({ error: "ALREADY_SUBSCRIBED" }, { status: 400 });
      }
      console.error("Database connection error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 2. Dispatch Welcome Email via Resend
    if (process.env.RESEND_API_KEY) {
      const { data, error: mailError } = await resend.emails.send({
        from: "Craven Calm <info@cravencalm.com>",
        to: [email],
        subject: "Welcome to the Sanctuary",
        html: `
          <div style="background-color: #0b0b0d; color: #d1ccb8; font-family: sans-serif; padding: 40px; text-align: center;">
            <h1 style="color: #e3a968; font-family: serif; letter-spacing: 2px;">Welcome to the Shadows</h1>
            <div style="height: 1px; background-color: #333; margin: 20px 0;"></div>
            <p style="font-size: 16px; line-height: 1.6; color: #a4a195;">
              Thank you for subscribing to our newsletter. You will be the first to know about our newest gothic audio creations and atmospheric meditations.
            </p>
            <p style="font-size: 16px; margin-top: 30px;">Find your inner peace.</p>
            <p style="font-size: 12px; color: #555; margin-top: 50px;">
              - The Craven Calm Team
            </p>
          </div>
        `,
      });

      if (mailError) {
        console.error("Resend delivery failed:", mailError);
        // We still return 200 because they WERE subscribed to the DB, even if the email dropped.
      }
    } else {
        console.warn("RESEND_API_KEY missing - user subscribed but no email sent.");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Newsletter API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
