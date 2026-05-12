import type { StatsUpdateBlock as StatsUpdateBlockType } from "@/lib/schemas/newsletterSection";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";

interface StatsUpdateBlockProps {
  block: StatsUpdateBlockType;
}

export default function StatsUpdateBlock({ block }: StatsUpdateBlockProps) {
  const paragraphs = splitParagraphs(block.body);
  const hasRanking = block.rankingCurrent || block.rankingChange;

  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
        Ranking & stats
      </div>
      {hasRanking ? (
        <div className="flex items-baseline gap-3 rounded bg-cream-2 px-4 py-3">
          {block.rankingCurrent ? (
            <span className="font-mono text-2xl font-bold text-ink">
              {block.rankingCurrent}
            </span>
          ) : null}
          {block.rankingChange ? (
            <span className="font-mono text-[11px] uppercase tracking-wide text-ink-3">
              {block.rankingChange}
            </span>
          ) : null}
        </div>
      ) : null}
      {paragraphs.length > 0 ? (
        <div className="space-y-3 text-sm leading-relaxed text-ink-2">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
