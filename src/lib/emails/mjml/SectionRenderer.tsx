import { Fragment } from "react";
import {
  MjmlColumn,
  MjmlSection,
  MjmlSpacer,
  MjmlText,
} from "@faire/mjml-react";
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
import AthleteReviewSection from "@/lib/emails/mjml/sections/AthleteReviewSection";
import ComingUpSection from "@/lib/emails/mjml/sections/ComingUpSection";
import FanEngagementSection from "@/lib/emails/mjml/sections/FanEngagementSection";
import MonetisationSection from "@/lib/emails/mjml/sections/MonetisationSection";
import WeekRecapSection from "@/lib/emails/mjml/sections/WeekRecapSection";

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
        <AthleteReviewSection
          blocks={parsed.data as AthleteReviewBlock[]}
          locale={locale}
        />
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
      return (
        <ComingUpSection
          blocks={parsed.data as ComingUpBlock[]}
          locale={locale}
        />
      );
    case "MONETISATION":
      return (
        <MonetisationSection
          blocks={parsed.data as MonetisationBlock[]}
          locale={locale}
        />
      );
    case "FAN_ENGAGEMENT":
      return (
        <FanEngagementSection
          blocks={parsed.data as FanEngagementBlock[]}
          editionUrl={editionUrl}
          askQuestionUrl={askQuestionUrl ?? undefined}
          locale={locale}
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
  const title: string | null =
    section.title?.trim() ||
    getSectionTitle(section.type, tournamentName, locale);

  return (
    <Fragment>
      <MjmlSection
        backgroundColor={palette.panelDark}
        cssClass="force-dark-bg"
        padding="18px 32px 14px"
      >
        <MjmlColumn>
          <MjmlText
            cssClass="force-dark-fg-muted"
            color={palette.textOnDark}
            fontFamily={fonts.display}
            fontSize="10px"
            fontWeight="700"
            letterSpacing="0.25em"
            textTransform="uppercase"
            padding="0"
          >
            {number}&nbsp;&nbsp;|&nbsp;&nbsp;{eyebrow}
          </MjmlText>
          {title ? (
            <MjmlText
              cssClass="force-dark-fg"
              color={palette.textOnDark}
              fontFamily={fonts.display}
              fontSize="20px"
              fontWeight="900"
              lineHeight="1.2"
              padding="6px 0 0"
            >
              {title}
            </MjmlText>
          ) : null}
        </MjmlColumn>
      </MjmlSection>

      <MjmlSection
        backgroundColor={palette.panel}
        cssClass="force-light-bg"
        padding="0"
      >
        <MjmlColumn padding="0">
          <MjmlSpacer height="24px" />
        </MjmlColumn>
      </MjmlSection>

      {body}

      <MjmlSection
        backgroundColor={palette.panel}
        cssClass="force-light-bg"
        padding="0"
      >
        <MjmlColumn padding="0">
          <MjmlSpacer height="8px" />
        </MjmlColumn>
      </MjmlSection>
    </Fragment>
  );
}
