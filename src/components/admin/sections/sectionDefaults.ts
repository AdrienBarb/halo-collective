import { getNewsletterLabels } from "@/lib/newsletter/labels";
import type { SectionTypeValue } from "@/lib/schemas/newsletterSection";

// SECTION_ORDER lives in lib/ so non-UI code (e.g. the JSON importer)
// can use it without pulling in admin components.
export { SECTION_ORDER } from "@/lib/newsletter/sectionDefaults";

// Admin display names mirror the public English eyebrows from
// `src/lib/newsletter/labels.ts` — single source of truth, no drift.
const EN_LABELS = getNewsletterLabels("en");

export const SECTION_LABELS: Record<SectionTypeValue, string> = {
  ATHLETE_REVIEW: EN_LABELS.sections.ATHLETE_REVIEW.eyebrow,
  WEEK_RECAP: EN_LABELS.sections.WEEK_RECAP.eyebrow,
  COMING_UP: EN_LABELS.sections.COMING_UP.eyebrow,
  MONETISATION: EN_LABELS.sections.MONETISATION.eyebrow,
  FAN_ENGAGEMENT: EN_LABELS.sections.FAN_ENGAGEMENT.eyebrow,
};

// Short editorial description shown under the section name in the editor.
// Helps editors know what each block is for at a glance.
export const SECTION_DESCRIPTIONS: Record<SectionTypeValue, string> = {
  ATHLETE_REVIEW:
    "The athlete's own perspective on the week — voice note, video, photo, or written.",
  WEEK_RECAP:
    "Tournament recap (results, matches) or weekly recap (training, social, media).",
  COMING_UP:
    "What's next: tournaments, training, schedule items, links the fan should know.",
  MONETISATION:
    "Kit, partners, affiliates, paid drops, donations, fan experiences.",
  FAN_ENGAGEMENT:
    "Polls, predictions, Q&A, prize draws — the first-party signal layer.",
};
