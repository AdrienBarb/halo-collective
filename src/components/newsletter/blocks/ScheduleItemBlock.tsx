import type { ScheduleItemBlock as ScheduleItemBlockType } from "@/lib/schemas/newsletterSection";

interface ScheduleItemBlockProps {
  item: ScheduleItemBlockType;
}

export default function ScheduleItemBlock({ item }: ScheduleItemBlockProps) {
  return (
    <div className="flex gap-4 border-b border-line py-3 last:border-b-0">
      <div className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-wide text-action">
        {item.dateRange}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-ink">{item.title}</div>
        <div className="mt-0.5 text-xs text-ink-3">{item.description}</div>
      </div>
    </div>
  );
}
