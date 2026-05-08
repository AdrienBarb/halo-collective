import { z } from "zod";

const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes only");

const isAllowedMediaUrl = (raw: string): boolean => {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  if (parsed.protocol === "https:") {
    return parsed.hostname.endsWith(".supabase.co");
  }
  if (parsed.protocol === "http:" && process.env.NODE_ENV !== "production") {
    return parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
  }
  return false;
};

const mediaUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .refine(isAllowedMediaUrl, "Must be a Supabase storage URL");

const optionalMediaUrl = z
  .union([mediaUrl, z.literal(""), z.undefined()])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));

const optionalTrimmedString = z
  .union([z.string(), z.undefined()])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    const trimmed = v.trim();
    return trimmed === "" ? undefined : trimmed;
  });

export const debriefSchema = z.object({
  body: z.string().trim().min(1, "Debrief body is required"),
  pullQuote: optionalTrimmedString,
  pullQuoteContext: optionalTrimmedString,
  voiceNoteUrl: optionalMediaUrl,
  voiceNoteDurationSec: z
    .union([z.number().int().nonnegative(), z.null(), z.undefined()])
    .optional()
    .transform((v) => (v === null ? undefined : v)),
  voiceNoteLabel: optionalTrimmedString,
  voiceNoteLocation: optionalTrimmedString,
});

export const createNewsletterSchema = z.object({
  athleteId: z.string().min(1, "Athlete is required"),
  title: z.string().trim().min(1, "Title is required"),
  slug: slugSchema,
  heroImageUrl: optionalMediaUrl,
  debrief: debriefSchema,
});

export const updateNewsletterSchema = z.object({
  title: z.string().trim().min(1, "Title is required").optional(),
  slug: slugSchema.optional(),
  heroImageUrl: optionalMediaUrl,
  debrief: debriefSchema.optional(),
});

export type DebriefInput = z.input<typeof debriefSchema>;
export type DebriefOutput = z.output<typeof debriefSchema>;
export type CreateNewsletterInput = z.input<typeof createNewsletterSchema>;
export type CreateNewsletterOutput = z.output<typeof createNewsletterSchema>;
export type UpdateNewsletterInput = z.input<typeof updateNewsletterSchema>;
export type UpdateNewsletterOutput = z.output<typeof updateNewsletterSchema>;
