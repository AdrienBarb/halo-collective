import type { MonetisationBlock } from "@/lib/schemas/newsletterSection";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import MediaBlock from "@/components/newsletter/blocks/MediaBlock";

interface MonetisationItemBlockProps {
  block: MonetisationBlock;
}

function kindExtra(block: MonetisationBlock): string | null {
  switch (block.kind) {
    case "kit":
    case "athlete_product":
      return block.price ?? null;
    case "partner_content":
      return block.partnerName ?? null;
    case "donation":
      return block.goalLabel ?? null;
    case "fan_experience":
      return block.dateLabel ?? null;
    default:
      return null;
  }
}

export default function MonetisationItemBlock({
  block,
}: MonetisationItemBlockProps) {
  const labels = getNewsletterLabels();
  const eyebrow = labels.monetisationEyebrows[block.kind];
  const extra = kindExtra(block);
  const paragraphs = splitParagraphs(block.body);

  return (
    <article className="space-y-3 border-b border-line pb-5 last:border-b-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-action">
          {eyebrow}
        </div>
        {extra ? (
          <div className="font-mono text-[10px] uppercase tracking-wide text-ink-3">
            {extra}
          </div>
        ) : null}
      </div>
      {block.media ? <MediaBlock media={block.media} /> : null}
      <div>
        <h4 className="text-base font-bold text-ink">{block.title}</h4>
        {paragraphs.length > 0 ? (
          <div className="mt-2 space-y-2 text-sm text-ink-2">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : null}
      </div>
      <a
        href={block.cta.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded bg-action px-4 py-3 text-sm font-bold uppercase tracking-wide text-cream transition hover:opacity-90"
      >
        {block.cta.label}
      </a>
    </article>
  );
}
