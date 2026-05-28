import type { PhaseTimelineBlock as PhaseTimelineBlockType } from "@/lib/schemas/newsletterSection";

interface PhaseTimelineBlockProps {
  block: PhaseTimelineBlockType;
}

export default function PhaseTimelineBlock({ block }: PhaseTimelineBlockProps) {
  return (
    <ol className="border-t border-line">
      {block.phases.map((phase, i) => (
        <li
          key={i}
          className="flex gap-5 border-b border-line py-4 last:border-b-0"
        >
          <div className="w-20 shrink-0 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-action">
            {phase.label}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-semibold text-ink">
              {phase.title}
            </div>
            <div className="mt-1 text-[13px] leading-[1.5] text-ink-3">
              {phase.description}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
