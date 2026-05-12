import { Text } from "@react-email/components";
import { EmailLayout } from "@/lib/emails/_brand/EmailLayout";
import { EmailBody, EmailHeading } from "@/lib/emails/_brand/atoms";
import { palette, fonts } from "@/lib/emails/_brand/theme";

export interface EmailOtpMessages {
  preview: string;
  eyebrow: string;
  footer: string;
  heading: string;
  lead: string;
  expiry: string;
}

interface EmailOtpEmailProps {
  otp: string;
  messages: EmailOtpMessages;
}

export const EmailOtpEmail = ({ otp, messages }: EmailOtpEmailProps) => {
  return (
    <EmailLayout
      preview={messages.preview}
      eyebrow={messages.eyebrow}
      footerNote={messages.footer}
    >
      <EmailHeading>{messages.heading}</EmailHeading>
      <EmailBody>{messages.lead}</EmailBody>
      <Text
        style={{
          margin: "24px 0 0",
          color: palette.panelDark,
          fontFamily: fonts.mono,
          fontSize: 36,
          fontWeight: 600,
          letterSpacing: "0.4em",
          textAlign: "center",
        }}
      >
        {otp}
      </Text>
      <EmailBody>{messages.expiry}</EmailBody>
    </EmailLayout>
  );
};

EmailOtpEmail.PreviewProps = {
  otp: "482915",
  messages: {
    preview: "Your Halo sign-in code",
    eyebrow: "Sign in",
    footer:
      "If you didn't request this code, ignore this email. The code expires in 5 minutes.",
    heading: "Your sign-in code.",
    lead: "Enter this code to sign in to your account:",
    expiry: "This code expires in 5 minutes.",
  },
} satisfies EmailOtpEmailProps;

export default EmailOtpEmail;
