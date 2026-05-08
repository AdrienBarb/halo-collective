import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getAthleteById } from "@/lib/services/athlete";
import { getNewsletterById } from "@/lib/services/newsletter";
import NewsletterForm from "@/components/admin/NewsletterForm";
import PublishToggle from "@/components/admin/PublishToggle";

export const dynamic = "force-dynamic";

export default async function EditNewsletterPage({
  params,
}: {
  params: Promise<{ athleteId: string; newsletterId: string }>;
}) {
  const { athleteId, newsletterId } = await params;
  const [athlete, newsletter] = await Promise.all([
    getAthleteById(athleteId),
    getNewsletterById(newsletterId),
  ]);
  if (!athlete || !newsletter || newsletter.athleteId !== athlete.id) {
    notFound();
  }

  const isPublished = newsletter.status === "PUBLISHED";
  const editionNumber = `#${newsletter.editionNumber.toString().padStart(2, "0")}`;
  const eyebrow = isPublished && newsletter.publishedAt
    ? `Edition ${editionNumber} · ${format(newsletter.publishedAt, "d MMM yyyy")}`
    : `Edition ${editionNumber}`;

  return (
    <div className="space-y-8">
      <Link
        href={`/admin/athletes/${athlete.id}`}
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3 transition-colors hover:text-ink"
      >
        ← {athlete.firstName} {athlete.lastName}
      </Link>

      <header className="border-b border-line pb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <StatusPill status={newsletter.status} />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-gold">
              {eyebrow}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {isPublished ? (
              <Link
                href={`/${athlete.slug}/${newsletter.slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-action transition-colors hover:text-ink"
              >
                View live ↗
              </Link>
            ) : null}
            <Link
              href={`/api/admin/newsletters/${newsletter.id}/preview`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-2 transition-colors hover:text-ink"
            >
              Preview email ↗
            </Link>
            <PublishToggle
              newsletterId={newsletter.id}
              status={newsletter.status}
            />
          </div>
        </div>

        <h1 className="mt-5 font-serif text-[40px] font-semibold leading-[1.05] tracking-[-0.015em] text-ink md:text-[52px]">
          {newsletter.title}
        </h1>
      </header>

      <NewsletterForm
        mode="edit"
        athleteId={athlete.id}
        initialData={newsletter}
      />
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: "DRAFT" | "SENDING" | "PUBLISHED";
}) {
  const tone =
    status === "PUBLISHED"
      ? "border-ok/30 bg-ok/10 text-ok"
      : status === "SENDING"
        ? "border-accent-gold/30 bg-accent-gold/10 text-accent-gold"
        : "border-line bg-cream-3 text-ink-2";
  const dot =
    status === "PUBLISHED"
      ? "bg-ok"
      : status === "SENDING"
        ? "bg-accent-gold"
        : "bg-ink-3";
  const label =
    status === "PUBLISHED"
      ? "Published"
      : status === "SENDING"
        ? "Sending"
        : "Draft";

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-pill border px-3 py-1.5",
        "font-mono text-[10px] font-semibold uppercase tracking-[0.22em]",
        tone,
      ].join(" ")}
    >
      <span
        aria-hidden
        className={["h-1.5 w-1.5 rounded-full", dot].join(" ")}
      />
      {label}
    </span>
  );
}
