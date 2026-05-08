import type { DebriefSection } from "@prisma/client";

interface DebriefProps {
  section: DebriefSection | null | undefined;
}

function splitParagraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Debrief({ section }: DebriefProps) {
  if (!section) return null;

  const paragraphs = splitParagraphs(section.body);
  const hasVoiceNote = !!section.voiceNoteUrl;

  return (
    <section className="mt-10 space-y-8">
      {hasVoiceNote ? (
        <div className="rounded-2xl border border-line bg-cream-2 p-5">
          {section.voiceNoteLabel ? (
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-3">
              {section.voiceNoteLabel}
            </p>
          ) : null}
          <audio
            src={section.voiceNoteUrl ?? undefined}
            controls
            preload="metadata"
            className="mt-3 w-full"
          />
          {section.voiceNoteLocation || section.voiceNoteDurationSec ? (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
              {[
                section.voiceNoteLocation,
                section.voiceNoteDurationSec
                  ? formatDuration(section.voiceNoteDurationSec)
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="prose prose-lg max-w-none text-[17px] leading-[1.7] text-ink-2">
        {paragraphs.map((p, i) => (
          <p key={i} className={i === 0 ? "mt-0" : undefined}>
            {p}
          </p>
        ))}
      </div>

      {section.pullQuote ? (
        <blockquote className="border-l-2 border-accent-gold pl-6">
          <p className="font-serif text-[24px] italic leading-[1.35] text-ink md:text-[28px]">
            “{section.pullQuote}”
          </p>
          {section.pullQuoteContext ? (
            <footer className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
              {section.pullQuoteContext}
            </footer>
          ) : null}
        </blockquote>
      ) : null}
    </section>
  );
}
