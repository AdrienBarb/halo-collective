import type { HeroMetricBlock as HeroMetricBlockType } from "@/lib/schemas/newsletterSection";

interface HeroMetricBlockProps {
  metric: HeroMetricBlockType;
}

export default function HeroMetricBlock({ metric }: HeroMetricBlockProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-line bg-cream px-3 py-5 text-center">
      <div className="font-display text-[28px] font-extrabold italic leading-none tracking-[-0.005em] text-ink">
        {metric.value}
      </div>
      <div className="mt-2 font-sans text-[9px] font-medium uppercase tracking-[0.22em] text-ink-3">
        {metric.label}
      </div>
    </div>
  );
}
