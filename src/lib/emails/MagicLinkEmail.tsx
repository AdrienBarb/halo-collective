import { EmailLayout } from "@/lib/emails/_brand/EmailLayout";
import {
  EmailBody,
  EmailButton,
  EmailHeading,
} from "@/lib/emails/_brand/atoms";

interface MagicLinkEmailProps {
  magicLink: string;
}

export const MagicLinkEmail = ({ magicLink }: MagicLinkEmailProps) => {
  return (
    <EmailLayout
      preview="Sign in to Halo Collective"
      eyebrow="Sign in"
      footerNote="If you didn't request this email, you can safely ignore it. The link expires in 1 hour."
    >
      <EmailHeading>Sign in to your account.</EmailHeading>
      <EmailBody>
        Click the button below to sign in. The link expires in 1 hour and can
        only be used once.
      </EmailBody>
      <EmailButton href={magicLink}>Sign in</EmailButton>
      <EmailBody>
        Or copy and paste this URL into your browser:
        <br />
        <span style={{ wordBreak: "break-all" }}>{magicLink}</span>
      </EmailBody>
    </EmailLayout>
  );
};

MagicLinkEmail.PreviewProps = {
  magicLink: "https://halocollective.com/sign-in?token=preview",
} satisfies MagicLinkEmailProps;

export default MagicLinkEmail;
