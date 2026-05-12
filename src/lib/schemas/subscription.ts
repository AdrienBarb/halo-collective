import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { countryCodeSchema } from "@/lib/schemas/country";

const SUBSCRIBE_SOURCES = [
  "athlete-page",
  "ig-bio",
  "tiktok-bio",
  "qr",
  "manual",
  "share",
] as const;

const phoneSchema = z
  .string()
  .trim()
  .max(32, "Invalid phone number")
  .refine((v) => v === "" || isValidPhoneNumber(v), "Invalid phone number")
  .transform((v) => (v === "" ? undefined : v))
  .optional();

export const subscribeAuthSchema = z.object({
  partnerOffersConsent: z.boolean().default(false),
  source: z.enum(SUBSCRIBE_SOURCES).optional(),
  // Optional profile patch — for callers that want to backfill missing user
  // fields at subscribe time (e.g. an admin import path).
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  countryCode: countryCodeSchema.optional(),
  phone: phoneSchema,
});

export type SubscribeAuthInput = z.input<typeof subscribeAuthSchema>;
export type SubscribeAuthOutput = z.output<typeof subscribeAuthSchema>;
