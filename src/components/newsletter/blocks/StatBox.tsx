import type { StatBox as StatBoxType } from "@/lib/schemas/newsletterSection";

interface StatBoxProps {
  stat: StatBoxType;
}

export default function StatBox({ stat }: StatBoxProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-banner px-3 py-4 text-center">
      <div className="font-mono text-base font-bold text-cream">{stat.value}</div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-cream/70">
        {stat.label}
      </div>
    </div>
  );
}
