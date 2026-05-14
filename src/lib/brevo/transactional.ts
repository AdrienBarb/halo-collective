import { brevoFetch } from "@/lib/brevo/client";

interface SendTransactionalEmailInput {
  to: string;
  senderName: string;
  subject: string;
  htmlContent: string;
  params?: Record<string, string>;
}

export async function sendTransactionalEmail(
  input: SendTransactionalEmailInput,
): Promise<void> {
  const { to, senderName, subject, htmlContent, params } = input;

  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const replyToEmail = process.env.BREVO_REPLY_TO_EMAIL;
  if (!senderEmail) throw new Error("BREVO_SENDER_EMAIL is not set");
  if (!replyToEmail) throw new Error("BREVO_REPLY_TO_EMAIL is not set");

  await brevoFetch("/smtp/email", {
    method: "POST",
    body: {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent,
      replyTo: { email: replyToEmail },
      params,
    },
  });
}
