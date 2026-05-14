import { useLocale } from "next-intl";
import {
  isSectionMeaningful,
  safeParseSectionBlocks,
  type AthleteReviewBlock,
  type ComingUpBlock,
  type EditionModeValue,
  type FanEngagementBlock,
  type MonetisationBlock,
  type SectionTypeValue,
  type WeekRecapTournamentBlock,
  type WeekRecapWeeklyBlock,
} from "@/lib/schemas/newsletterSection";
import {
  getNewsletterLabels,
  getSectionTitle,
  type NewsletterLocale,
} from "@/lib/newsletter/labels";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locales";
import AthleteReviewSection from "./sections/AthleteReviewSection";
import ComingUpSection from "./sections/ComingUpSection";
import FanEngagementSection from "./sections/FanEngagementSection";
import MonetisationSection from "./sections/MonetisationSection";
import WeekRecapSection from "./sections/WeekRecapSection";

export interface RawSection {
  id: string;
  type: SectionTypeValue;
  order: number;
  title: string | null;
  blocks: unknown;
}

interface SectionRendererProps {
  section: RawSection;
  index: number;
  editionMode: EditionModeValue;
  /** Tournament name for the parent newsletter — drives derived section titles. */
  tournamentName?: string | null;
  /** Athlete slug — used by FAN_ENGAGEMENT to build engagement URLs. */
  athleteSlug?: string;
  /** Newsletter id — required for FAN_ENGAGEMENT API calls. */
  newsletterId?: string;
  /** When true, FAN_ENGAGEMENT blocks render without firing live fetches. */
  previewMode?: boolean;
}

interface RenderBodyArgs {
  section: RawSection;
  mode: EditionModeValue;
  athleteSlug: string | undefined;
  newsletterId: string | undefined;
  previewMode: boolean;
}

function renderBody({
  section,
  mode,
  athleteSlug,
  newsletterId,
  previewMode,
}: RenderBodyArgs): React.ReactNode {
  const parsed = safeParseSectionBlocks(section.type, mode, section.blocks);
  if (!parsed.success) {
    // Don't silently swallow — surface the failure so we can spot
    // schema drift in browser monitoring (Sentry / PostHog console
    // capture) instead of just seeing sections vanish in production.
    console.warn("newsletter.section_parse_failed", {
      sectionId: section.id,
      sectionType: section.type,
      editionMode: mode,
      issues: parsed.error.issues.slice(0, 5),
    });
    return null;
  }

  switch (section.type) {
    case "ATHLETE_REVIEW":
      return (
        <AthleteReviewSection blocks={parsed.data as AthleteReviewBlock[]} />
      );
    case "WEEK_RECAP":
      return (
        <WeekRecapSection
          blocks={
            parsed.data as Array<WeekRecapTournamentBlock | WeekRecapWeeklyBlock>
          }
        />
      );
    case "COMING_UP":
      return <ComingUpSection blocks={parsed.data as ComingUpBlock[]} />;
    case "MONETISATION":
      return (
        <MonetisationSection blocks={parsed.data as MonetisationBlock[]} />
      );
    case "FAN_ENGAGEMENT":
      return (
        <FanEngagementSection
          blocks={parsed.data as FanEngagementBlock[]}
          athleteSlug={athleteSlug}
          newsletterId={newsletterId}
          previewMode={previewMode}
        />
      );
  }
}

export default function SectionRenderer({
  section,
  index,
  editionMode,
  tournamentName,
  athleteSlug,
  newsletterId,
  previewMode = false,
}: SectionRendererProps) {
  const rawLocale = useLocale();

  if (!isSectionMeaningful(section.type, section.blocks)) return null;

  const body = renderBody({
    section,
    mode: editionMode,
    athleteSlug,
    newsletterId,
    previewMode,
  });
  if (body === null) return null;

  const locale: NewsletterLocale = isLocale(rawLocale)
    ? rawLocale
    : DEFAULT_LOCALE;
  const labels = getNewsletterLabels(locale);
  const eyebrow = labels.sections[section.type].eyebrow;
  const number = (index + 1).toString().padStart(2, "0");
  // Explicit string|null annotation: the `{title ? ...}` guard below
  // depends on this being nullable — locks the contract even if
  // getSectionTitle ever returns a non-nullable string.
  const title: string | null =
    section.title?.trim() ||
    getSectionTitle(section.type, tournamentName, locale);

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-cream-2">
      <header className="relative space-y-3 bg-banner px-6 py-6 md:px-8 md:py-7">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px] bg-accent-gold"
        />
        <div className="font-mono text-[12px] font-semibold uppercase tracking-[0.28em] text-accent-warm md:text-[13px]">
          {number} &nbsp;·&nbsp; {eyebrow}
        </div>
        {title ? (
          <h2 className="font-serif text-[30px] font-medium leading-[1.1] tracking-[-0.02em] text-cream md:text-[36px]">
            {title}
          </h2>
        ) : null}
      </header>
      <div className="px-5 py-6 md:px-6 md:py-7">{body}</div>
    </section>
  );
}
