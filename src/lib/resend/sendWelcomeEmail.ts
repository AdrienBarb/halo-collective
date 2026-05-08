import { resendClient } from "@/lib/resend/resendClient";
import { WelcomeEmail } from "@/lib/emails/WelcomeEmail";
import { getRequiredEnv } from "@/lib/utils/env";
import config from "@/lib/config";

interface SendWelcomeEmailInput {
  email: string;
  firstName: string;
  athleteFirstName: string;
  athleteLastName: string;
  athleteSlug: string;
}

export async function sendWelcomeEmail(input: SendWelcomeEmailInput) {
  const { email, firstName, athleteFirstName, athleteLastName, athleteSlug } =
    input;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BETTER_AUTH_URL ||
    config.project.url;

  const result = await resendClient.emails.send({
    from: getRequiredEnv("RESEND_FROM_EMAIL"),
    to: email,
    subject: `You're in. Welcome to ${athleteFirstName}'s circle.`,
    react: WelcomeEmail({
      firstName,
      athleteFirstName,
      athleteName: `${athleteFirstName} ${athleteLastName}`,
      profileUrl: `${baseUrl}/${athleteSlug}`,
    }),
  });

  if (result.error) {
    throw new Error(`Welcome email failed: ${result.error.message}`);
  }
}
