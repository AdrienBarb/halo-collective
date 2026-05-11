import type { DebriefContent } from "@/lib/schemas/newsletterSection";
import MediaBlock from "@/components/newsletter/blocks/MediaBlock";

interface DebriefSectionProps {
  content: DebriefContent;
}

function splitParagraphs(body: string | undefined): string[] {
  if (!body) return [];
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function DebriefSection({ content }: DebriefSectionProps) {
  const paragraphs = splitParagraphs(content.body);

  return (
    <div className="space-y-6">
      {content.media ? <MediaBlock media={content.media} /> : null}

      {paragraphs.length > 0 ? (
        <div className="space-y-4 text-[15px] leading-[1.75] text-ink-2">
          {paragraphs.map((p, i) => (
            <p key={i} className="font-serif italic">
              {p}
            </p>
          ))}
        </div>
      ) : null}

      {content.pullQuote ? (
        <blockquote className="rounded bg-cream-2 p-4">
          {content.pullQuote.contextLabel ? (
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
              {content.pullQuote.contextLabel}
            </div>
          ) : null}
          <p className="font-serif text-sm italic leading-relaxed text-ink-2">
            “{content.pullQuote.text}”
          </p>
        </blockquote>
      ) : null}
    </div>
  );
}
