import type { WhatsNextContent } from "@/lib/schemas/newsletterSection";
import MediaBlock from "@/components/newsletter/blocks/MediaBlock";

interface WhatsNextSectionProps {
  content: WhatsNextContent;
}

export default function WhatsNextSection({ content }: WhatsNextSectionProps) {
  return (
    <div className="space-y-6">
      {content.media ? <MediaBlock media={content.media} /> : null}

      {content.tournamentMeta ? (
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
          {content.tournamentMeta}
        </div>
      ) : null}

      {content.body ? (
        <div className="space-y-3 text-[15px] leading-[1.75] text-ink-2">
          {content.body.split(/\n{2,}/).map((p, i) => (
            <p key={i} className="font-serif italic">
              {p.trim()}
            </p>
          ))}
        </div>
      ) : null}

      {content.schedule.length > 0 ? (
        <div>
          {content.schedule.map((item, i) => (
            <div
              key={i}
              className="flex gap-4 border-t border-line py-3 last:border-b last:border-b-line"
            >
              <div className="w-20 shrink-0 pt-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-action">
                {item.dateRange}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-ink">{item.title}</div>
                <div className="mt-1 text-[13px] text-ink-3">
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
