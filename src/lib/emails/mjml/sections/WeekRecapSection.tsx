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
import type { NewsletterLocale } from "@/lib/newsletter/labels";
import HeroMetricBlock from "@/lib/emails/mjml/blocks/HeroMetricBlock";
import MatchCardBlock from "@/lib/emails/mjml/blocks/MatchCardBlock";
import MediaLinkRow from "@/lib/emails/mjml/blocks/MediaLinkRow";
import MediaRecapBlock, {
  MediaLinkGroupHeader,
} from "@/lib/emails/mjml/blocks/MediaRecapBlock";
import QuoteBlock from "@/lib/emails/mjml/blocks/QuoteBlock";
import SocialRecapBlock from "@/lib/emails/mjml/blocks/SocialRecapBlock";
import StatsUpdateBlock from "@/lib/emails/mjml/blocks/StatsUpdateBlock";
import TextUpdateBlock from "@/lib/emails/mjml/blocks/TextUpdateBlock";
import TournamentSummaryBlock from "@/lib/emails/mjml/blocks/TournamentSummaryBlock";
import { palette, fonts } from "@/lib/emails/_brand/theme";

type WeekRecapBlock = WeekRecapTournamentBlock | WeekRecapWeeklyBlock;

interface WeekRecapSectionProps {
  blocks: WeekRecapBlock[];
  locale: NewsletterLocale;
}

const GROUPABLE_KINDS = new Set(["hero_metric", "media_link", "match_card"]);

// Format labels are hardcoded EN strings on the web reader / React Email
// renderer too — they're identical in both languages for tennis.
const MATCH_FORMAT_LABELS: Record<"singles" | "doubles", string> = {
  singles: "Simples",
  doubles: "Doubles",
};

// Group key: match_card runs are split by format so singles and doubles
// land in separate groups even when interleaved.
function groupKeyOf(block: WeekRecapBlock): string {
  if (block.kind === "match_card") return `match_card:${block.format}`;
  return block.kind;
}

function groupRuns(blocks: WeekRecapBlock[]): WeekRecapBlock[][] {
  const groups: WeekRecapBlock[][] = [];
  for (const block of blocks) {
    const last = groups[groups.length - 1];
    if (
      last &&
      GROUPABLE_KINDS.has(block.kind) &&
      groupKeyOf(last[0]) === groupKeyOf(block)
    ) {
      last.push(block);
    } else {
      groups.push([block]);
    }
  }
  return groups;
}

function MatchFormatHeader({ format }: { format: "singles" | "doubles" }) {
  return (
    <MjmlSection
      backgroundColor={palette.panel}
      cssClass="force-light-bg"
      padding="0 32px 4px"
    >
      <MjmlColumn padding="0">
        <MjmlText
          color={palette.textMuted}
          fontFamily={fonts.mono}
          fontSize="10px"
          letterSpacing="0.18em"
          textTransform="uppercase"
          padding="0"
        >
          {MATCH_FORMAT_LABELS[format]}
        </MjmlText>
      </MjmlColumn>
    </MjmlSection>
  );
}

function renderSingle(
  block: WeekRecapBlock,
  key: number,
  locale: NewsletterLocale,
): React.ReactNode {
  switch (block.kind) {
    case "tournament_summary":
      return <TournamentSummaryBlock key={key} summary={block} />;
    case "match_card":
      // Handled by the grouped branch in WeekRecapSection — match_card is in
      // GROUPABLE_KINDS, so a singleton run is still rendered as a 1-item group.
      return null;
    case "media_link":
      return <MediaLinkRow key={key} link={block} />;
    case "training_update":
      return (
        <TextUpdateBlock
          key={key}
          eyebrow="Training"
          body={block.body}
          media={block.media}
        />
      );
    case "recovery_travel_update":
      return (
        <TextUpdateBlock
          key={key}
          eyebrow="Off-court"
          body={block.body}
          media={block.media}
        />
      );
    case "throwback":
      return (
        <TextUpdateBlock
          key={key}
          eyebrow="Throwback"
          body={block.body}
          media={block.media}
        />
      );
    case "social_recap":
      return <SocialRecapBlock key={key} block={block} />;
    case "media_recap":
      return <MediaRecapBlock key={key} block={block} locale={locale} />;
    case "stats_update":
      return <StatsUpdateBlock key={key} block={block} />;
    case "quote":
      return <QuoteBlock key={key} block={block} />;
    case "hero_metric":
      return null;
  }
}

export default function WeekRecapSection({
  blocks,
  locale,
}: WeekRecapSectionProps) {
  const groups = groupRuns(blocks);
  // Only label match groups when both formats are present in the section.
  const matchFormatsPresent = new Set(
    blocks.flatMap((b) => (b.kind === "match_card" ? [b.format] : [])),
  );
  const showMatchFormatHeaders = matchFormatsPresent.size > 1;

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
              <MediaLinkGroupHeader locale={locale} />
              {links.map((link, li) => (
                <MediaLinkRow key={li} link={link} />
              ))}
            </Fragment>
          );
        }

        if (group[0].kind === "match_card") {
          const matches = group as Extract<
            WeekRecapBlock,
            { kind: "match_card" }
          >[];
          const head = matches[0];
          return (
            <Fragment key={gi}>
              {showMatchFormatHeaders ? (
                <MatchFormatHeader format={head.format} />
              ) : null}
              {matches.map((match, mi) => (
                <MatchCardBlock key={mi} match={match} locale={locale} />
              ))}
            </Fragment>
          );
        }

        return (
          <Fragment key={gi}>
            {group.map((b, bi) => renderSingle(b, bi, locale))}
          </Fragment>
        );
      })}
    </>
  );
}
