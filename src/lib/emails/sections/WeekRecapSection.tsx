import { Section, Text } from "@react-email/components";
import type {
  WeekRecapTournamentBlock,
  WeekRecapWeeklyBlock,
} from "@/lib/schemas/newsletterSection";
import type { NewsletterLocale } from "@/lib/newsletter/labels";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import HeroMetricBlock from "@/lib/emails/blocks/HeroMetricBlock";
import MatchCardBlock from "@/lib/emails/blocks/MatchCardBlock";
import MediaLinkRow from "@/lib/emails/blocks/MediaLinkRow";
import MediaRecapBlock, {
  MediaLinkGroupHeader,
} from "@/lib/emails/blocks/MediaRecapBlock";
import QuoteBlock from "@/lib/emails/blocks/QuoteBlock";
import SocialRecapBlock from "@/lib/emails/blocks/SocialRecapBlock";
import StatsUpdateBlock from "@/lib/emails/blocks/StatsUpdateBlock";
import TextUpdateBlock from "@/lib/emails/blocks/TextUpdateBlock";
import TournamentSummaryBlock from "@/lib/emails/blocks/TournamentSummaryBlock";

type WeekRecapBlock = WeekRecapTournamentBlock | WeekRecapWeeklyBlock;

interface WeekRecapSectionProps {
  blocks: WeekRecapBlock[];
  locale: NewsletterLocale;
}

const GROUPABLE_KINDS = new Set(["hero_metric", "media_link", "match_card"]);

const MATCH_FORMAT_LABELS: Record<"singles" | "doubles", string> = {
  singles: "Simples",
  doubles: "Doubles",
};

// Group key: match_card runs are split by format so singles and doubles
// land in separate groups even when interleaved. Other groupable kinds
// just key on `kind`.
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
    <Text
      style={{
        margin: "0 0 4px",
        color: palette.textMuted,
        fontFamily: fonts.mono,
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      {MATCH_FORMAT_LABELS[format]}
    </Text>
  );
}

function renderBlock(
  block: WeekRecapBlock,
  key: number,
  locale: NewsletterLocale,
): React.ReactNode {
  switch (block.kind) {
    case "tournament_summary":
      return <TournamentSummaryBlock key={key} summary={block} />;
    case "match_card":
      return null; // handled by grouping
    case "media_link":
      return <MediaLinkRow key={key} link={block} />;
    case "training_update":
      return <TextUpdateBlock key={key} eyebrow="Training" body={block.body} media={block.media} />;
    case "recovery_travel_update":
      return <TextUpdateBlock key={key} eyebrow="Off-court" body={block.body} media={block.media} />;
    case "throwback":
      return <TextUpdateBlock key={key} eyebrow="Throwback" body={block.body} media={block.media} />;
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
  // Only label match groups when both formats are present in the section
  // — a singles-only or doubles-only recap reads cleaner without a header.
  const matchFormatsPresent = new Set(
    blocks.flatMap((b) => (b.kind === "match_card" ? [b.format] : [])),
  );
  const showMatchFormatHeaders = matchFormatsPresent.size > 1;
  return (
    <Section>
      {groups.map((group, gi) => {
        if (group[0].kind === "hero_metric") {
          return (
            <Section key={gi} style={{ marginBottom: 16 }}>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "4px 0",
                }}
              >
                <tbody>
                  <tr>
                    {group.map((metric, mi) => (
                      <td key={mi} style={{ width: `${100 / group.length}%` }}>
                        <HeroMetricBlock
                          metric={
                            metric as Extract<
                              WeekRecapBlock,
                              { kind: "hero_metric" }
                            >
                          }
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </Section>
          );
        }
        if (group[0].kind === "media_link") {
          return (
            <Section key={gi} style={{ marginBottom: 16 }}>
              <MediaLinkGroupHeader locale={locale} />
              {group.map((link, li) => (
                <MediaLinkRow
                  key={li}
                  link={link as Extract<WeekRecapBlock, { kind: "media_link" }>}
                />
              ))}
            </Section>
          );
        }
        if (group[0].kind === "match_card") {
          const head = group[0] as Extract<WeekRecapBlock, { kind: "match_card" }>;
          return (
            <Section key={gi} style={{ marginBottom: 8 }}>
              {showMatchFormatHeaders && (
                <MatchFormatHeader format={head.format} />
              )}
              {group.map((match, mi) => (
                <MatchCardBlock
                  key={mi}
                  match={
                    match as Extract<WeekRecapBlock, { kind: "match_card" }>
                  }
                  locale={locale}
                />
              ))}
            </Section>
          );
        }
        return (
          <Section key={gi}>
            {group.map((b, bi) => renderBlock(b, bi, locale))}
          </Section>
        );
      })}
    </Section>
  );
}
