type FlagInfo = { emoji: string; stripe: readonly string[] };

const FLAGS: Record<string, FlagInfo> = {
  POL: { emoji: "🇵🇱", stripe: ["#ffffff", "#b8001f"] },
  KAZ: { emoji: "🇰🇿", stripe: ["#009dbf", "#f5c500"] },
  ITA: { emoji: "🇮🇹", stripe: ["#009246", "#ffffff", "#ce2b37"] },
  FRA: { emoji: "🇫🇷", stripe: ["#002395", "#ffffff", "#ed2939"] },
  BEL: { emoji: "🇧🇪", stripe: ["#000000", "#ffd100", "#ef3340"] },
};

const FALLBACK: FlagInfo = { emoji: "🏳️", stripe: ["#75674e"] };

export function flagFor(countryCode: string): FlagInfo {
  return FLAGS[countryCode.toUpperCase()] ?? FALLBACK;
}
