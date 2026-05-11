import { Section } from "@react-email/components";
import type {
  WeekRecapTournamentBlock,
  WeekRecapWeeklyBlock,
} from "@/lib/schemas/newsletterSection";
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

function renderBlock(block: WeekRecapBlock, key: number): React.ReactNode {
  switch (block.kind) {
    case "tournament_summary":
      return <TournamentSummaryBlock key={key} summary={block} />;
    case "match_card":
      return <MatchCardBlock key={key} match={block} />;
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
      return <MediaRecapBlock key={key} block={block} />;
    case "stats_update":
      return <StatsUpdateBlock key={key} block={block} />;
    case "quote":
      return <QuoteBlock key={key} block={block} />;
    case "hero_metric":
      return null;
  }
}

export default function WeekRecapSection({ blocks }: WeekRecapSectionProps) {
  const groups = groupRuns(blocks);
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
              <MediaLinkGroupHeader />
              {group.map((link, li) => (
                <MediaLinkRow
                  key={li}
                  link={link as Extract<WeekRecapBlock, { kind: "media_link" }>}
                />
              ))}
            </Section>
          );
        }
        return (
          <Section key={gi}>{group.map((b, bi) => renderBlock(b, bi))}</Section>
        );
      })}
    </Section>
  );
}
