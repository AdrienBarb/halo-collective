import { Text } from "@react-email/components";
import { EmailLayout } from "@/lib/emails/_brand/EmailLayout";
import { EmailBody, EmailHeading } from "@/lib/emails/_brand/atoms";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface EmailOtpEmailProps {
  otp: string;
}

export const EmailOtpEmail = ({ otp }: EmailOtpEmailProps) => {
  return (
    <EmailLayout
      preview="Your Halo sign-in code"
      eyebrow="Sign in"
      footerNote="If you didn't request this code, ignore this email. The code expires in 5 minutes."
    >
      <EmailHeading>Your sign-in code.</EmailHeading>
      <EmailBody>Enter this code to sign in to your account:</EmailBody>
      <Text
        style={{
          margin: "24px 0 0",
          color: palette.ink,
          fontFamily: fonts.mono,
          fontSize: 36,
          fontWeight: 600,
          letterSpacing: "0.4em",
          textAlign: "center",
        }}
      >
        {otp}
      </Text>
      <EmailBody>This code expires in 5 minutes.</EmailBody>
    </EmailLayout>
  );
};

EmailOtpEmail.PreviewProps = {
  otp: "482915",
} satisfies EmailOtpEmailProps;

export default EmailOtpEmail;
