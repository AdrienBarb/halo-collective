import { Img, Link, Section, Text } from "@react-email/components";
import { EmailLayout } from "@/lib/emails/_brand/EmailLayout";
import { EmailButton, EmailHeading } from "@/lib/emails/_brand/atoms";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import SectionRenderer, {
  type EmailRawSection,
} from "@/lib/emails/SectionRenderer";
import { getTournamentLabel } from "@/lib/newsletter/labels";
import type { SectionTypeValue } from "@/lib/schemas/newsletterSection";

interface NewsletterEmailProps {
  title: string;
  heroImageUrl?: string | null;
  editionNumber: number;
  athleteName: string;
  editionUrl: string;
  askQuestionUrl?: string | null;
  tournamentName?: string | null;
  tournamentContext?: string | null;
  sections: EmailRawSection[];
  previewText?: string;
  unsubscribeUrl?: string;
}

export const NewsletterEmail = ({
  title,
  heroImageUrl,
  editionNumber,
  athleteName,
  editionUrl,
  askQuestionUrl,
  tournamentName,
  tournamentContext,
  sections,
  previewText,
  unsubscribeUrl = "{{ unsubscribe }}",
}: NewsletterEmailProps) => {
  const editionLabel = `Edition #${editionNumber.toString().padStart(2, "0")}`;
  const tournamentLabel = getTournamentLabel(tournamentName);
  const orderedSections = [...sections].sort((a, b) => a.order - b.order);

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
      {tournamentLabel ? (
        <Text
          style={{
            margin: "0 0 8px",
            color: palette.ink3,
            fontFamily: fonts.mono,
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          {tournamentLabel}
        </Text>
      ) : null}

      <EmailHeading>{title}</EmailHeading>

      {tournamentContext ? (
        <Text
          style={{
            margin: "8px 0 0",
            color: palette.loss,
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {tournamentContext}
        </Text>
      ) : null}

      {heroImageUrl ? (
        <Section style={{ marginTop: 20 }}>
          <Img
            src={heroImageUrl}
            alt={title}
            width="536"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
        </Section>
      ) : null}

      {orderedSections.map((section, index) => (
        <SectionRenderer
          key={section.id}
          section={section}
          index={index}
          tournamentName={tournamentName}
          askQuestionUrl={askQuestionUrl}
        />
      ))}

      <Section style={{ marginTop: 28, textAlign: "center" }}>
        <EmailButton href={editionUrl}>View in browser →</EmailButton>
      </Section>
    </EmailLayout>
  );
};

const samplePreviewSections: EmailRawSection[] = [
  {
    id: "preview-debrief",
    type: "DEBRIEF" satisfies SectionTypeValue,
    order: 0,
    content: {
      body:
        "Tough week on clay. Lost a tight one in the second round but I'm taking the lessons forward.\n\nThe serve held up. The forehand didn't. Back to work.",
      pullQuote: {
        contextLabel: "After the match",
        text: "I'd rather lose like this than win playing safe.",
      },
    },
  },
  {
    id: "preview-results",
    type: "RESULTS" satisfies SectionTypeValue,
    order: 1,
    content: {
      stats: [
        { value: "1-1", label: "W/L" },
        { value: "78%", label: "1st serve" },
        { value: "12", label: "Aces" },
      ],
      matches: [
        {
          result: "W",
          opponentName: "J. Doe",
          opponentRank: "ATP #45",
          opponentCountry: "🇫🇷",
          score: "6-3 7-5",
          roundName: "Round 1",
          date: "Apr 9",
        },
        {
          result: "L",
          opponentName: "M. Smith",
          opponentRank: "ATP #12",
          opponentCountry: "🇪🇸",
          score: "4-6 6-7",
          roundName: "Round 2",
          date: "Apr 11",
          commentary: "Lost the tiebreak by a single point. Will replay this one in my head.",
        },
      ],
    },
  },
  {
    id: "preview-whatsnext",
    type: "WHATS_NEXT" satisfies SectionTypeValue,
    order: 2,
    content: {
      tournamentMeta: "ATP 500 · Hard · Madrid",
      body: "Quick turnaround. Back on hard courts next week.",
      schedule: [
        {
          dateRange: "Apr 22–28",
          title: "Madrid Open",
          description: "Singles main draw, qualifier TBD.",
        },
      ],
    },
  },
];

NewsletterEmail.PreviewProps = {
  title: "Monte Carlo: the comeback nobody saw",
  heroImageUrl: null,
  editionNumber: 1,
  athleteName: "Flavio Cobolli",
  editionUrl: "https://halocollective.co/flavio-cobolli?edition=monte-carlo-comeback",
  askQuestionUrl:
    "https://halocollective.co/athletes/flavio-cobolli/feedback",
  tournamentName: "Monte Carlo",
  tournamentContext: null,
  sections: samplePreviewSections,
  previewText: "The comeback nobody saw",
} satisfies NewsletterEmailProps;

export default NewsletterEmail;
