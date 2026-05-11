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
  blocks: unknown;
}

interface SectionRendererProps {
  section: EmailRawSection;
  index: number;
  editionMode: EditionModeValue;
  tournamentName?: string | null;
  /** URL used by FAN_ENGAGEMENT CTAs — points to the web reader. */
  askQuestionUrl?: string | null;
}

function renderBody(
  section: EmailRawSection,
  mode: EditionModeValue,
  ctaUrl: string | null | undefined,
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
          ctaUrl={ctaUrl ?? undefined}
        />
      );
  }
}

export default function SectionRenderer({
  section,
  index,
  editionMode,
  tournamentName,
  askQuestionUrl,
}: SectionRendererProps) {
  if (!isSectionMeaningful(section.type, section.blocks)) return null;

  const body = renderBody(section, editionMode, askQuestionUrl);
  if (body === null) return null;

  const labels = getNewsletterLabels();
  const eyebrow = labels.sections[section.type].eyebrow;
  const number = (index + 1).toString().padStart(2, "0");
  const title = getSectionTitle(section.type, tournamentName);

  return (
    <Section style={{ marginTop: 24 }}>
      <Section
        style={{
          backgroundColor: palette.ink,
          padding: "14px 18px",
        }}
      >
        <Text
          style={{
            margin: 0,
            color: palette.cream3,
            fontFamily: fonts.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {number}&nbsp;&nbsp;|&nbsp;&nbsp;{eyebrow}
        </Text>
        {title ? (
          <Text
            style={{
              margin: "4px 0 0",
              color: palette.cream,
              fontFamily: fonts.sans,
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {title}
          </Text>
        ) : null}
      </Section>
      <Section
        style={{
          backgroundColor: palette.cream2,
          padding: "20px 18px",
        }}
      >
        {body}
      </Section>
    </Section>
  );
}
