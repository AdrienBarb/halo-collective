import type { RecoveryTravelUpdateBlock as RecoveryTravelUpdateBlockType } from "@/lib/schemas/newsletterSection";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import MediaBlock from "@/components/newsletter/blocks/MediaBlock";

interface RecoveryTravelUpdateBlockProps {
  block: RecoveryTravelUpdateBlockType;
}

export default function RecoveryTravelUpdateBlock({
  block,
}: RecoveryTravelUpdateBlockProps) {
  const paragraphs = splitParagraphs(block.body);
  return (
    <div className="space-y-4">
      <div className="font-sans text-[10px] uppercase tracking-[0.18em] text-ink-3">
        Off-court
      </div>
      {block.media ? <MediaBlock media={block.media} /> : null}
      <div className="space-y-3 text-sm leading-relaxed text-ink-2">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
