import Image from "next/image";
import type { TournamentSummaryBlock as TournamentSummaryBlockType } from "@/lib/schemas/newsletterSection";

interface TournamentSummaryBlockProps {
  summary: TournamentSummaryBlockType;
}

export default function TournamentSummaryBlock({
  summary,
}: TournamentSummaryBlockProps) {
  const meta = [
    summary.category,
    summary.location,
    summary.surface,
    summary.dateRange,
  ].filter(Boolean);

  return (
    <div className="flex items-center gap-4 border-b border-line pb-4">
      {summary.logoUrl ? (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-cream-2">
          <Image
            src={summary.logoUrl}
            alt=""
            fill
            sizes="56px"
            className="object-contain"
            unoptimized
          />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="text-base font-bold text-ink">{summary.name}</div>
        {meta.length > 0 ? (
          <div className="mt-1 font-sans text-[10px] uppercase tracking-wide text-ink-3">
            {meta.join(" · ")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
