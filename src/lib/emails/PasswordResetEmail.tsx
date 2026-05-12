import { EmailLayout } from "@/lib/emails/_brand/EmailLayout";
import {
  EmailBody,
  EmailButton,
  EmailHeading,
} from "@/lib/emails/_brand/atoms";

export interface PasswordResetMessages {
  preview: string;
  eyebrow: string;
  footer: string;
  heading: string;
  body: string;
  button: string;
}

interface PasswordResetEmailProps {
  resetUrl: string;
  messages: PasswordResetMessages;
}

export const PasswordResetEmail = ({
  resetUrl,
  messages,
}: PasswordResetEmailProps) => {
  return (
    <EmailLayout
      preview={messages.preview}
      eyebrow={messages.eyebrow}
      footerNote={messages.footer}
    >
      <EmailHeading>{messages.heading}</EmailHeading>
      <EmailBody>{messages.body}</EmailBody>
      <EmailButton href={resetUrl}>{messages.button}</EmailButton>
    </EmailLayout>
  );
};

PasswordResetEmail.PreviewProps = {
  resetUrl: "https://halocollective.co/reset-password?token=preview",
  messages: {
    preview: "Reset your Halo password",
    eyebrow: "Password reset",
    footer:
      "If you didn't request a password reset, you can safely ignore this email. The link expires in 1 hour.",
    heading: "Reset your password.",
    body: "Adrien, click the button below to choose a new password for your Halo account. This link expires in 1 hour.",
    button: "Reset password",
  },
} satisfies PasswordResetEmailProps;

export default PasswordResetEmail;
