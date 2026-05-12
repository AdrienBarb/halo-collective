import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import config from "@/lib/config";

export interface WaitlistMessages {
  preview: string;
  heading: string;
  body: string;
  position: string;
  emailLine: string;
  footer: string;
}

interface WaitlistConfirmationEmailProps {
  messages: WaitlistMessages;
}

export const WaitlistConfirmationEmail = ({
  messages,
}: WaitlistConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{messages.preview}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-8 px-4">
            <Heading className="text-2xl font-bold mb-4">
              {messages.heading}
            </Heading>
            <Text className="text-gray-700 mb-4">{messages.body}</Text>
            <Section className="bg-gray-50 rounded-md p-4 my-4">
              <Text className="text-sm text-gray-600 mb-2">
                {messages.position}
              </Text>
              <Text className="text-sm text-gray-600">{messages.emailLine}</Text>
            </Section>
            <Text className="text-gray-500 text-sm">{messages.footer}</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

WaitlistConfirmationEmail.PreviewProps = {
  messages: {
    preview: "You're on the waitlist!",
    heading: "You're on the waitlist!",
    body: `Thanks for joining the waitlist for ${config.project.name}. We'll notify you as soon as we launch.`,
    position: "Your position: #{position}",
    emailLine: "Email: {email}",
    footer:
      "We'll send you an email when it's your turn to access the platform.",
  },
} satisfies WaitlistConfirmationEmailProps;

export default WaitlistConfirmationEmail;
