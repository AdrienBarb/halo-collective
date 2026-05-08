import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getAthleteBySlug } from "@/lib/services/athlete";
import { listPublishedByAthleteId } from "@/lib/services/newsletter";
import EditionsSlider from "@/components/athlete/EditionsSlider";

export default async function AthleteHomePage({
  params,
}: PageProps<"/[athleteSlug]">) {
  const { athleteSlug } = await params;
  const athlete = await getAthleteBySlug(athleteSlug);
  if (!athlete) notFound();

  const editions = await listPublishedByAthleteId(athlete.id);

  return (
    <section className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
      {editions.length === 0 ? (
        <>
          <div className="mb-6 flex items-baseline gap-3">
            <h2 className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink">
              Editions
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
              00
            </span>
          </div>
          <div className="rounded-2xl border border-dashed border-line bg-cream-2 px-6 py-14 text-center">
            <p className="font-serif text-[22px] leading-tight text-ink">
              No editions yet.
            </p>
            <p className="mt-2 text-[14px] text-ink-3">
              Check back soon — the next drop is being put together.
            </p>
          </div>
        </>
      ) : (
        <EditionsSlider count={editions.length}>
          {editions.map((edition) => {
            const issueMeta =
              edition.publishedAt !== null
                ? `#${edition.editionNumber.toString().padStart(2, "0")} · ${format(edition.publishedAt, "d MMM")}`
                : `#${edition.editionNumber.toString().padStart(2, "0")}`;

            return (
              <Link
                key={edition.id}
                href={`/${athlete.slug}/${edition.slug}`}
                data-edition-card
                className="group relative aspect-[5/4] w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-[linear-gradient(135deg,#5a6478_0%,#2c3340_100%)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[2px] hover:[box-shadow:0_10px_28px_rgba(0,0,0,0.12)] sm:w-[55%] md:w-[40%] lg:w-[32%]"
              >
                {edition.heroImageUrl ? (
                  <Image
                    src={edition.heroImageUrl}
                    alt={edition.title}
                    fill
                    sizes="(max-width: 640px) 78vw, (max-width: 1024px) 40vw, 32vw"
                    className="object-cover"
                  />
                ) : null}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.40)_0%,rgba(0,0,0,0.15)_45%,rgba(0,0,0,0.65)_100%)]"
                />
                <div className="absolute left-5 top-5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-white">
                  {issueMeta}
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="font-serif text-[22px] font-semibold leading-[1.15] tracking-[-0.015em] text-white md:text-[26px]">
                    {edition.title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </EditionsSlider>
      )}
    </section>
  );
}
