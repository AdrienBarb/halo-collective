import { getNewsletterLabels } from "@/lib/newsletter/labels";
import type { SectionTypeValue } from "@/lib/schemas/newsletterSection";

// SECTION_ORDER + emptyContentFor live in lib/ so non-UI code (e.g. the
// JSON importer) can use them without pulling in admin components.
export {
  SECTION_ORDER,
  emptyContentFor,
} from "@/lib/newsletter/sectionDefaults";

// Admin display names mirror the public English eyebrows shipped from
// `src/lib/newsletter/labels.ts` — single source of truth, no drift.
const EN_LABELS = getNewsletterLabels("en");

export const SECTION_LABELS: Record<SectionTypeValue, string> = {
  DEBRIEF: EN_LABELS.sections.DEBRIEF.eyebrow,
  RESULTS: EN_LABELS.sections.RESULTS.eyebrow,
  WHATS_NEXT: EN_LABELS.sections.WHATS_NEXT.eyebrow,
  KIT: EN_LABELS.sections.KIT.eyebrow,
  ENGAGEMENT: EN_LABELS.sections.ENGAGEMENT.eyebrow,
};

// Short editorial description shown under the section name in the editor.
// Helps editors know what each block is for at a glance.
export const SECTION_DESCRIPTIONS: Record<SectionTypeValue, string> = {
  DEBRIEF: "How the week felt — voice note or written, in the athlete's voice.",
  RESULTS: "The score line: stat snapshot, match by match, press coverage.",
  WHATS_NEXT: "Where the athlete is going next, and the schedule that follows.",
  KIT: "Gear, drops, partner products — the editorial commerce block.",
  ENGAGEMENT: "Reader's turn — a poll, a question, or both.",
};
