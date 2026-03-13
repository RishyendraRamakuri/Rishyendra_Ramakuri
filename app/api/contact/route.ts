import { NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const contactReceiver = process.env.CONTACT_RECEIVER;

if (!resendApiKey) {
  console.error("RESEND_API_KEY is not defined in the environment.");
}

if (!contactReceiver) {
  console.error("CONTACT_RECEIVER is not defined in the environment.");
}

const resend = new Resend(resendApiKey);

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { firstName, lastName, email, subject, message } = data;

    if (!firstName || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: contactReceiver ?? "",
      subject: `Portfolio Contact: ${subject || "No Subject"}`,
      html: `<p><strong>From:</strong> ${firstName} ${lastName || ""} (${email})</p><p>${message}</p>`,
    });

    if (response.error) {
      console.error("Resend error:", response.error);
      return NextResponse.json(
        { error: "Failed to send email via Resend", details: response.error },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Contact API error:", error);

    const message =
      error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";

    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}
