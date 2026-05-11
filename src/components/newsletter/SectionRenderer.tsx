import {
  debriefContentSchema,
  engagementContentSchema,
  isSectionMeaningful,
  kitContentSchema,
  resultsContentSchema,
  whatsNextContentSchema,
  type SectionTypeValue,
} from "@/lib/schemas/newsletterSection";
import {
  getNewsletterLabels,
  getSectionTitle,
} from "@/lib/newsletter/labels";
import DebriefSection from "./sections/DebriefSection";
import EngagementSection from "./sections/EngagementSection";
import KitSection from "./sections/KitSection";
import ResultsSection from "./sections/ResultsSection";
import WhatsNextSection from "./sections/WhatsNextSection";

export interface RawSection {
  id: string;
  type: SectionTypeValue;
  order: number;
  content: unknown;
}

interface SectionRendererProps {
  section: RawSection;
  index: number;
  /** Tournament name for the parent newsletter — drives derived section titles. */
  tournamentName?: string | null;
  /** Athlete slug — used by ENGAGEMENT to build the "Ask me a question" URL. */
  athleteSlug?: string;
}

function renderBody(
  section: RawSection,
  athleteSlug: string | undefined,
): React.ReactNode {
  switch (section.type) {
    case "DEBRIEF": {
      const parsed = debriefContentSchema.safeParse(section.content);
      return parsed.success ? <DebriefSection content={parsed.data} /> : null;
    }
    case "RESULTS": {
      const parsed = resultsContentSchema.safeParse(section.content);
      return parsed.success ? <ResultsSection content={parsed.data} /> : null;
    }
    case "WHATS_NEXT": {
      const parsed = whatsNextContentSchema.safeParse(section.content);
      return parsed.success ? <WhatsNextSection content={parsed.data} /> : null;
    }
    case "KIT": {
      const parsed = kitContentSchema.safeParse(section.content);
      return parsed.success ? <KitSection content={parsed.data} /> : null;
    }
    case "ENGAGEMENT": {
      const parsed = engagementContentSchema.safeParse(section.content);
      return parsed.success ? (
        <EngagementSection content={parsed.data} athleteSlug={athleteSlug} />
      ) : null;
    }
    default:
      return null;
  }
}

export default function SectionRenderer({
  section,
  index,
  tournamentName,
  athleteSlug,
}: SectionRendererProps) {
  // Empty sections are hidden entirely — banner included. This is the
  // contract the editor relies on: "if no value, we don't show it".
  if (!isSectionMeaningful(section.type, section.content)) return null;

  const body = renderBody(section, athleteSlug);
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
