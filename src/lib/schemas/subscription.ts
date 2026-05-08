import { z } from "zod";
import { countryCodeSchema, dialCodeSchema } from "@/lib/schemas/country";

const SUBSCRIBE_SOURCES = [
  "athlete-page",
  "ig-bio",
  "tiktok-bio",
  "qr",
  "manual",
  "share",
] as const;

const phoneNumberSchema = z
  .string()
  .trim()
  .refine(
    (v) => /^\d{6,15}$/.test(v.replace(/\s+/g, "")),
    "Phone number must contain 6–15 digits",
  );

export const subscribeSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().trim().toLowerCase().email("Invalid email"),
    countryCode: countryCodeSchema,
    phoneCountryCode: dialCodeSchema.optional(),
    phoneNumber: phoneNumberSchema.optional(),
    partnerOffersConsent: z.boolean().default(false),
    athleteNewsletterConsent: z.literal(true, {
      message: "You must agree to receive the newsletter",
    }),
    source: z.enum(SUBSCRIBE_SOURCES).optional(),
  })
  .superRefine((value, ctx) => {
    const hasCode = !!value.phoneCountryCode;
    const hasNumber = !!value.phoneNumber;
    if (hasCode !== hasNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide both dial code and phone number, or leave both empty",
        path: hasNumber ? ["phoneCountryCode"] : ["phoneNumber"],
      });
    }
  });

export type SubscribeInput = z.input<typeof subscribeSchema>;
export type SubscribeOutput = z.output<typeof subscribeSchema>;
