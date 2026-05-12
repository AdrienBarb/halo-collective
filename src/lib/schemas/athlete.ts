import { z } from "zod";
import { countryCodeSchema } from "@/lib/schemas/country";
import {
  boundedClearableTrimmedString,
  boundedTrimmedString,
  mediaUrl,
  optionalMediaUrl,
  optionalSafeUrl,
  optionalTrimmedString,
  personNameSchema,
  safeUrl,
  slugSchema,
} from "@/lib/schemas/common";

const WELCOME_MESSAGE_MAX = 4000;

// Empty string / null must short-circuit BEFORE z.coerce.number() — otherwise
// `""` coerces to 0 and an empty rank would persist as `0`, sorting that
// athlete to the top of the public listing.
const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().int().positive().optional(),
);

const socialLinksSchema = z
  .object({
    instagram: optionalSafeUrl,
    x: optionalSafeUrl,
    tiktok: optionalSafeUrl,
    facebook: optionalSafeUrl,
    linkedin: optionalSafeUrl,
    foundation: optionalSafeUrl,
  })
  .partial()
  .optional();

/**
 * Sponsors embedded in the athlete form payload. The full list is sent on
 * every save and the backend performs a full sync (delete-missing,
 * upsert-the-rest), so the editor never has to think about per-row CRUD.
 */
export const athleteSponsorInputSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1, "Name is required"),
  logoUrl: mediaUrl,
  websiteUrl: safeUrl,
});

export const athleteSponsorsSchema = z.array(athleteSponsorInputSchema).optional();

export const createAthleteSchema = z.object({
  slug: slugSchema,
  firstName: personNameSchema,
  lastName: personNameSchema,
  sport: z.enum(["TENNIS"]),
  tour: optionalTrimmedString,
  countryCode: countryCodeSchema,
  bio: optionalTrimmedString,
  avatarUrl: optionalSafeUrl,
  coverImageUrl: optionalMediaUrl,
  worldRank: optionalInt,
  countryRank: optionalInt,
  titlesCount: z.coerce.number().int().min(0).max(999),
  socialLinks: socialLinksSchema,
  welcomeMessage: boundedTrimmedString(WELCOME_MESSAGE_MAX),
  sponsors: athleteSponsorsSchema,
});

export const updateAthleteSchema = z.object({
  firstName: personNameSchema.optional(),
  lastName: personNameSchema.optional(),
  sport: z.enum(["TENNIS"]).optional(),
  tour: optionalTrimmedString,
  countryCode: countryCodeSchema.optional(),
  bio: optionalTrimmedString,
  avatarUrl: optionalSafeUrl,
  coverImageUrl: optionalMediaUrl,
  worldRank: optionalInt,
  countryRank: optionalInt,
  titlesCount: z.coerce.number().int().min(0).max(999).optional(),
  socialLinks: socialLinksSchema,
  welcomeMessage: boundedClearableTrimmedString(WELCOME_MESSAGE_MAX),
  sponsors: athleteSponsorsSchema,
});

export type AthleteSponsorInput = z.input<typeof athleteSponsorInputSchema>;
export type AthleteSponsorOutput = z.output<typeof athleteSponsorInputSchema>;

export type CreateAthleteInput = z.input<typeof createAthleteSchema>;
export type CreateAthleteOutput = z.output<typeof createAthleteSchema>;
export type UpdateAthleteInput = z.input<typeof updateAthleteSchema>;
export type UpdateAthleteOutput = z.output<typeof updateAthleteSchema>;
