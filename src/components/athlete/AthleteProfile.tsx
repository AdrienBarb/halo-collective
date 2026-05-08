"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryState } from "nuqs";
import type { Athlete, DebriefSection, Newsletter } from "@prisma/client";
import { flagFor } from "@/lib/athlete/flag";
import Debrief from "@/components/newsletter/blocks/Debrief";
import SubscribeForm from "@/components/athlete/SubscribeForm";

type EditionWithDebrief = Newsletter & {
  debriefSection: DebriefSection | null;
};

interface AthleteProfileProps {
  athlete: Athlete;
  editions: EditionWithDebrief[];
}

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
}

export default function AthleteProfile({
  athlete,
  editions,
}: AthleteProfileProps) {
  const fullName = `${athlete.firstName} ${athlete.lastName}`;
  const flag = flagFor(athlete.countryCode);

  const defaultEdition = editions[0] ?? null;
  const [editionParam, setEdition] = useQueryState("edition");
  const selected =
    editions.find((e) => e.slug === editionParam) ?? defaultEdition;

  function selectEdition(slug: string) {
    setEdition(slug === defaultEdition?.slug ? null : slug);
  }

  const issueMeta =
    selected && selected.publishedAt
      ? `#${selected.editionNumber.toString().padStart(2, "0")} · ${format(
          selected.publishedAt,
          "d MMM",
        ).toUpperCase()}`
      : null;

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

        {selected ? (
          <>
            <EditionTabs
              editions={editions}
              selectedSlug={selected.slug}
              onSelect={selectEdition}
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
                <h2 className="mt-2 font-serif text-[32px] font-semibold leading-[1.08] tracking-[-0.02em] text-ink md:text-[44px]">
                  {selected.title}
                </h2>
              </header>

              <Debrief section={selected.debriefSection} />
            </article>
          </>
        ) : (
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
        )}

        <SubscribeForm
          athleteSlug={athlete.slug}
          athleteFirstName={athlete.firstName}
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

function EditionTabs({
  editions,
  selectedSlug,
  onSelect,
}: {
  editions: EditionWithDebrief[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  function updateScrollState() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    setCanScrollLeft(scroller.scrollLeft > 1);
    setCanScrollRight(scroller.scrollLeft < max - 1);
  }

  useEffect(() => {
    updateScrollState();
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const onResize = () => updateScrollState();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [editions.length]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.querySelector<HTMLElement>(
      `[data-slug="${selectedSlug}"]`,
    );
    if (!card) return;
    card.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedSlug, reducedMotion]);

  function scrollByCard(direction: 1 | -1) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.querySelector<HTMLElement>("[data-edition-card]");
    const distance = card ? card.offsetWidth + 16 : scroller.clientWidth * 0.8;
    scroller.scrollBy({
      left: distance * direction,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <section className="border-b border-line px-6 py-8">
      <div className="mb-4 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <h3 className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink">
            Editions
          </h3>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
            {editions.length.toString().padStart(2, "0")}
          </span>
        </div>
        {editions.length > 1 ? (
          <div className="flex gap-1">
            <ArrowButton
              direction="left"
              onClick={() => scrollByCard(-1)}
              disabled={!canScrollLeft}
              label="Previous edition"
            />
            <ArrowButton
              direction="right"
              onClick={() => scrollByCard(1)}
              disabled={!canScrollRight}
              label="Next edition"
            />
          </div>
        ) : null}
      </div>

      <div
        ref={scrollerRef}
        onScroll={updateScrollState}
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 motion-safe:scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {editions.map((edition) => {
          const isActive = edition.slug === selectedSlug;
          const meta =
            edition.publishedAt !== null
              ? `#${edition.editionNumber.toString().padStart(2, "0")} · ${format(edition.publishedAt, "d MMM")}`
              : `#${edition.editionNumber.toString().padStart(2, "0")}`;

          return (
            <button
              key={edition.id}
              type="button"
              data-edition-card
              data-slug={edition.slug}
              onClick={() => onSelect(edition.slug)}
              aria-pressed={isActive}
              className={`group relative aspect-[5/4] w-[62%] shrink-0 cursor-pointer snap-start overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,#5a6478_0%,#2c3340_100%)] text-left transition-[transform,box-shadow,border-color] duration-200 ease-out motion-safe:hover:-translate-y-[2px] motion-safe:hover:[box-shadow:0_10px_28px_rgba(0,0,0,0.12)] sm:w-[44%] md:w-[32%] ${
                isActive
                  ? "border-accent-gold [box-shadow:0_0_0_2px_var(--color-accent-gold,#c9a86b)_inset]"
                  : "border-line"
              }`}
            >
              {edition.heroImageUrl ? (
                <Image
                  src={edition.heroImageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 62vw, (max-width: 1024px) 44vw, 32vw"
                  className="object-cover"
                  unoptimized
                />
              ) : null}
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.40)_0%,rgba(0,0,0,0.15)_45%,rgba(0,0,0,0.65)_100%)]"
              />
              <div className="absolute left-4 top-4 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-white">
                {meta}
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h4 className="font-serif text-[18px] font-semibold leading-[1.15] tracking-[-0.015em] text-white md:text-[20px]">
                  {edition.title}
                </h4>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ArrowButton({
  direction,
  onClick,
  disabled,
  label,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="group flex h-11 w-11 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full text-ink-3 transition-colors group-hover:bg-cream-3 group-hover:text-ink group-disabled:opacity-30 group-disabled:group-hover:bg-transparent group-disabled:group-hover:text-ink-3">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
      </span>
    </button>
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
