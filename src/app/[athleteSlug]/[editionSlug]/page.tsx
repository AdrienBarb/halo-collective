import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { format } from "date-fns";
import { genPageMetadata } from "@/lib/seo/genPageMetadata";
import { getPublishedNewsletterBySlugs } from "@/lib/services/newsletter";

type EditionRoute = "/[athleteSlug]/[editionSlug]";

export async function generateMetadata({
  params,
}: PageProps<EditionRoute>): Promise<Metadata> {
  const { athleteSlug, editionSlug } = await params;
  const newsletter = await getPublishedNewsletterBySlugs(athleteSlug, editionSlug);
  if (!newsletter) return {};

  return genPageMetadata({
    title: newsletter.title,
    description: newsletter.body
      ? newsletter.body.slice(0, 160)
      : `${newsletter.athlete.firstName} ${newsletter.athlete.lastName} — ${newsletter.title}`,
    url: `/${athleteSlug}/${editionSlug}`,
    image: newsletter.heroImageUrl ?? undefined,
  });
}

export default async function EditionPage({
  params,
}: PageProps<EditionRoute>) {
  const { athleteSlug, editionSlug } = await params;
  const newsletter = await getPublishedNewsletterBySlugs(athleteSlug, editionSlug);
  if (!newsletter) notFound();

  return (
    <article className="mx-auto max-w-[760px] px-6 py-12 md:py-16">
      <Link
        href={`/${athleteSlug}`}
        className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-3 hover:text-ink"
      >
        ← All editions
      </Link>

      <header className="mt-6">
        {newsletter.publishedAt ? (
          <time
            dateTime={newsletter.publishedAt.toISOString()}
            className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-3"
          >
            {format(newsletter.publishedAt, "MMM d, yyyy")}
          </time>
        ) : null}
        <h1 className="mt-2 font-serif text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-ink md:text-[56px]">
          {newsletter.title}
        </h1>
      </header>

      {newsletter.heroImageUrl ? (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-line bg-cream-3">
          <Image
            src={newsletter.heroImageUrl}
            alt={newsletter.title}
            fill
            sizes="(max-width: 760px) 100vw, 760px"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      {newsletter.body ? (
        <div className="prose prose-lg mt-10 max-w-none whitespace-pre-wrap text-[17px] leading-[1.7] text-ink-2">
          {newsletter.body}
        </div>
      ) : null}
    </article>
  );
}
