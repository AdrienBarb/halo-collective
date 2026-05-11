import { z } from "zod";
import {
  clearableDate,
  clearableMediaUrl,
  clearablePositiveInt,
  clearableTrimmedString,
  optionalMediaUrl,
  slugSchema,
} from "@/lib/schemas/common";
import { addSectionSchema } from "@/lib/schemas/newsletterSection";

const headerFields = {
  title: z.string().trim().min(1, "Title is required"),
  slug: slugSchema,
  heroImageUrl: clearableMediaUrl,
  editionNumber: z.coerce.number().int().positive(),
  editionDate: clearableDate,
  tournamentName: clearableTrimmedString,
  tournamentLogoUrl: clearableMediaUrl,
  tournamentContext: clearableTrimmedString,
  worldRankSnapshot: clearablePositiveInt,
  countryRankSnapshot: clearablePositiveInt,
};

export const createNewsletterSchema = z.object({
  athleteId: z.string().min(1, "Athlete is required"),
  ...headerFields,
  // For create, heroImageUrl is required-optional (no clearing semantics needed).
  heroImageUrl: optionalMediaUrl,
  tournamentLogoUrl: optionalMediaUrl,
  sections: z.array(addSectionSchema).optional(),
});

export const updateNewsletterSchema = z.object({
  title: headerFields.title.optional(),
  slug: headerFields.slug.optional(),
  heroImageUrl: headerFields.heroImageUrl,
  editionNumber: headerFields.editionNumber.optional(),
  editionDate: headerFields.editionDate,
  tournamentName: headerFields.tournamentName,
  tournamentLogoUrl: headerFields.tournamentLogoUrl,
  tournamentContext: headerFields.tournamentContext,
  worldRankSnapshot: headerFields.worldRankSnapshot,
  countryRankSnapshot: headerFields.countryRankSnapshot,
  sections: z.array(addSectionSchema).optional(),
});

export const newsletterFormSchema = updateNewsletterSchema
  .omit({ sections: true })
  .extend({
    title: headerFields.title,
    slug: headerFields.slug,
    editionNumber: headerFields.editionNumber,
  });

export type CreateNewsletterInput = z.input<typeof createNewsletterSchema>;
export type CreateNewsletterOutput = z.output<typeof createNewsletterSchema>;
export type UpdateNewsletterInput = z.input<typeof updateNewsletterSchema>;
export type UpdateNewsletterOutput = z.output<typeof updateNewsletterSchema>;
export type NewsletterFormInput = z.input<typeof newsletterFormSchema>;
