import { EmailLayout } from "@/lib/emails/_brand/EmailLayout";
import {
  EmailBody,
  EmailButton,
  EmailHeading,
  EmailLead,
} from "@/lib/emails/_brand/atoms";

export interface WelcomeMessages {
  preview: string;
  eyebrow: string;
  footerNote: string;
  heading: string;
  lead: string;
  body: string;
  button: string;
}

interface WelcomeEmailProps {
  profileUrl: string;
  messages: WelcomeMessages;
}

export const WelcomeEmail = ({ profileUrl, messages }: WelcomeEmailProps) => {
  return (
    <EmailLayout
      preview={messages.preview}
      eyebrow={messages.eyebrow}
      footerNote={messages.footerNote}
    >
      <EmailHeading>{messages.heading}</EmailHeading>
      <EmailLead>{messages.lead}</EmailLead>
      <EmailBody>{messages.body}</EmailBody>
      <EmailButton href={profileUrl}>{messages.button}</EmailButton>
    </EmailLayout>
  );
};

WelcomeEmail.PreviewProps = {
  profileUrl: "https://halocollective.com/flavio-cobolli",
  messages: {
    preview: "You're in. Welcome to Flavio's circle.",
    eyebrow: "You're in",
    footerNote:
      "You're receiving this because you subscribed to Flavio Cobolli's newsletter on Halo Collective. You can unsubscribe at any time from the footer of any edition.",
    heading: "Welcome to Flavio's circle.",
    lead: "Adrien, thanks for stepping inside. Every week, Flavio's next edition will land here — results, behind the scenes, gear, and the things only the inner circle gets.",
    body: "The first edition you'll receive is the next one published. Until then, the back catalog is on the profile.",
    button: "Visit Flavio's page",
  },
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
