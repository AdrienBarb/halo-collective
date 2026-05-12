import type {
  WeekRecapTournamentBlock,
  WeekRecapWeeklyBlock,
} from "@/lib/schemas/newsletterSection";
import HeroMetricBlock from "@/components/newsletter/blocks/HeroMetricBlock";
import MatchCardBlock from "@/components/newsletter/blocks/MatchCardBlock";
import MediaLinkRow from "@/components/newsletter/blocks/MediaLinkRow";
import MediaRecapBlock, {
  MediaLinkGroupHeader,
} from "@/components/newsletter/blocks/MediaRecapBlock";
import QuoteBlock from "@/components/newsletter/blocks/QuoteBlock";
import RecoveryTravelUpdateBlock from "@/components/newsletter/blocks/RecoveryTravelUpdateBlock";
import SocialRecapBlock from "@/components/newsletter/blocks/SocialRecapBlock";
import StatsUpdateBlock from "@/components/newsletter/blocks/StatsUpdateBlock";
import ThrowbackBlock from "@/components/newsletter/blocks/ThrowbackBlock";
import TournamentSummaryBlock from "@/components/newsletter/blocks/TournamentSummaryBlock";
import TrainingUpdateBlock from "@/components/newsletter/blocks/TrainingUpdateBlock";

type WeekRecapBlock = WeekRecapTournamentBlock | WeekRecapWeeklyBlock;

interface WeekRecapSectionProps {
  blocks: WeekRecapBlock[];
}

// Group hero_metric blocks so they render side-by-side as a stat row,
// matching the tournament-recap visual rhythm. Also group consecutive
// media_link blocks so we can render them under a single "What they
// wrote" header instead of leaving press rows headerless. Non-grouped
// blocks render inline in their original order.
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
      return (
        <div key={key}>
          <MediaLinkRow link={block} />
        </div>
      );
    case "training_update":
      return <TrainingUpdateBlock key={key} block={block} />;
    case "recovery_travel_update":
      return <RecoveryTravelUpdateBlock key={key} block={block} />;
    case "social_recap":
      return <SocialRecapBlock key={key} block={block} />;
    case "media_recap":
      return <MediaRecapBlock key={key} block={block} />;
    case "stats_update":
      return <StatsUpdateBlock key={key} block={block} />;
    case "throwback":
      return <ThrowbackBlock key={key} block={block} />;
    case "quote":
      return <QuoteBlock key={key} block={block} />;
    case "hero_metric":
      return null; // handled by grouping
  }
}

export default function WeekRecapSection({ blocks }: WeekRecapSectionProps) {
  const groups = groupRuns(blocks);
  return (
    <div className="space-y-5">
      {groups.map((group, gi) => {
        if (group[0].kind === "hero_metric") {
          return (
            <div key={gi} className="flex gap-2">
              {group.map((metric, mi) => (
                <HeroMetricBlock
                  key={mi}
                  metric={metric as Extract<WeekRecapBlock, { kind: "hero_metric" }>}
                />
              ))}
            </div>
          );
        }
        if (group[0].kind === "media_link") {
          return (
            <div key={gi} className="space-y-3">
              <MediaLinkGroupHeader count={group.length} />
              <div className="-mr-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 pr-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {group.map((link, li) => (
                  <MediaLinkRow
                    key={li}
                    asCard
                    link={link as Extract<WeekRecapBlock, { kind: "media_link" }>}
                  />
                ))}
              </div>
            </div>
          );
        }
        return <div key={gi}>{group.map((b, bi) => renderBlock(b, bi))}</div>;
      })}
    </div>
  );
}
