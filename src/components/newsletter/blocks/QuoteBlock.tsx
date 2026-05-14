import type { QuoteBlock as QuoteBlockType } from "@/lib/schemas/newsletterSection";

interface QuoteBlockProps {
  block: QuoteBlockType;
}

export default function QuoteBlock({ block }: QuoteBlockProps) {
  return (
    <blockquote className="border-l-[3px] border-accent-gold py-1 pl-5 forced-colors:border-[CanvasText]">
      {block.attribution ? (
        <footer className="mb-3 border-b border-line pb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
          {block.attribution}
        </footer>
      ) : null}
      <p className="font-serif text-lg italic leading-relaxed text-ink">
        {`"${block.text}"`}
      </p>
    </blockquote>
  );
}
