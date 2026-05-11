import { resendClient } from "@/lib/resend/resendClient";
import { EmailOtpEmail } from "@/lib/emails/EmailOtpEmail";
import { getRequiredEnv } from "@/lib/utils/env";

interface SendOtpEmailInput {
  email: string;
  otp: string;
}

export async function sendOtpEmail(input: SendOtpEmailInput) {
  const { email, otp } = input;

  const result = await resendClient.emails.send({
    from: getRequiredEnv("RESEND_FROM_EMAIL"),
    to: email,
    subject: "Votre code de connexion Halo",
    react: EmailOtpEmail({ otp }),
  });

  if (result.error) {
    throw new Error(`OTP email failed: ${result.error.message}`);
  }
}
