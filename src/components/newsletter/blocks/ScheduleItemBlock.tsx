import type { ScheduleItemBlock as ScheduleItemBlockType } from "@/lib/schemas/newsletterSection";

interface ScheduleItemBlockProps {
  item: ScheduleItemBlockType;
}

export default function ScheduleItemBlock({ item }: ScheduleItemBlockProps) {
  return (
    <div className="flex gap-5 border-b border-line py-4 last:border-b-0">
      <div className="w-20 shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
        {item.dateRange}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold text-ink">{item.title}</div>
        <div className="mt-1 text-[13px] leading-[1.5] text-ink-3">
          {item.description}
        </div>
      </div>
    </div>
  );
}
