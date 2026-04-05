import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
       console.warn("No RESEND_API_KEY. Simulating success.");
       return NextResponse.json({ success: true });
    }

    const { error: mailError } = await resend.emails.send({
      from: "Craven Calm <onboarding@resend.dev>", // Resend requires this for unverified test domains
      to: ["info@cravencalm.com"],
      subject: `New Contact Request: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if (mailError) {
      console.error("Resend delivery failed:", mailError);
      return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
