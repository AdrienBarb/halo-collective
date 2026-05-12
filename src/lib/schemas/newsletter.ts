import { z } from "zod";
import {
  clearableDate,
  clearableMediaUrl,
  clearablePositiveInt,
  clearableTrimmedString,
  optionalMediaUrl,
  slugSchema,
} from "@/lib/schemas/common";
import { addSectionSchema, editionModeSchema } from "@/lib/schemas/newsletterSection";

const headerFields = {
  // Title is also used as the Brevo email subject — block line breaks
  // and tabs so a malicious or compromised admin can't inject headers,
  // and cap length to keep subject lines sane.
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer")
    .regex(/^[^\r\n\t]+$/, "Title cannot contain line breaks or tabs"),
  // Optional Brevo subject override — supports merge tags like
  // `{{ contact.FIRSTNAME }}`, sent to Brevo as-is for interpolation.
  // Preserve `undefined` (omitted from PATCH) vs `null` (explicit
  // clear) — `undefined` lets Prisma skip the column on partial update.
  emailSubject: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (v === null) return null;
      const trimmed = v.trim();
      return trimmed === "" ? null : trimmed;
    })
    .refine(
      (v) => v == null || v.length <= 200,
      { message: "Email subject must be 200 characters or fewer" },
    )
    .refine(
      (v) => v == null || /^[^\r\n\t]+$/.test(v),
      { message: "Email subject cannot contain line breaks or tabs" },
    ),
  slug: slugSchema,
  heroImageUrl: clearableMediaUrl,
  editionNumber: z.coerce.number().int().positive(),
  editionDate: clearableDate,
  editionMode: editionModeSchema.default("WEEKLY"),
  tournamentName: clearableTrimmedString,
  tournamentLogoUrl: clearableMediaUrl,
  tournamentCategory: clearableTrimmedString,
  tournamentLocation: clearableTrimmedString,
  tournamentSurface: clearableTrimmedString,
  tournamentStartDate: clearableDate,
  tournamentEndDate: clearableDate,
  worldRankSnapshot: clearablePositiveInt,
  countryRankSnapshot: clearablePositiveInt,
};

export const createNewsletterSchema = z.object({
  athleteId: z.string().min(1, "Athlete is required"),
  ...headerFields,
  heroImageUrl: optionalMediaUrl,
  tournamentLogoUrl: optionalMediaUrl,
  sections: z.array(addSectionSchema).optional(),
});

export const updateNewsletterSchema = z.object({
  title: headerFields.title.optional(),
  emailSubject: headerFields.emailSubject,
  slug: headerFields.slug.optional(),
  heroImageUrl: headerFields.heroImageUrl,
  editionNumber: headerFields.editionNumber.optional(),
  editionDate: headerFields.editionDate,
  editionMode: headerFields.editionMode.optional(),
  tournamentName: headerFields.tournamentName,
  tournamentLogoUrl: headerFields.tournamentLogoUrl,
  tournamentCategory: headerFields.tournamentCategory,
  tournamentLocation: headerFields.tournamentLocation,
  tournamentSurface: headerFields.tournamentSurface,
  tournamentStartDate: headerFields.tournamentStartDate,
  tournamentEndDate: headerFields.tournamentEndDate,
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
    editionMode: headerFields.editionMode,
  });

export type CreateNewsletterInput = z.input<typeof createNewsletterSchema>;
export type CreateNewsletterOutput = z.output<typeof createNewsletterSchema>;
export type UpdateNewsletterInput = z.input<typeof updateNewsletterSchema>;
export type UpdateNewsletterOutput = z.output<typeof updateNewsletterSchema>;
export type NewsletterFormInput = z.input<typeof newsletterFormSchema>;
