"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import { useQueryState } from "nuqs";
import type {
  Newsletter,
  NewsletterSection,
} from "@prisma/client";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locales";
import { formatShortDateNoYear } from "@/lib/utils/formatDate";
import { flagFor } from "@/lib/athlete/flag";
import SectionRenderer, {
  type RawSection,
} from "@/components/newsletter/SectionRenderer";
import type {
  EditionModeValue,
  SectionTypeValue,
} from "@/lib/schemas/newsletterSection";
import EditionTabsClient, {
  type EditionTab,
} from "@/components/athlete/EditionTabsClient";

export type EditionWithSections = Newsletter & {
  sections: NewsletterSection[];
};

type FlagInfo = ReturnType<typeof flagFor>;

function toRawSection(section: NewsletterSection): RawSection {
  return {
    id: section.id,
    type: section.type as SectionTypeValue,
    order: section.order,
    eyebrow: section.eyebrow,
    title: section.title,
    blocks: section.blocks,
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

// The existing "click default tab → clear param" behavior means a null
// `param` can mean either "first load, no edition picked" or "user just
// cleared it." We disambiguate with a hydration flag: pre-hydration paint
// trusts the server-resolved slug (so SSR HTML matches), post-hydration
// the URL is the source of truth (including null = default).
//
// useSyncExternalStore is the modern pattern for this — returns the
// serverSnapshot during SSR + initial client render, then switches to
// the clientSnapshot. No effect, no cascading render.
const noopSubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useSelectedSlug(initialSelectedSlug: string | null): string | null {
  const [param] = useQueryState("edition", { shallow: true });
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  return hydrated ? param : initialSelectedSlug;
}

interface EditionsCoverProps {
  editions: EditionWithSections[];
  initialSelectedSlug: string | null;
  athleteCoverImageUrl: string | null;
  flag: FlagInfo;
  memberBadgeLabel: string;
}

export function EditionsCover({
  editions,
  initialSelectedSlug,
  athleteCoverImageUrl,
  flag,
  memberBadgeLabel,
}: EditionsCoverProps) {
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const slug = useSelectedSlug(initialSelectedSlug);
  const selected =
    editions.find((e) => e.slug === slug) ?? editions[0] ?? null;

  const coverUrl = selected?.heroImageUrl ?? athleteCoverImageUrl ?? null;
  const issueMeta =
    selected && selected.publishedAt
      ? `#${selected.editionNumber.toString().padStart(2, "0")} · ${formatShortDateNoYear(
          new Date(selected.publishedAt),
          locale,
        ).toUpperCase()}`
      : null;

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
          <FrostedBadge>{memberBadgeLabel}</FrostedBadge>
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

function FrostedBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/20 bg-ink/55 px-2.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-cream backdrop-blur-md">
      {children}
    </span>
  );
}

interface EditionsViewProps {
  athleteSlug: string;
  editions: EditionWithSections[];
  initialSelectedSlug: string | null;
  previewMode?: boolean;
}

export default function EditionsView({
  athleteSlug,
  editions,
  initialSelectedSlug,
  previewMode = false,
}: EditionsViewProps) {
  const slug = useSelectedSlug(initialSelectedSlug);
  const defaultEdition = editions[0];
  const selected =
    editions.find((e) => e.slug === slug) ?? defaultEdition;

  if (!selected || !defaultEdition) return null;

  return (
    <>
      <EditionTabsClient
        editions={editions.map(toEditionTab)}
        defaultSlug={defaultEdition.slug}
      />

      <article className="bg-cream px-6 py-10 md:py-14">
        <div className="space-y-5">
          {selected.sections.map((section, i) => (
            <SectionRenderer
              key={section.id}
              section={toRawSection(section)}
              index={i}
              editionMode={selected.editionMode as EditionModeValue}
              tournamentName={selected.tournamentName}
              athleteSlug={athleteSlug}
              newsletterId={selected.id}
              previewMode={previewMode}
            />
          ))}
        </div>
      </article>
    </>
  );
}
