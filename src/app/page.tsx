import RosterCard from "@/components/RosterCard";
import { athletes } from "@/data/athletes";

export default function Home() {
  const count = athletes.length.toString().padStart(2, "0");

  return (
    <div className="mx-auto max-w-[1180px] px-8">
      <section className="pb-14 pt-[72px] text-center">
        <div className="mb-[22px] font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-banner">
          Enter the private athlete fan club
        </div>
        <h1 className="mx-auto max-w-[880px] text-balance font-serif text-[44px] font-semibold uppercase leading-[1.02] tracking-[-0.025em] text-ink sm:text-[66px]">
          The inside story, direct from the athlete.
        </h1>
        <p className="mx-auto mt-7 max-w-[680px] text-balance font-serif text-[18px] italic font-normal leading-[1.5] tracking-[-0.005em] text-ink-2 sm:text-[22px]">
          Honest match debriefs. The gear, the schedule, the wins and the losses
          — unfiltered, member-only, delivered between matches.
        </p>
      </section>

      <section>
        <div className="mt-7 mb-7 flex items-baseline justify-between border-b border-line pb-3.5">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-3">
            The Roster
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
            {count} Athletes
          </div>
        </div>

        <div className="grid grid-cols-1 gap-7 pb-20 sm:grid-cols-2 lg:grid-cols-3">
          {athletes.map((athlete) => (
            <RosterCard key={athlete.slug} athlete={athlete} />
          ))}
        </div>
      </section>
    </div>
  );
}
