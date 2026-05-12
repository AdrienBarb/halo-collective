import { EmailLayout } from "@/lib/emails/_brand/EmailLayout";
import {
  EmailBody,
  EmailButton,
  EmailHeading,
} from "@/lib/emails/_brand/atoms";

interface PasswordResetEmailProps {
  resetUrl: string;
  firstName?: string;
}

export const PasswordResetEmail = ({
  resetUrl,
  firstName,
}: PasswordResetEmailProps) => {
  const greeting = firstName ? `${firstName}, ` : "";

  return (
    <EmailLayout
      preview="Reset your Halo password"
      eyebrow="Password reset"
      footerNote="If you didn't request a password reset, you can safely ignore this email. The link expires in 1 hour."
    >
      <EmailHeading>Reset your password.</EmailHeading>
      <EmailBody>
        {greeting}click the button below to choose a new password for your Halo
        account. This link expires in 1 hour.
      </EmailBody>
      <EmailButton href={resetUrl}>Reset password</EmailButton>
    </EmailLayout>
  );
};

PasswordResetEmail.PreviewProps = {
  resetUrl: "https://halocollective.co/reset-password?token=preview",
  firstName: "Adrien",
} satisfies PasswordResetEmailProps;

export default PasswordResetEmail;
