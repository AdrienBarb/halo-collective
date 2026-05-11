import Image from "next/image";
import { format } from "date-fns";
import type {
  Athlete,
  Newsletter,
  NewsletterSection,
} from "@prisma/client";
import { flagFor } from "@/lib/athlete/flag";
import SectionRenderer, {
  type RawSection,
} from "@/components/newsletter/SectionRenderer";
import { getTournamentLabel } from "@/lib/newsletter/labels";
import type { SectionTypeValue } from "@/lib/schemas/newsletterSection";
import SubscribeForm from "@/components/athlete/SubscribeForm";
import EditionTabsClient, {
  type EditionTab,
} from "@/components/athlete/EditionTabsClient";

type EditionWithSections = Newsletter & {
  sections: NewsletterSection[];
};

interface AthleteProfileProps {
  athlete: Athlete;
  editions: EditionWithSections[];
  selectedSlug: string | null;
  isSignedIn: boolean;
  isSubscribed: boolean;
}

function toRawSection(section: NewsletterSection): RawSection {
  return {
    id: section.id,
    type: section.type as SectionTypeValue,
    order: section.order,
    content: section.content,
  };
}

function toEditionTab(edition: EditionWithSections): EditionTab {
  return {
    id: edition.id,
    slug: edition.slug,
    title: edition.title,
    heroImageUrl: edition.heroImageUrl,
    editionNumber: edition.editionNumber,
    publishedAt: edition.publishedAt
      ? new Date(edition.publishedAt).toISOString()
      : null,
  };
}

export default function AthleteProfile({
  athlete,
  editions,
  selectedSlug,
  isSignedIn,
  isSubscribed,
}: AthleteProfileProps) {
  const fullName = `${athlete.firstName} ${athlete.lastName}`;
  const flag = flagFor(athlete.countryCode);

  const defaultEdition = editions[0] ?? null;
  const selected =
    editions.find((e) => e.slug === selectedSlug) ?? defaultEdition;

  const issueMeta =
    selected && selected.publishedAt
      ? `#${selected.editionNumber.toString().padStart(2, "0")} · ${format(
          selected.publishedAt,
          "d MMM",
        ).toUpperCase()}`
      : null;
  const tournamentLabel = getTournamentLabel(selected?.tournamentName);

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-[820px] border-x border-line bg-cream-2">
        <ProfileCover
          coverUrl={selected?.heroImageUrl ?? null}
          flag={flag}
          issueMeta={issueMeta}
        />

        <ProfileIdentity
          fullName={fullName}
          firstName={athlete.firstName}
          lastName={athlete.lastName}
          avatarUrl={athlete.avatarUrl}
          countryCode={athlete.countryCode}
          countryName={athlete.countryName}
          flagEmoji={flag.emoji}
        />

        <StatsRow athlete={athlete} />

        {isSubscribed && selected && defaultEdition ? (
          <>
            <EditionTabsClient
              editions={editions.map(toEditionTab)}
              defaultSlug={defaultEdition.slug}
            />

            <article className="px-6 py-10 md:py-14">
              <header>
                {selected.publishedAt ? (
                  <time
                    dateTime={new Date(selected.publishedAt).toISOString()}
                    className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-3"
                  >
                    {format(selected.publishedAt, "MMM d, yyyy")}
                  </time>
                ) : null}
                {tournamentLabel ? (
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
                    {tournamentLabel}
                  </div>
                ) : null}
                <h2 className="mt-2 font-serif text-[32px] font-semibold leading-[1.08] tracking-[-0.02em] text-ink md:text-[44px]">
                  {selected.title}
                </h2>
                {selected.tournamentContext ? (
                  <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-loss">
                    {selected.tournamentContext}
                  </div>
                ) : null}
              </header>

              <div className="mt-8 space-y-2">
                {selected.sections.map((section, i) => (
                  <SectionRenderer
                    key={section.id}
                    section={toRawSection(section)}
                    index={i}
                    tournamentName={selected.tournamentName}
                    athleteSlug={athlete.slug}
                  />
                ))}
              </div>
            </article>
          </>
        ) : null}

        {isSubscribed && !selected ? (
          <section className="px-6 py-12 md:py-16">
            <div className="rounded-2xl border border-dashed border-line bg-cream-2 px-6 py-14 text-center">
              <p className="font-serif text-[22px] leading-tight text-ink">
                No editions yet.
              </p>
              <p className="mt-2 text-[14px] text-ink-3">
                Check back soon — the next drop is being put together.
              </p>
            </div>
          </section>
        ) : null}

        <SubscribeForm
          athleteSlug={athlete.slug}
          athleteFirstName={athlete.firstName}
          isSignedIn={isSignedIn}
          isSubscribed={isSubscribed}
        />
      </div>
    </div>
  );
}

function ProfileCover({
  coverUrl,
  flag,
  issueMeta,
}: {
  coverUrl: string | null;
  flag: ReturnType<typeof flagFor>;
  issueMeta: string | null;
}) {
  return (
    <section className="relative w-full overflow-hidden bg-cream-3">
      <div className="relative aspect-[16/10] w-full md:aspect-[21/9]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes="(max-width: 820px) 100vw, 820px"
            className="object-cover"
            priority
            unoptimized
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(135deg,#5a6478_0%,#2c3340_100%)]"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.10)_45%,rgba(0,0,0,0.55)_100%)]"
        />
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
  );
}

function ProfileIdentity({
  fullName,
  firstName,
  lastName,
  avatarUrl,
  countryName,
  flagEmoji,
}: {
  fullName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  countryCode: string;
  countryName: string;
  flagEmoji: string;
}) {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`;
  return (
    <div className="flex flex-col items-center px-6 pb-2">
      <div className="relative -mt-[80px] h-[160px] w-[160px] overflow-hidden rounded-full border-[4px] border-cream-2 bg-[linear-gradient(135deg,#5a6478_0%,#2c3340_100%)] shadow-[0_10px_28px_rgba(0,0,0,0.22)] md:-mt-[110px] md:h-[200px] md:w-[200px]">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            fill
            sizes="200px"
            className="object-cover"
            priority
            unoptimized
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
          {flagEmoji}
        </span>
        {countryName}
      </div>
    </div>
  );
}

function StatsRow({ athlete }: { athlete: Athlete }) {
  return (
    <dl className="mt-6 grid grid-cols-3 border-y border-line">
      <Stat
        value={athlete.worldRank !== null ? `#${athlete.worldRank}` : "—"}
        label={athlete.tour ? `${athlete.tour} World` : "World"}
      />
      <Stat
        value={
          athlete.countryRank !== null ? `#${athlete.countryRank}` : "—"
        }
        label={athlete.countryCode}
        withDividers
      />
      <Stat value={athlete.titlesCount.toString()} label="Titles" />
    </dl>
  );
}

function FrostedBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/20 bg-ink/55 px-2.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-cream backdrop-blur-md">
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
