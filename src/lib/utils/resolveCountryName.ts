import { COUNTRIES } from "@/lib/data/countries";

// Soft lookup: returns null for unknown codes. Use this on hot paths like
// CRM pushes where a missing country is a data quality issue, not a hard
// failure that should 500 the request. (The admin schema's strict variant
// throws — that's intentional for validated form input.)
export function resolveCountryName(
  countryCode: string | null | undefined,
): string | null {
  if (!countryCode) return null;
  return COUNTRIES.find((c) => c.code === countryCode)?.name ?? null;
}
