import type { QuoteBlock as QuoteBlockType } from "@/lib/schemas/newsletterSection";

interface QuoteBlockProps {
  block: QuoteBlockType;
}

export default function QuoteBlock({ block }: QuoteBlockProps) {
  return (
    <blockquote className="rounded-lg bg-cream-2 p-5">
      <p className="font-serif text-lg italic leading-relaxed text-ink">
        “{block.text}”
      </p>
      {block.attribution ? (
        <footer className="mt-3 font-mono text-[10px] uppercase tracking-wide text-ink-3">
          — {block.attribution}
        </footer>
      ) : null}
    </blockquote>
  );
}
