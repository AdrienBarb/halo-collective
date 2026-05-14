import type { MonetisationBlock } from "@/lib/schemas/newsletterSection";

// The list-row renderer handles commerce blocks only; phase_timeline is
// rendered upstream via PhaseTimelineBlock (no title/cta to display here).
type CommercialBlock = Exclude<MonetisationBlock, { kind: "phase_timeline" }>;

interface MonetisationItemBlockProps {
  block: CommercialBlock;
  /** 1-based row number shown as the "01 / 02" badge. */
  index: number;
}

export default function MonetisationItemBlock({
  block,
  index,
}: MonetisationItemBlockProps) {
  const numberLabel = index.toString().padStart(2, "0");

  return (
    <li className="flex items-start gap-4 border-b border-line py-4 last:border-b-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-cream font-mono text-[11px] font-bold tracking-[0.08em] text-ink">
        {numberLabel}
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="text-[14px] font-semibold leading-snug text-ink">
          {block.title}
        </h4>
        {block.body ? (
          <p className="mt-1 text-[13px] leading-[1.5] text-ink-3">
            {block.body}
          </p>
        ) : null}
      </div>
      <a
        href={block.cta.url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 self-center font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-action transition-opacity hover:opacity-80"
      >
        {block.cta.label} →
      </a>
    </li>
  );
}
