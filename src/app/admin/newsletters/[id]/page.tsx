import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getNewsletterById } from "@/lib/services/newsletter";
import NewsletterForm from "@/components/admin/NewsletterForm";
import NewsletterStatusPill from "@/components/admin/NewsletterStatusPill";
import PublishToggle from "@/components/admin/PublishToggle";

export const dynamic = "force-dynamic";

export default async function EditNewsletterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const newsletter = await getNewsletterById(id);
  if (!newsletter) notFound();

  const isPublished = newsletter.status === "PUBLISHED";
  const editionNumber = `#${newsletter.editionNumber
    .toString()
    .padStart(2, "0")}`;
  const eyebrow =
    isPublished && newsletter.publishedAt
      ? `Edition ${editionNumber} · ${format(newsletter.publishedAt, "d MMM yyyy")}`
      : `Edition ${editionNumber}`;

  return (
    <div className="space-y-8">
      <Link
        href="/admin/newsletters"
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3 transition-colors hover:text-ink"
      >
        ← Newsletters
      </Link>

      <header className="border-b border-line pb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <NewsletterStatusPill status={newsletter.status} />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-gold">
              {eyebrow}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
              {newsletter.athlete.firstName} {newsletter.athlete.lastName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {isPublished ? (
              <Link
                href={`/${newsletter.athlete.slug}/${newsletter.slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-action transition-colors hover:text-ink"
              >
                View live ↗
              </Link>
            ) : null}
            <PublishToggle
              newsletterId={newsletter.id}
              status={newsletter.status}
            />
          </div>
        </div>

        <h1 className="mt-5 font-sans text-[40px] font-semibold leading-[1.05] tracking-[-0.015em] text-ink md:text-[52px]">
          {newsletter.title}
        </h1>
      </header>

      <NewsletterForm
        mode="edit"
        athleteId={newsletter.athleteId}
        initialData={newsletter}
      />
    </div>
  );
}
