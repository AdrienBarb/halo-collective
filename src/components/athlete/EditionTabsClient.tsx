"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryState } from "nuqs";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locales";
import { formatShortDateNoYear } from "@/lib/utils/formatDate";

export interface EditionTab {
  id: string;
  slug: string;
  title: string;
  heroImageUrl: string | null;
  editionNumber: number;
  publishedAt: string | null; // ISO
}

interface EditionTabsClientProps {
  editions: EditionTab[];
  defaultSlug: string;
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

export default function EditionTabsClient({
  editions,
  defaultSlug,
}: EditionTabsClientProps) {
  const t = useTranslations("Athlete.Editions");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const [editionParam, setEdition] = useQueryState("edition", {
    shallow: false,
  });
  const selectedSlug =
    editions.find((e) => e.slug === editionParam)?.slug ?? defaultSlug;

  function selectEdition(slug: string) {
    setEdition(slug === defaultSlug ? null : slug);
  }

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
            {t("title")}
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
              label={t("previous")}
            />
            <ArrowButton
              direction="right"
              onClick={() => scrollByCard(1)}
              disabled={!canScrollRight}
              label={t("next")}
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
          const meta = edition.publishedAt
            ? `#${edition.editionNumber.toString().padStart(2, "0")} · ${formatShortDateNoYear(new Date(edition.publishedAt), locale)}`
            : `#${edition.editionNumber.toString().padStart(2, "0")}`;

          return (
            <button
              key={edition.id}
              type="button"
              data-edition-card
              data-slug={edition.slug}
              onClick={() => selectEdition(edition.slug)}
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
