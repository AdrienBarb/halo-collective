import { Fragment } from "react";
import {
  MjmlColumn,
  MjmlSection,
  MjmlText,
} from "@faire/mjml-react";
import type {
  WeekRecapTournamentBlock,
  WeekRecapWeeklyBlock,
} from "@/lib/schemas/newsletterSection";
import HeroMetricBlock from "@/lib/emails/mjml/blocks/HeroMetricBlock";
import MatchCardBlock from "@/lib/emails/mjml/blocks/MatchCardBlock";
import MediaLinkRow from "@/lib/emails/mjml/blocks/MediaLinkRow";
import TournamentSummaryBlock from "@/lib/emails/mjml/blocks/TournamentSummaryBlock";
import { palette, fonts } from "@/lib/emails/_brand/theme";

type WeekRecapBlock = WeekRecapTournamentBlock | WeekRecapWeeklyBlock;

interface WeekRecapSectionProps {
  blocks: WeekRecapBlock[];
}

const GROUPABLE_KINDS = new Set(["hero_metric", "media_link"]);

function groupRuns<T extends { kind: string }>(blocks: T[]): T[][] {
  const groups: T[][] = [];
  for (const block of blocks) {
    const last = groups[groups.length - 1];
    if (
      last &&
      GROUPABLE_KINDS.has(block.kind) &&
      last[0].kind === block.kind
    ) {
      last.push(block);
    } else {
      groups.push([block]);
    }
  }
  return groups;
}

function PortPlaceholder({ kind }: { kind: string }) {
  return (
    <MjmlSection
      backgroundColor={palette.panelMuted}
      padding="14px 32px"
      cssClass="force-light-bg"
    >
      <MjmlColumn>
        <MjmlText
          color={palette.textMuted}
          fontFamily={fonts.mono}
          fontSize="11px"
          letterSpacing="0.12em"
          textTransform="uppercase"
          padding="0"
        >
          [block type &ldquo;{kind}&rdquo; not yet ported to MJML]
        </MjmlText>
      </MjmlColumn>
    </MjmlSection>
  );
}

function renderSingle(block: WeekRecapBlock, key: number) {
  switch (block.kind) {
    case "tournament_summary":
      return <TournamentSummaryBlock key={key} summary={block} />;
    case "match_card":
      return <MatchCardBlock key={key} match={block} />;
    case "media_link":
      return <MediaLinkRow key={key} link={block} />;
    case "hero_metric":
      return null;
    default:
      return <PortPlaceholder key={key} kind={block.kind} />;
  }
}

export default function WeekRecapSection({ blocks }: WeekRecapSectionProps) {
  const groups = groupRuns(blocks);

  return (
    <>
      {groups.map((group, gi) => {
        if (group[0].kind === "hero_metric") {
          const metrics = group as Extract<
            WeekRecapBlock,
            { kind: "hero_metric" }
          >[];
          return (
            <MjmlSection
              key={gi}
              backgroundColor={palette.panel}
              cssClass="force-light-bg"
              padding="0 32px 16px"
            >
              {metrics.map((metric, mi) => (
                <MjmlColumn
                  key={mi}
                  backgroundColor={palette.panelDark}
                  cssClass="force-dark-bg"
                  width={`${100 / metrics.length}%`}
                  padding="14px 8px"
                >
                  <HeroMetricBlock metric={metric} />
                </MjmlColumn>
              ))}
            </MjmlSection>
          );
        }

        if (group[0].kind === "media_link") {
          const links = group as Extract<
            WeekRecapBlock,
            { kind: "media_link" }
          >[];
          return (
            <Fragment key={gi}>
              <MjmlSection
                backgroundColor={palette.panel}
                cssClass="force-light-bg"
                padding="8px 32px 4px"
              >
                <MjmlColumn>
                  <MjmlText
                    color={palette.textMuted}
                    fontFamily={fonts.mono}
                    fontSize="9px"
                    letterSpacing="0.22em"
                    textTransform="uppercase"
                    padding="0"
                  >
                    Media
                  </MjmlText>
                </MjmlColumn>
              </MjmlSection>
              {links.map((link, li) => (
                <MediaLinkRow key={li} link={link} />
              ))}
            </Fragment>
          );
        }

        return (
          <Fragment key={gi}>
            {group.map((b, bi) => renderSingle(b, bi))}
          </Fragment>
        );
      })}
    </>
  );
}
