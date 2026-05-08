import { z } from "zod";
import { COUNTRIES, isValidDialCode } from "@/lib/data/countries";

export const countryCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine(
    (code) => COUNTRIES.some((c) => c.code === code),
    "Unknown country code",
  );

export const dialCodeSchema = z
  .string()
  .trim()
  .refine(isValidDialCode, "Unknown dial code");
