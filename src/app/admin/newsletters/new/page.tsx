import Link from "next/link";
import { listAllForAdmin } from "@/lib/services/athlete";
import NewsletterForm from "@/components/admin/NewsletterForm";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = { title: "New newsletter · Admin" };

export default async function NewNewsletterPage() {
  const athletes = await listAllForAdmin();
  const athleteOptions = athletes.map((a) => ({
    id: a.id,
    firstName: a.firstName,
    lastName: a.lastName,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/newsletters"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3 hover:text-ink"
        >
          ← Newsletters
        </Link>
        <h1 className="mt-2 font-serif text-[28px] font-semibold tracking-[-0.01em] text-ink">
          New newsletter
        </h1>
      </div>

      {athleteOptions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-cream-2 px-6 py-14 text-center">
          <p className="font-serif text-[20px] text-ink">
            No athletes yet.
          </p>
          <p className="mt-1 text-[13px] text-ink-3">
            Create an athlete before drafting a newsletter.
          </p>
          <div className="mt-5">
            <Button asChild>
              <Link href="/admin/athletes/new">New athlete</Link>
            </Button>
          </div>
        </div>
      ) : (
        <NewsletterForm mode="create" athletes={athleteOptions} />
      )}
    </div>
  );
}
