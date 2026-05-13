export const SHARE_PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "x", label: "X" },
] as const;

export type SharePlatform = (typeof SHARE_PLATFORMS)[number]["key"];

export function buildAthleteShareLink(
  athleteSlug: string,
  platform: SharePlatform,
): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://halocollective.co";
  const url = new URL(`/${athleteSlug}`, base);
  url.searchParams.set("halo_utm_source", platform);
  return url.toString();
}
