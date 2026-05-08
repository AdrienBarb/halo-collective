import { Img, Link, Section } from "@react-email/components";
import type { DebriefSection } from "@prisma/client";
import { EmailLayout } from "@/lib/emails/_brand/EmailLayout";
import { EmailHeading } from "@/lib/emails/_brand/atoms";
import { EmailDebrief } from "@/lib/emails/blocks/Debrief";
import { palette } from "@/lib/emails/_brand/theme";

interface NewsletterEmailProps {
  title: string;
  debrief: DebriefSection;
  heroImageUrl?: string | null;
  editionNumber: number;
  athleteName: string;
  editionUrl: string;
  previewText?: string;
  unsubscribeUrl?: string;
}

export const NewsletterEmail = ({
  title,
  debrief,
  heroImageUrl,
  editionNumber,
  athleteName,
  editionUrl,
  previewText,
  unsubscribeUrl = "{{ unsubscribe }}",
}: NewsletterEmailProps) => {
  const editionLabel = `Edition #${editionNumber.toString().padStart(2, "0")}`;

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

      <EmailDebrief section={debrief} editionUrl={editionUrl} />
    </EmailLayout>
  );
};

NewsletterEmail.PreviewProps = {
  title: "Monte Carlo: the comeback nobody saw",
  debrief: {
    id: "preview",
    newsletterId: "preview",
    body:
      "Down a set and a break. Crowd dead. I told myself one point at a time — and somehow we found a way back.\n\nThis one's for everyone who stayed up watching.",
    pullQuote: "One point at a time.",
    pullQuoteContext: "Between sets — Monte Carlo, R3",
    voiceNoteUrl: null,
    voiceNoteDurationSec: 92,
    voiceNoteLabel: "Voice note",
    voiceNoteLocation: "Locker room · Monte Carlo",
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies DebriefSection,
  heroImageUrl: null,
  editionNumber: 1,
  athleteName: "Flavio Cobolli",
  editionUrl: "https://halocollective.co/flavio-cobolli/monte-carlo-comeback",
  previewText: "The comeback nobody saw",
} satisfies NewsletterEmailProps;

export default NewsletterEmail;
