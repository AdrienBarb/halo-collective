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

export const subscribeSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  email: z.string().trim().toLowerCase().email("Invalid email").max(254),
  countryCode: countryCodeSchema,
  phone: phoneSchema,
  partnerOffersConsent: z.boolean().default(false),
  athleteNewsletterConsent: z.literal(true, {
    message: "You must agree to receive the newsletter",
  }),
  source: z.enum(SUBSCRIBE_SOURCES).optional(),
});

export type SubscribeInput = z.input<typeof subscribeSchema>;
export type SubscribeOutput = z.output<typeof subscribeSchema>;

export const subscribeAuthSchema = z.object({
  partnerOffersConsent: z.boolean().default(false),
  source: z.enum(SUBSCRIBE_SOURCES).optional(),
  // Optional profile patch — used after OTP sign-in to backfill user
  // values from the form the visitor just filled out anonymously.
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  countryCode: countryCodeSchema.optional(),
  phone: phoneSchema,
});

export type SubscribeAuthInput = z.input<typeof subscribeAuthSchema>;
export type SubscribeAuthOutput = z.output<typeof subscribeAuthSchema>;
