import { Section, Text } from "@react-email/components";
import {
  isSectionMeaningful,
  safeParseSectionBlocks,
  type AthleteReviewBlock,
  type ComingUpBlock,
  type EditionModeValue,
  type FanEngagementBlock,
  type MonetisationBlock,
  type SectionTypeValue,
  type WeekRecapTournamentBlock,
  type WeekRecapWeeklyBlock,
} from "@/lib/schemas/newsletterSection";
import {
  getNewsletterLabels,
  getSectionTitle,
  type NewsletterLocale,
} from "@/lib/newsletter/labels";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import AthleteReviewSection from "@/lib/emails/sections/AthleteReviewSection";
import ComingUpSection from "@/lib/emails/sections/ComingUpSection";
import FanEngagementSection from "@/lib/emails/sections/FanEngagementSection";
import MonetisationSection from "@/lib/emails/sections/MonetisationSection";
import WeekRecapSection from "@/lib/emails/sections/WeekRecapSection";

export interface EmailRawSection {
  id: string;
  type: SectionTypeValue;
  order: number;
  eyebrow: string | null;
  title: string | null;
  blocks: unknown;
}

interface SectionRendererProps {
  section: EmailRawSection;
  index: number;
  editionMode: EditionModeValue;
  tournamentName?: string | null;
  /** Web reader URL for this edition — used by vote / prize-draw / quiz / survey CTAs. */
  editionUrl: string;
  /** Feedback form URL — used by Q&A "Ask me anything" CTA. */
  askQuestionUrl?: string | null;
  locale: NewsletterLocale;
}

function renderBody(
  section: EmailRawSection,
  mode: EditionModeValue,
  editionUrl: string,
  askQuestionUrl: string | null | undefined,
  locale: NewsletterLocale,
): React.ReactNode {
  const parsed = safeParseSectionBlocks(section.type, mode, section.blocks);
  if (!parsed.success) return null;

  switch (section.type) {
    case "ATHLETE_REVIEW":
      return (
        <AthleteReviewSection blocks={parsed.data as AthleteReviewBlock[]} />
      );
    case "WEEK_RECAP":
      return (
        <WeekRecapSection
          blocks={
            parsed.data as Array<WeekRecapTournamentBlock | WeekRecapWeeklyBlock>
          }
          locale={locale}
        />
      );
    case "COMING_UP":
      return <ComingUpSection blocks={parsed.data as ComingUpBlock[]} />;
    case "MONETISATION":
      return (
        <MonetisationSection blocks={parsed.data as MonetisationBlock[]} />
      );
    case "FAN_ENGAGEMENT":
      return (
        <FanEngagementSection
          blocks={parsed.data as FanEngagementBlock[]}
          editionUrl={editionUrl}
          askQuestionUrl={askQuestionUrl ?? undefined}
        />
      );
  }
}

export default function SectionRenderer({
  section,
  index,
  editionMode,
  tournamentName,
  editionUrl,
  askQuestionUrl,
  locale,
}: SectionRendererProps) {
  if (!isSectionMeaningful(section.type, section.blocks)) return null;

  const body = renderBody(
    section,
    editionMode,
    editionUrl,
    askQuestionUrl,
    locale,
  );
  if (body === null) return null;

  const labels = getNewsletterLabels(locale);
  const eyebrow =
    section.eyebrow?.trim() || labels.sections[section.type].eyebrow;
  const number = (index + 1).toString().padStart(2, "0");
  // Explicit string|null annotation — same reasoning as the web renderer.
  const title: string | null =
    section.title?.trim() || getSectionTitle(section.type, tournamentName, locale);

  return (
    <Section style={{ marginTop: 8 }}>
      <Section
        className="force-dark-bg"
        style={{
          backgroundColor: palette.panelDark,
          padding: "18px 32px 14px",
        }}
      >
        <Text
          className="force-dark-fg-muted"
          style={{
            margin: 0,
            color: palette.textOnDark,
            fontFamily: fonts.display,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          {number}&nbsp;&nbsp;|&nbsp;&nbsp;{eyebrow}
        </Text>
        {title ? (
          <Text
            className="force-dark-fg"
            style={{
              margin: "6px 0 0",
              color: palette.textOnDark,
              fontFamily: fonts.display,
              fontSize: 20,
              fontWeight: 900,
              lineHeight: 1.2,
            }}
          >
            {title}
          </Text>
        ) : null}
      </Section>
      <Section
        className="force-light-bg"
        style={{
          backgroundColor: palette.panel,
          padding: "24px 32px",
        }}
      >
        {body}
      </Section>
    </Section>
  );
}
