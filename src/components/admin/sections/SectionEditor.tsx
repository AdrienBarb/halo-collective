import {
  debriefContentSchema,
  engagementContentSchema,
  kitContentSchema,
  resultsContentSchema,
  whatsNextContentSchema,
  type SectionTypeValue,
} from "@/lib/schemas/newsletterSection";

// ── Section draft type ────────────────────────────────────────────────
//
// Drafts live in editor state and are validated against strict Zod
// schemas at submit time. With the fixed-5-shape model, drafts only
// carry `type` + `content` — labels and titles are derived at render
// time from `src/lib/newsletter/labels.ts`.

export interface SectionDraft {
  type: SectionTypeValue;
  content: unknown;
}

const CONTENT_SCHEMAS = {
  DEBRIEF: debriefContentSchema,
  RESULTS: resultsContentSchema,
  WHATS_NEXT: whatsNextContentSchema,
  KIT: kitContentSchema,
  ENGAGEMENT: engagementContentSchema,
} as const;

export function validateSectionDraft(draft: SectionDraft):
  | { ok: true; content: unknown }
  | { ok: false; message: string } {
  const result = CONTENT_SCHEMAS[draft.type].safeParse(draft.content);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first.path.join(".") || "content";
    return {
      ok: false,
      message: `${path}: ${first.message}`,
    };
  }
  return { ok: true, content: result.data };
}
