import { z } from "zod";

const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes only");

const optionalUrl = z
  .union([z.string().trim().url("Must be a valid URL"), z.literal(""), z.undefined()])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));

export const createNewsletterSchema = z.object({
  athleteId: z.string().min(1, "Athlete is required"),
  title: z.string().trim().min(1, "Title is required"),
  slug: slugSchema,
  heroImageUrl: optionalUrl,
  body: z.string(),
});

export const updateNewsletterSchema = z.object({
  title: z.string().trim().min(1, "Title is required").optional(),
  slug: slugSchema.optional(),
  heroImageUrl: optionalUrl,
  body: z.string().optional(),
});

export type CreateNewsletterInput = z.input<typeof createNewsletterSchema>;
export type CreateNewsletterOutput = z.output<typeof createNewsletterSchema>;
export type UpdateNewsletterInput = z.input<typeof updateNewsletterSchema>;
export type UpdateNewsletterOutput = z.output<typeof updateNewsletterSchema>;
