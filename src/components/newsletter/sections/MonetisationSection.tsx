import Image from "next/image";
import type { MonetisationBlock } from "@/lib/schemas/newsletterSection";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import MonetisationItemBlock from "@/components/newsletter/blocks/MonetisationItemBlock";

interface MonetisationSectionProps {
  blocks: MonetisationBlock[];
}

export default function MonetisationSection({ blocks }: MonetisationSectionProps) {
  if (blocks.length === 0) return null;

  const [anchor, ...rest] = blocks;
  const anchorParagraphs = splitParagraphs(anchor.body);
  const heroImage =
    anchor.media && anchor.media.kind === "image" ? anchor.media : null;

  return (
    <div className="space-y-6">
      {heroImage ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-cream-3">
          <Image
            src={heroImage.url}
            alt={heroImage.alt ?? ""}
            fill
            sizes="(max-width: 820px) 100vw, 820px"
            className="object-cover"
            unoptimized
            referrerPolicy="no-referrer"
          />
        </div>
      ) : null}

      {anchorParagraphs.length > 0 ? (
        <div className="space-y-2 text-[14px] leading-[1.55] text-ink-2">
          {anchorParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : null}

      <a
        href={anchor.cta.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-xl bg-action px-4 py-3.5 text-center font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-cream transition-opacity hover:opacity-90"
      >
        {anchor.cta.label} →
      </a>

      {rest.length > 0 ? (
        <ol className="border-t border-line">
          {rest.map((block, i) => (
            <MonetisationItemBlock
              key={block.id}
              block={block}
              index={i + 1}
            />
          ))}
        </ol>
      ) : null}
    </div>
  );
}
