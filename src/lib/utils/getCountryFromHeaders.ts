const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

/**
 * Extracts the 2-letter ISO country code from Vercel's `x-vercel-ip-country`
 * header. Returns `null` when:
 * - the runtime isn't Vercel (the header is user-controlled outside Vercel's
 *   edge — never trust it on local dev, self-hosted, or non-Vercel previews);
 * - the header is absent, malformed, or set to a sentinel like "XX"/"T1".
 *
 * Accepts a `Headers` instance (from `next/headers` or a `NextRequest`).
 */
export function getCountryFromHeaders(
  headers: Pick<Headers, "get">,
): string | null {
  // Vercel edge sets `x-vercel-id` on every request it handles and strips
  // inbound `x-vercel-*` headers. Use it as a marker for "we're behind Vercel
  // infra" so the country header can't be spoofed off-platform.
  if (!headers.get("x-vercel-id")) return null;

  const raw = headers.get("x-vercel-ip-country");
  if (!raw) return null;
  const value = raw.trim().toUpperCase();
  if (!COUNTRY_CODE_PATTERN.test(value)) return null;
  if (value === "XX" || value === "T1") return null; // Tor / unknown
  return value;
}
