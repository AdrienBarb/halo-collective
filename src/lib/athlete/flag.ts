import { findCountry } from "@/lib/data/countries";

type FlagInfo = { emoji: string; stripe: readonly string[] };

const FALLBACK: FlagInfo = { emoji: "🏳️", stripe: ["#75674e"] };

function emojiFromIso2(iso2: string): string {
  if (iso2.length !== 2) return FALLBACK.emoji;
  const base = 0x1f1e6 - "A".charCodeAt(0);
  return String.fromCodePoint(
    base + iso2.charCodeAt(0),
    base + iso2.charCodeAt(1),
  );
}

export function flagFor(countryCode: string): FlagInfo {
  const country = findCountry(countryCode);
  if (!country) return FALLBACK;
  return {
    emoji: emojiFromIso2(country.iso2),
    stripe: country.stripe,
  };
}
