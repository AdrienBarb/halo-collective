import type { HeroMetricBlock as HeroMetricBlockType } from "@/lib/schemas/newsletterSection";

interface HeroMetricBlockProps {
  metric: HeroMetricBlockType;
}

export default function HeroMetricBlock({ metric }: HeroMetricBlockProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-banner px-3 py-4 text-center">
      <div className="font-mono text-base font-bold text-cream">{metric.value}</div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-cream/70">
        {metric.label}
      </div>
    </div>
  );
}
