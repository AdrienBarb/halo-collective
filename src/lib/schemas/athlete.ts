import { z } from "zod";
import { countryCodeSchema } from "@/lib/schemas/country";

const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes only");

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));

const optionalUrl = z
  .union([z.string().trim().url("Must be a valid URL"), z.literal(""), z.undefined()])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));

const optionalInt = z
  .union([z.coerce.number().int(), z.literal(""), z.undefined()])
  .optional()
  .transform((v) =>
    v === "" || v === undefined ? undefined : v,
  );

export const createAthleteSchema = z.object({
  slug: slugSchema,
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  sport: z.enum(["TENNIS"]),
  tour: optionalString,
  countryCode: countryCodeSchema,
  bio: optionalString,
  avatarUrl: optionalUrl,
  worldRank: optionalInt,
  countryRank: optionalInt,
  titlesCount: z.coerce.number().int().min(0),
});

export const updateAthleteSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  sport: z.enum(["TENNIS"]).optional(),
  tour: optionalString,
  countryCode: countryCodeSchema.optional(),
  bio: optionalString,
  avatarUrl: optionalUrl,
  worldRank: optionalInt,
  countryRank: optionalInt,
  titlesCount: z.coerce.number().int().min(0).optional(),
});

export type CreateAthleteInput = z.input<typeof createAthleteSchema>;
export type CreateAthleteOutput = z.output<typeof createAthleteSchema>;
export type UpdateAthleteInput = z.input<typeof updateAthleteSchema>;
export type UpdateAthleteOutput = z.output<typeof updateAthleteSchema>;
