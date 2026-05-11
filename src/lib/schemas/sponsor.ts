import { z } from "zod";
import { mediaUrl, safeUrl } from "@/lib/schemas/common";

export const createSponsorSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  logoUrl: mediaUrl,
  websiteUrl: safeUrl,
  order: z.coerce.number().int().nonnegative().optional(),
});

export const updateSponsorSchema = z.object({
  name: z.string().trim().min(1).optional(),
  logoUrl: mediaUrl.optional(),
  websiteUrl: safeUrl.optional(),
  order: z.coerce.number().int().nonnegative().optional(),
});

export const reorderSponsorsSchema = z.object({
  sponsorIds: z.array(z.string().min(1)).min(1),
});

export type CreateSponsorInput = z.input<typeof createSponsorSchema>;
export type CreateSponsorOutput = z.output<typeof createSponsorSchema>;
export type UpdateSponsorInput = z.input<typeof updateSponsorSchema>;
export type UpdateSponsorOutput = z.output<typeof updateSponsorSchema>;
