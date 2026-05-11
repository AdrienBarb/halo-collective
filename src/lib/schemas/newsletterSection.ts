import { z } from "zod";
import {
  mediaUrl,
  optionalMediaUrl,
  optionalSafeUrl,
  optionalTrimmedString,
  safeUrl,
} from "@/lib/schemas/common";

export const sectionTypeSchema = z.enum([
  "DEBRIEF",
  "RESULTS",
  "WHATS_NEXT",
  "KIT",
  "ENGAGEMENT",
]);

export type SectionTypeValue = z.infer<typeof sectionTypeSchema>;

// ── Shared block schemas ──────────────────────────────────────────────

export const videoMediaSchema = z.object({
  kind: z.literal("video"),
  thumbnailUrl: optionalMediaUrl,
  videoUrl: safeUrl,
});

export const voicenoteMediaSchema = z.object({
  kind: z.literal("voicenote"),
  title: z.string().trim().min(1),
  location: z.string().trim().min(1),
  durationLabel: z.string().trim().min(1),
  audioUrl: mediaUrl,
});

export const mediaBlockSchema = z.discriminatedUnion("kind", [
  videoMediaSchema,
  voicenoteMediaSchema,
]);

export const matchBlockSchema = z.object({
  result: z.enum(["W", "L", "BYE", "EXEMPT"]),
  opponentName: optionalTrimmedString,
  opponentRank: optionalTrimmedString,
  opponentCountry: optionalTrimmedString,
  score: optionalTrimmedString,
  roundName: z.string().trim().min(1),
  date: z.string().trim().min(1),
  contextNote: optionalTrimmedString,
  commentary: optionalTrimmedString,
  highlightUrl: optionalSafeUrl,
});

export const pressLinkSchema = z.object({
  source: z.string().trim().min(1),
  headline: z.string().trim().min(1),
  url: safeUrl,
  ctaLabel: optionalTrimmedString,
});

export const statBoxSchema = z.object({
  value: z.string().trim().min(1),
  label: z.string().trim().min(1),
});

export const pollOptionSchema = z.object({
  label: z.string().trim().min(1),
  emoji: optionalTrimmedString,
  isHighlighted: z.boolean().default(false),
});

export const scheduleItemSchema = z.object({
  dateRange: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

export const pullQuoteSchema = z.object({
  contextLabel: optionalTrimmedString,
  text: z.string().trim().min(1),
});

// ── Section content schemas ───────────────────────────────────────────
//
// Every content field is optional. Empty sections are valid and
// SectionRenderer simply hides them. This lets editors leave entire
// sections blank without removing them from the data model.

export const debriefContentSchema = z.object({
  media: mediaBlockSchema.optional(),
  body: optionalTrimmedString,
  pullQuote: pullQuoteSchema.optional(),
});

export const resultsSubSectionSchema = z.object({
  label: z.string().trim().min(1),
  media: mediaBlockSchema.optional(),
  body: z.string().trim().min(1),
  pressLinks: z.array(pressLinkSchema).optional(),
});

export const resultsContentSchema = z.object({
  stats: z.array(statBoxSchema).default([]),
  matches: z.array(matchBlockSchema).default([]),
  pressLinks: z.array(pressLinkSchema).optional(),
  subSection: resultsSubSectionSchema.optional(),
});

export const whatsNextContentSchema = z.object({
  media: mediaBlockSchema.optional(),
  tournamentMeta: optionalTrimmedString,
  body: optionalTrimmedString,
  schedule: z.array(scheduleItemSchema).default([]),
});

export const kitContentSchema = z.object({
  imageUrl: optionalMediaUrl,
  body: optionalTrimmedString,
  cta: z
    .object({
      label: z.string().trim().min(1),
      url: optionalSafeUrl,
    })
    .optional(),
});

export const engagementContentSchema = z.object({
  question: optionalTrimmedString,
  pollOptions: z.array(pollOptionSchema).default([]),
  pollUrl: optionalSafeUrl,
});

// ── Validator helper ──────────────────────────────────────────────────

const CONTENT_SCHEMAS = {
  DEBRIEF: debriefContentSchema,
  RESULTS: resultsContentSchema,
  WHATS_NEXT: whatsNextContentSchema,
  KIT: kitContentSchema,
  ENGAGEMENT: engagementContentSchema,
} as const;

export const validateSectionContent = (
  type: SectionTypeValue,
  content: unknown,
) => {
  const schema = CONTENT_SCHEMAS[type];
  if (!schema) {
    throw new Error(`Unsupported section type: ${type}`);
  }
  return schema.parse(content);
};

export const safeParseSectionContent = (
  type: SectionTypeValue,
  content: unknown,
) => {
  const schema = CONTENT_SCHEMAS[type];
  if (!schema) {
    return { success: false, error: new Error(`Unsupported section type: ${type}`) } as const;
  }
  return schema.safeParse(content);
};

// ── Emptiness helper ──────────────────────────────────────────────────
//
// A section is "meaningful" if it has *something* worth rendering. The
// rule: if all visible-content fields are blank, hide the entire section
// banner. This is what makes "leave it empty and it disappears" work.

export function isSectionMeaningful(
  type: SectionTypeValue,
  content: unknown,
): boolean {
  if (!content || typeof content !== "object") return false;
  const c = content as Record<string, unknown>;
  switch (type) {
    case "DEBRIEF": {
      return Boolean(c.body) || Boolean(c.media) || Boolean(c.pullQuote);
    }
    case "RESULTS": {
      const stats = Array.isArray(c.stats) ? c.stats : [];
      const matches = Array.isArray(c.matches) ? c.matches : [];
      const press = Array.isArray(c.pressLinks) ? c.pressLinks : [];
      return (
        stats.length > 0 ||
        matches.length > 0 ||
        press.length > 0 ||
        Boolean(c.subSection)
      );
    }
    case "WHATS_NEXT": {
      const schedule = Array.isArray(c.schedule) ? c.schedule : [];
      return (
        Boolean(c.body) ||
        Boolean(c.media) ||
        Boolean(c.tournamentMeta) ||
        schedule.length > 0
      );
    }
    case "KIT": {
      const cta = c.cta as { url?: unknown } | undefined;
      return Boolean(c.body) || Boolean(c.imageUrl) || Boolean(cta?.url);
    }
    case "ENGAGEMENT": {
      const opts = Array.isArray(c.pollOptions) ? c.pollOptions : [];
      return Boolean(c.question) || opts.length > 0;
    }
    default:
      return false;
  }
}

// ── CRUD schemas ──────────────────────────────────────────────────────
//
// Sections only carry type + ordered content. Labels and titles are
// derived at render time from labels.ts — editors never set them.

export const addSectionSchema = z.object({
  type: sectionTypeSchema,
  content: z.unknown(),
  order: z.number().int().nonnegative().optional(),
});

export const updateSectionSchema = z.object({
  content: z.unknown().optional(),
});

export const reorderSectionsSchema = z.object({
  sectionIds: z.array(z.string().min(1)).min(1),
});

// ── Inferred types ────────────────────────────────────────────────────

export type MediaBlock = z.output<typeof mediaBlockSchema>;
export type VideoMedia = z.output<typeof videoMediaSchema>;
export type VoicenoteMedia = z.output<typeof voicenoteMediaSchema>;
export type MatchBlock = z.output<typeof matchBlockSchema>;
export type PressLink = z.output<typeof pressLinkSchema>;
export type StatBox = z.output<typeof statBoxSchema>;
export type PollOption = z.output<typeof pollOptionSchema>;
export type ScheduleItem = z.output<typeof scheduleItemSchema>;
export type PullQuote = z.output<typeof pullQuoteSchema>;

export type DebriefContent = z.output<typeof debriefContentSchema>;
export type ResultsContent = z.output<typeof resultsContentSchema>;
export type ResultsSubSection = z.output<typeof resultsSubSectionSchema>;
export type WhatsNextContent = z.output<typeof whatsNextContentSchema>;
export type KitContent = z.output<typeof kitContentSchema>;
export type EngagementContent = z.output<typeof engagementContentSchema>;

export type AddSectionInput = z.input<typeof addSectionSchema>;
export type AddSectionOutput = z.output<typeof addSectionSchema>;
export type UpdateSectionInput = z.input<typeof updateSectionSchema>;
export type UpdateSectionOutput = z.output<typeof updateSectionSchema>;
export type ReorderSectionsInput = z.input<typeof reorderSectionsSchema>;
