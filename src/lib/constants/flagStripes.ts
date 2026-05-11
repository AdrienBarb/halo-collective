const FLAG_STRIPES: Record<string, readonly string[]> = {
  FR: ["#002395", "#FFFFFF", "#ED2939"],
  IT: ["#009246", "#FFFFFF", "#CE2B37"],
  POL: ["#FFFFFF", "#B8001F"],
  PL: ["#FFFFFF", "#B8001F"],
  USA: ["#B22234", "#FFFFFF", "#3C3B6E"],
  US: ["#B22234", "#FFFFFF", "#3C3B6E"],
  GER: ["#000000", "#DD0000", "#FFCE00"],
  DE: ["#000000", "#DD0000", "#FFCE00"],
  ESP: ["#AA151B", "#F1BF00", "#AA151B"],
  ES: ["#AA151B", "#F1BF00", "#AA151B"],
  GBR: ["#012169", "#FFFFFF", "#C8102E"],
  GB: ["#012169", "#FFFFFF", "#C8102E"],
  SUI: ["#FFFFFF", "#FF0000", "#FFFFFF"],
  CH: ["#FFFFFF", "#FF0000", "#FFFFFF"],
  ARG: ["#74ACDF", "#FFFFFF", "#74ACDF"],
  AR: ["#74ACDF", "#FFFFFF", "#74ACDF"],
  BEL: ["#000000", "#FAE042", "#ED2939"],
  BE: ["#000000", "#FAE042", "#ED2939"],
};

const FALLBACK: readonly string[] = ["#CCCCCC", "#E5E5E5", "#CCCCCC"];

export const getFlagStripe = (countryCode: string): readonly string[] => {
  const normalized = countryCode?.toUpperCase().trim() ?? "";
  return FLAG_STRIPES[normalized] ?? FALLBACK;
};
