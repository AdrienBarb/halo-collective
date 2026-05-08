import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import type { Metadata } from "next";
import { genPageMetadata } from "@/lib/seo/genPageMetadata";
import { flagFor } from "@/lib/athlete/flag";
import {
  getAthleteBySlug,
  getLatestPublishedNewsletter,
} from "@/lib/services/athlete";

export async function generateMetadata({
  params,
}: PageProps<"/[athleteSlug]">): Promise<Metadata> {
  const { athleteSlug } = await params;
  const athlete = await getAthleteBySlug(athleteSlug);
  if (!athlete) return {};

  const fullName = `${athlete.firstName} ${athlete.lastName}`;
  return genPageMetadata({
    title: fullName,
    description:
      athlete.bio ?? `${fullName} — newsletter and updates on Halo Collective.`,
    url: `/${athleteSlug}`,
  });
}

export default async function AthleteLayout({
  children,
  params,
}: LayoutProps<"/[athleteSlug]">) {
  const { athleteSlug } = await params;
  const athlete = await getAthleteBySlug(athleteSlug);
  if (!athlete) notFound();

  const fullName = `${athlete.firstName} ${athlete.lastName}`;
  const initials = `${athlete.firstName[0] ?? ""}${athlete.lastName[0] ?? ""}`;
  const flag = flagFor(athlete.countryCode);
  const latest = await getLatestPublishedNewsletter(athlete.id);

  const issueMeta =
    latest && latest.publishedAt
      ? `#${latest.editionNumber.toString().padStart(2, "0")} · ${format(latest.publishedAt, "d MMM").toUpperCase()}`
      : null;

  const portraitSrc = athlete.heroImageUrl ?? athlete.avatarUrl;

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-[820px] border-x border-line bg-cream-2">
        <section className="relative w-full overflow-hidden bg-cream-3">
          <div className="relative aspect-[16/10] w-full md:aspect-[21/9]">
            <div className="absolute left-5 top-5 md:left-8 md:top-8">
              <FrostedBadge>★ MEMBER</FrostedBadge>
            </div>
            {issueMeta ? (
              <div className="absolute right-5 top-5 md:right-8 md:top-8">
                <FrostedBadge>{issueMeta}</FrostedBadge>
              </div>
            ) : null}
          </div>

          <div className="flex h-1 w-full">
            {flag.stripe.map((color, i) => (
              <span
                key={i}
                className="flex-1"
                style={{ background: color }}
                aria-hidden
              />
            ))}
          </div>
        </section>

        <div className="flex flex-col items-center px-6 pb-2">
          <div className="relative -mt-[80px] h-[160px] w-[160px] overflow-hidden rounded-full border-[4px] border-cream-2 bg-[linear-gradient(135deg,#5a6478_0%,#2c3340_100%)] shadow-[0_10px_28px_rgba(0,0,0,0.22)] md:-mt-[110px] md:h-[200px] md:w-[200px]">
            {portraitSrc ? (
              <Image
                src={portraitSrc}
                alt={fullName}
                fill
                sizes="200px"
                className="object-cover"
                style={{ objectPosition: athlete.heroFocus ?? "center 20%" }}
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-serif text-[56px] font-semibold tracking-[-0.02em] text-cream md:text-[72px]">
                {initials}
              </div>
            )}
          </div>

          <h1 className="mt-5 text-center font-serif text-[36px] font-semibold leading-[1.05] tracking-[-0.02em] text-ink md:text-[48px]">
            {fullName}
          </h1>

          <div className="mt-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-3">
            <span aria-hidden className="mr-1.5">
              {flag.emoji}
            </span>
            {athlete.countryName}
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-3 border-y border-line">
          <Stat
            value={athlete.worldRank !== null ? `#${athlete.worldRank}` : "—"}
            label={athlete.tour ? `${athlete.tour} World` : "World"}
          />
          <Stat
            value={athlete.countryRank !== null ? `#${athlete.countryRank}` : "—"}
            label={athlete.countryCode}
            withDividers
          />
          <Stat value={athlete.titlesCount.toString()} label="Titles" />
        </dl>

        {children}
      </div>
    </div>
  );
}

function FrostedBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-ink/15 bg-cream-2/70 px-2.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-2 backdrop-blur-md">
      {children}
    </span>
  );
}

function Stat({
  value,
  label,
  withDividers,
}: {
  value: string;
  label: string;
  withDividers?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center px-2 py-5 ${withDividers ? "border-x border-line" : ""}`}
    >
      <span className="font-serif text-[28px] font-semibold leading-none tracking-[-0.01em] text-ink md:text-[34px]">
        {value}
      </span>
      <span className="mt-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-3">
        {label}
      </span>
    </div>
  );
}
