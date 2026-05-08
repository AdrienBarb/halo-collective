import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

interface NewsletterEmailProps {
  title: string;
  body: string;
  heroImageUrl?: string | null;
  editionNumber: number;
  athleteName: string;
  previewText?: string;
  unsubscribeUrl?: string;
}

export const NewsletterEmail = ({
  title,
  body,
  heroImageUrl,
  editionNumber,
  athleteName,
  previewText,
  unsubscribeUrl = "{{ unsubscribe }}",
}: NewsletterEmailProps) => {
  const editionLabel = `Edition #${editionNumber.toString().padStart(2, "0")}`;
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Html>
      <Head />
      <Preview>{previewText ?? title}</Preview>
      <Tailwind>
        <Body className="bg-[#f5f1ea] font-sans">
          <Container className="mx-auto max-w-[640px] bg-white px-8 py-10">
            <Text className="m-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a8f7e]">
              {athleteName} · {editionLabel}
            </Text>

            <Heading className="mt-4 mb-0 text-[34px] font-semibold leading-[1.1] tracking-[-0.015em] text-[#1a1815]">
              {title}
            </Heading>

            {heroImageUrl ? (
              <Section className="mt-8">
                <Img
                  src={heroImageUrl}
                  alt={title}
                  width="576"
                  className="block w-full rounded-md object-cover"
                />
              </Section>
            ) : null}

            <Section className="mt-8">
              {paragraphs.length === 0 ? (
                <Text className="m-0 whitespace-pre-wrap text-[16px] leading-[1.65] text-[#3a342e]">
                  {body}
                </Text>
              ) : (
                paragraphs.map((p, i) => (
                  <Text
                    key={i}
                    className={
                      i === 0
                        ? "m-0 whitespace-pre-wrap text-[16px] leading-[1.65] text-[#3a342e]"
                        : "m-0 mt-4 whitespace-pre-wrap text-[16px] leading-[1.65] text-[#3a342e]"
                    }
                  >
                    {p}
                  </Text>
                ))
              )}
            </Section>

            <Hr className="mt-10 mb-6 border-[#e8e1d4]" />

            <Text className="m-0 text-[12px] leading-[1.6] text-[#7a7164]">
              You&apos;re receiving this because you subscribed to{" "}
              {athleteName}&apos;s edition on Halo Collective.
            </Text>
            <Text className="mt-2 mb-0 text-[12px] leading-[1.6] text-[#7a7164]">
              <Link href={unsubscribeUrl} className="text-[#7a7164] underline">
                Unsubscribe
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

NewsletterEmail.PreviewProps = {
  title: "Monte Carlo: the comeback nobody saw",
  body: "Down a set and a break. Crowd dead. I told myself one point at a time — and somehow we found a way back.\n\nThis one's for everyone who stayed up watching.",
  heroImageUrl: null,
  editionNumber: 1,
  athleteName: "Flavio Cobolli",
  previewText: "The comeback nobody saw",
} satisfies NewsletterEmailProps;

export default NewsletterEmail;
