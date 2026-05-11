import Link from "next/link";
import { notFound } from "next/navigation";
import { getAthleteById } from "@/lib/services/athlete";
import { listByAthleteId as listSponsorsByAthleteId } from "@/lib/services/sponsor";
import AthleteForm from "@/components/admin/AthleteForm";

export const dynamic = "force-dynamic";

export default async function EditAthletePage({
  params,
}: {
  params: Promise<{ athleteId: string }>;
}) {
  const { athleteId } = await params;
  const [athlete, sponsors] = await Promise.all([
    getAthleteById(athleteId),
    listSponsorsByAthleteId(athleteId),
  ]);
  if (!athlete) notFound();

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/admin/athletes"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3 hover:text-ink"
        >
          ← Athletes
        </Link>
        <h1 className="mt-2 font-serif text-[28px] font-semibold tracking-[-0.01em] text-ink">
          {athlete.firstName} {athlete.lastName}
        </h1>
      </div>

      <section>
        <h2 className="mb-4 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink">
          Profile
        </h2>
        <AthleteForm mode="edit" initialData={athlete} initialSponsors={sponsors} />
      </section>
    </div>
  );
}
