import type { ThrowbackBlock as ThrowbackBlockType } from "@/lib/schemas/newsletterSection";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import MediaBlock from "@/components/newsletter/blocks/MediaBlock";

interface ThrowbackBlockProps {
  block: ThrowbackBlockType;
}

export default function ThrowbackBlock({ block }: ThrowbackBlockProps) {
  const paragraphs = splitParagraphs(block.body);
  return (
    <div className="space-y-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
        Throwback
      </div>
      {block.media ? <MediaBlock media={block.media} /> : null}
      <div className="space-y-3 font-serif text-sm italic leading-relaxed text-ink-2">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
