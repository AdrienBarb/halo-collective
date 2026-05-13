import { z } from "zod";

// Strict allowlist: blocks CSV-injection prefixes (=, +, @, -, \t, \r) so values
// flowing into HubSpot can never execute as Excel formulas when an agent exports.
const utmValue = z
  .string()
  .trim()
  .max(80)
  .regex(/^[a-zA-Z0-9_\-.]+$/, "invalid characters")
  .optional();

export const trackingParamsSchema = z
  .object({
    halo_utm_source: utmValue,
    halo_utm_campaign: utmValue,
  })
  .strict();

export type TrackingParams = z.infer<typeof trackingParamsSchema>;
