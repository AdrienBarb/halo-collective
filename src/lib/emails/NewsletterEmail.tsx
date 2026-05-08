import { Img, Link, Section, Text } from "@react-email/components";
import { EmailLayout } from "@/lib/emails/_brand/EmailLayout";
import { EmailHeading } from "@/lib/emails/_brand/atoms";
import { palette, fonts } from "@/lib/emails/_brand/theme";

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
    <EmailLayout
      preview={previewText ?? title}
      eyebrow={`${athleteName} · ${editionLabel}`}
      footerNote={
        <>
          You&apos;re receiving this because you subscribed to{" "}
          {athleteName}&apos;s edition on Halo Collective.{" "}
          <Link
            href={unsubscribeUrl}
            style={{ color: palette.ink3, textDecoration: "underline" }}
          >
            Unsubscribe
          </Link>
        </>
      }
    >
      <EmailHeading>{title}</EmailHeading>

      {heroImageUrl ? (
        <Section style={{ marginTop: 24 }}>
          <Img
            src={heroImageUrl}
            alt={title}
            width="536"
            style={{
              display: "block",
              width: "100%",
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
        </Section>
      ) : null}

      <Section style={{ marginTop: 24 }}>
        {(paragraphs.length === 0 ? [body] : paragraphs).map((p, i) => (
          <Text
            key={i}
            style={{
              margin: i === 0 ? 0 : "16px 0 0",
              color: palette.ink2,
              fontFamily: fonts.sans,
              fontSize: 16,
              lineHeight: 1.65,
              whiteSpace: "pre-wrap",
            }}
          >
            {p}
          </Text>
        ))}
      </Section>
    </EmailLayout>
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
