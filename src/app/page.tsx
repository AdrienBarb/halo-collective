import { getTranslations } from "next-intl/server";
import RosterCard from "@/components/RosterCard";
import { listAllAthletes } from "@/lib/services/athlete";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (process.env.NEXT_PUBLIC_APP_ENV === "production") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[640px] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-banner">
          Halo Collective
        </div>
        <h1 className="font-display text-[28px] font-bold uppercase leading-[1.1] tracking-[-0.005em] text-ink sm:text-[34px]">
          Coming soon.
        </h1>
        <p className="mt-4 font-display text-[16px] italic text-ink-2">
          We&rsquo;re building something for elite athletes and their fans.
        </p>
      </div>
    );
  }

  const athletes = await listAllAthletes();
  const count = athletes.length.toString().padStart(2, "0");
  const t = await getTranslations("Landing");

  return (
    <div className="mx-auto max-w-[1180px] px-8">
      <section className="pb-14 pt-[72px] text-center">
        <div className="mb-[22px] font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-banner">
          {t("eyebrow")}
        </div>
        <h1 className="mx-auto max-w-[880px] text-balance font-display text-[44px] font-bold uppercase leading-[1.02] tracking-[-0.01em] text-ink sm:text-[66px]">
          {t("headline")}
        </h1>
        <p className="mx-auto mt-7 max-w-[680px] text-balance font-display text-[18px] italic font-normal leading-[1.5] tracking-[-0.005em] text-ink-2 sm:text-[22px]">
          {t("subhead")}
        </p>
      </section>

      <section>
        <div className="mt-7 mb-7 flex items-baseline justify-between border-b border-line pb-3.5">
          <div className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-ink-3">
            {t("rosterHeading")}
          </div>
          <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-3">
            {t("rosterCount", { count })}
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
