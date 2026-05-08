import { EmailLayout } from "@/lib/emails/_brand/EmailLayout";
import {
  EmailBody,
  EmailButton,
  EmailHeading,
  EmailLead,
} from "@/lib/emails/_brand/atoms";

interface WelcomeEmailProps {
  firstName?: string;
  athleteFirstName: string;
  athleteName: string;
  profileUrl: string;
}

export const WelcomeEmail = ({
  firstName,
  athleteFirstName,
  athleteName,
  profileUrl,
}: WelcomeEmailProps) => {
  const greeting = firstName ? `${firstName}, ` : "";

  return (
    <EmailLayout
      preview={`You're in. Welcome to ${athleteFirstName}'s circle.`}
      eyebrow="You're in"
      footerNote={
        <>
          You&apos;re receiving this because you subscribed to{" "}
          {athleteName}&apos;s newsletter on Halo Collective. You can
          unsubscribe at any time from the footer of any edition.
        </>
      }
    >
      <EmailHeading>Welcome to {athleteFirstName}&apos;s circle.</EmailHeading>
      <EmailLead>
        {greeting}thanks for stepping inside. Every week, {athleteFirstName}
        &apos;s next edition will land here — results, behind the scenes, gear,
        and the things only the inner circle gets.
      </EmailLead>
      <EmailBody>
        The first edition you&apos;ll receive is the next one published. Until
        then, the back catalog is on the profile.
      </EmailBody>
      <EmailButton href={profileUrl}>Visit {athleteFirstName}&apos;s page</EmailButton>
    </EmailLayout>
  );
};

WelcomeEmail.PreviewProps = {
  firstName: "Adrien",
  athleteFirstName: "Flavio",
  athleteName: "Flavio Cobolli",
  profileUrl: "https://halocollective.com/flavio-cobolli",
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
