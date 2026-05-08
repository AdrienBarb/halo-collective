import Link from "next/link";
import { notFound } from "next/navigation";
import { getAthleteById } from "@/lib/services/athlete";
import NewsletterForm from "@/components/admin/NewsletterForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "New newsletter · Admin" };

export default async function NewNewsletterPage({
  params,
}: {
  params: Promise<{ athleteId: string }>;
}) {
  const { athleteId } = await params;
  const athlete = await getAthleteById(athleteId);
  if (!athlete) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/athletes/${athlete.id}`}
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3 hover:text-ink"
        >
          ← {athlete.firstName} {athlete.lastName}
        </Link>
        <h1 className="mt-2 font-serif text-[28px] font-semibold tracking-[-0.01em] text-ink">
          New newsletter
        </h1>
      </div>
      <NewsletterForm mode="create" athleteId={athlete.id} />
    </div>
  );
}
