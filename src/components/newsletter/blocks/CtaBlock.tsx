import type { CtaBlock as CtaBlockType } from "@/lib/schemas/newsletterSection";

interface CtaBlockProps {
  block: CtaBlockType;
}

export default function CtaBlock({ block }: CtaBlockProps) {
  return (
    <a
      href={block.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center rounded bg-action px-4 py-3 font-display text-[13px] font-bold uppercase tracking-[0.12em] text-cream transition hover:opacity-90"
    >
      {block.label}
    </a>
  );
}
