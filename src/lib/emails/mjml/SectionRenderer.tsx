import { Fragment } from "react";
import { MjmlColumn, MjmlSection, MjmlText } from "@faire/mjml-react";
import {
  isSectionMeaningful,
  safeParseSectionBlocks,
  type EditionModeValue,
  type SectionTypeValue,
  type WeekRecapTournamentBlock,
  type WeekRecapWeeklyBlock,
} from "@/lib/schemas/newsletterSection";
import {
  getNewsletterLabels,
  getSectionTitle,
} from "@/lib/newsletter/labels";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import WeekRecapSection from "@/lib/emails/mjml/sections/WeekRecapSection";

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
}

function PortPlaceholder({ type }: { type: SectionTypeValue }) {
  return (
    <MjmlSection
      backgroundColor={palette.panelMuted}
      cssClass="force-light-bg"
      padding="20px 32px"
    >
      <MjmlColumn>
        <MjmlText
          color={palette.textMuted}
          fontFamily={fonts.mono}
          fontSize="11px"
          letterSpacing="0.18em"
          textTransform="uppercase"
          padding="0"
        >
          [Section type &ldquo;{type}&rdquo; not yet ported to MJML]
        </MjmlText>
      </MjmlColumn>
    </MjmlSection>
  );
}

function renderBody(
  section: EmailRawSection,
  mode: EditionModeValue,
): React.ReactNode {
  const parsed = safeParseSectionBlocks(section.type, mode, section.blocks);
  if (!parsed.success) return null;

  if (section.type === "WEEK_RECAP") {
    return (
      <WeekRecapSection
        blocks={
          parsed.data as Array<WeekRecapTournamentBlock | WeekRecapWeeklyBlock>
        }
      />
    );
  }

  return <PortPlaceholder type={section.type} />;
}

export default function SectionRenderer({
  section,
  index,
  editionMode,
  tournamentName,
}: SectionRendererProps) {
  if (!isSectionMeaningful(section.type, section.blocks)) return null;

  const body = renderBody(section, editionMode);
  if (body === null) return null;

  const labels = getNewsletterLabels();
  const eyebrow = labels.sections[section.type].eyebrow;
  const number = (index + 1).toString().padStart(2, "0");
  const title = getSectionTitle(section.type, tournamentName);

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
        padding="24px 0 0"
      >
        <MjmlColumn padding="0" />
      </MjmlSection>

      {body}

      <MjmlSection
        backgroundColor={palette.panel}
        cssClass="force-light-bg"
        padding="0 0 8px"
      >
        <MjmlColumn padding="0" />
      </MjmlSection>
    </Fragment>
  );
}
