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
      preview="Votre code de connexion Halo"
      eyebrow="Connexion"
      footerNote="Si vous n'avez pas demandé ce code, ignorez cet email. Le code expire dans 5 minutes."
    >
      <EmailHeading>Votre code de connexion.</EmailHeading>
      <EmailBody>
        Saisissez ce code pour vous connecter à votre compte&nbsp;:
      </EmailBody>
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
      <EmailBody>Ce code expire dans 5 minutes.</EmailBody>
    </EmailLayout>
  );
};

EmailOtpEmail.PreviewProps = {
  otp: "482915",
} satisfies EmailOtpEmailProps;

export default EmailOtpEmail;
