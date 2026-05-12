import { resendClient } from "@/lib/resend/resendClient";
import { PasswordResetEmail } from "@/lib/emails/PasswordResetEmail";
import { getRequiredEnv } from "@/lib/utils/env";

interface SendPasswordResetEmailInput {
  email: string;
  resetUrl: string;
  firstName?: string;
}

export async function sendPasswordResetEmail(
  input: SendPasswordResetEmailInput,
) {
  const { email, resetUrl, firstName } = input;

  const result = await resendClient.emails.send({
    from: getRequiredEnv("RESEND_FROM_EMAIL"),
    to: email,
    subject: "Reset your Halo password",
    react: PasswordResetEmail({ resetUrl, firstName }),
  });

  if (result.error) {
    throw new Error(`Password reset email failed: ${result.error.message}`);
  }
}
