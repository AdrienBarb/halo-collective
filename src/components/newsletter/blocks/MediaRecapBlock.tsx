import type { MediaRecapBlock as MediaRecapBlockType } from "@/lib/schemas/newsletterSection";
import MediaLinkRow from "@/components/newsletter/blocks/MediaLinkRow";

interface MediaRecapBlockProps {
  block: MediaRecapBlockType;
}

export default function MediaRecapBlock({ block }: MediaRecapBlockProps) {
  return (
    <div className="space-y-3">
      <MediaLinkGroupHeader count={block.links.length} />
      <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {block.links.map((link, i) => (
          <MediaLinkRow key={i} link={link} asCard />
        ))}
      </div>
    </div>
  );
}

export function MediaLinkGroupHeader({ count }: { count?: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="font-serif text-[16px] font-medium leading-tight text-ink">
        What they wrote
      </div>
      {typeof count === "number" && count > 0 ? (
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
          {count} {count === 1 ? "article" : "articles"}
        </div>
      ) : null}
    </div>
  );
}
