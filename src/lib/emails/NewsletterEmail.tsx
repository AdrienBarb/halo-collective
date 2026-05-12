import { Img, Link, Section, Text } from "@react-email/components";
import { EmailLayout } from "@/lib/emails/_brand/EmailLayout";
import { EmailButton, EmailHeading } from "@/lib/emails/_brand/atoms";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import SectionRenderer, {
  type EmailRawSection,
} from "@/lib/emails/SectionRenderer";
import { getTournamentLabel } from "@/lib/newsletter/labels";
import type {
  EditionModeValue,
  SectionTypeValue,
} from "@/lib/schemas/newsletterSection";
import type { Locale } from "@/i18n/locales";
import { formatShortDateNoYear } from "@/lib/utils/formatDate";

export interface NewsletterMessages {
  editionLabel: string;
  footerNote: string;
  unsubscribe: string;
  viewInBrowser: string;
}

interface NewsletterEmailProps {
  title: string;
  heroImageUrl?: string | null;
  editionMode: EditionModeValue;
  athleteName: string;
  editionUrl: string;
  askQuestionUrl?: string | null;
  tournamentName?: string | null;
  tournamentCategory?: string | null;
  tournamentLocation?: string | null;
  tournamentSurface?: string | null;
  tournamentStartDate?: Date | string | null;
  tournamentEndDate?: Date | string | null;
  sections: EmailRawSection[];
  previewText?: string;
  unsubscribeUrl?: string;
  locale: Locale;
  messages: NewsletterMessages;
}

function formatDateRange(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
  locale: Locale,
): string | null {
  const fmt = (d: Date | string | null | undefined): string | null => {
    if (!d) return null;
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return null;
    return formatShortDateNoYear(date, locale);
  };
  const s = fmt(start);
  const e = fmt(end);
  if (s && e) return `${s} – ${e}`;
  return s ?? e ?? null;
}

export const NewsletterEmail = ({
  title,
  heroImageUrl,
  editionMode,
  athleteName,
  editionUrl,
  askQuestionUrl,
  tournamentName,
  tournamentCategory,
  tournamentLocation,
  tournamentSurface,
  tournamentStartDate,
  tournamentEndDate,
  sections,
  previewText,
  unsubscribeUrl = "{{ unsubscribe }}",
  locale,
  messages,
}: NewsletterEmailProps) => {
  const tournamentLabel = getTournamentLabel(tournamentName);
  const tournamentMeta = [
    tournamentCategory,
    tournamentLocation,
    tournamentSurface,
    formatDateRange(tournamentStartDate, tournamentEndDate, locale),
  ]
    .filter(Boolean)
    .join(" · ");
  const orderedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <EmailLayout
      preview={previewText ?? title}
      eyebrow={`${athleteName} · ${messages.editionLabel}`}
      footerNote={
        <>
          {messages.footerNote}{" "}
          <Link
            href={unsubscribeUrl}
            style={{ color: palette.ink3, textDecoration: "underline" }}
          >
            {messages.unsubscribe}
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

      {tournamentMeta ? (
        <Text
          style={{
            margin: "8px 0 0",
            color: palette.ink3,
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          {tournamentMeta}
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
          editionMode={editionMode}
          tournamentName={tournamentName}
          askQuestionUrl={askQuestionUrl}
        />
      ))}

      <Section style={{ marginTop: 28, textAlign: "center" }}>
        <EmailButton href={editionUrl}>{messages.viewInBrowser}</EmailButton>
      </Section>
    </EmailLayout>
  );
};

const samplePreviewSections: EmailRawSection[] = [
  {
    id: "preview-athlete-review",
    type: "ATHLETE_REVIEW" satisfies SectionTypeValue,
    order: 0,
    blocks: [
      {
        kind: "text",
        body:
          "Tough week on clay. Lost a tight one in the second round but I'm taking the lessons forward.\n\nThe serve held up. The forehand didn't. Back to work.",
      },
    ],
  },
  {
    id: "preview-week-recap",
    type: "WEEK_RECAP" satisfies SectionTypeValue,
    order: 1,
    blocks: [
      { kind: "hero_metric", value: "1-1", label: "W/L" },
      { kind: "hero_metric", value: "78%", label: "1st serve" },
      { kind: "hero_metric", value: "12", label: "Aces" },
      {
        kind: "match_card",
        result: "W",
        roundName: "Round 1",
        opponentName: "J. Doe",
        opponentRank: "ATP #45",
        opponentCountry: "FRA",
        score: "6-3 7-5",
        date: "Apr 9",
      },
    ],
  },
  {
    id: "preview-coming-up",
    type: "COMING_UP" satisfies SectionTypeValue,
    order: 2,
    blocks: [
      {
        kind: "text",
        body: "Quick turnaround. Back on hard courts next week.",
      },
      {
        kind: "schedule_item",
        dateRange: "Apr 22–28",
        title: "Madrid Open",
        description: "Singles main draw, qualifier TBD.",
      },
    ],
  },
];

NewsletterEmail.PreviewProps = {
  title: "Monte Carlo: the comeback nobody saw",
  heroImageUrl: null,
  editionMode: "TOURNAMENT" as EditionModeValue,
  athleteName: "Flavio Cobolli",
  editionUrl: "https://halocollective.co/flavio-cobolli?edition=monte-carlo-comeback",
  askQuestionUrl: "https://halocollective.co/athletes/flavio-cobolli/feedback",
  tournamentName: "Monte Carlo",
  tournamentCategory: "ATP Masters 1000",
  tournamentLocation: "Monte Carlo, Monaco",
  tournamentSurface: "Clay",
  tournamentStartDate: null,
  tournamentEndDate: null,
  sections: samplePreviewSections,
  previewText: "The comeback nobody saw",
  locale: "en",
  messages: {
    editionLabel: "Edition #01",
    footerNote:
      "You're receiving this because you subscribed to Flavio Cobolli's edition on Halo Collective.",
    unsubscribe: "Unsubscribe",
    viewInBrowser: "View in browser →",
  },
} satisfies NewsletterEmailProps;

export default NewsletterEmail;
