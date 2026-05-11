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
} from "@/lib/newsletter/labels";
import AthleteReviewSection from "./sections/AthleteReviewSection";
import ComingUpSection from "./sections/ComingUpSection";
import FanEngagementSection from "./sections/FanEngagementSection";
import MonetisationSection from "./sections/MonetisationSection";
import WeekRecapSection from "./sections/WeekRecapSection";

export interface RawSection {
  id: string;
  type: SectionTypeValue;
  order: number;
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
  if (!isSectionMeaningful(section.type, section.blocks)) return null;

  const body = renderBody({
    section,
    mode: editionMode,
    athleteSlug,
    newsletterId,
    previewMode,
  });
  if (body === null) return null;

  const labels = getNewsletterLabels();
  const eyebrow = labels.sections[section.type].eyebrow;
  const number = (index + 1).toString().padStart(2, "0");
  const title = getSectionTitle(section.type, tournamentName);

  return (
    <section>
      <header className="space-y-1 bg-banner px-5 py-4">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-cream/80">
          {number} &nbsp;|&nbsp; {eyebrow}
        </div>
        {title ? (
          <h2 className="text-lg font-bold leading-tight text-cream">
            {title}
          </h2>
        ) : null}
      </header>
      <div className="bg-cream-2 px-5 py-6">{body}</div>
    </section>
  );
}
