// Loose IPv4/IPv6 shape check — we only need to reject obvious garbage before
// shipping the value into HubSpot. Strict validation isn't worth it; this
// field is for legal audit, not addressing.
const IP_PATTERN = /^[0-9a-fA-F:.%]{3,45}$/;

/**
 * Reads the client IP from request headers. Prefers `x-vercel-forwarded-for`
 * (Vercel sets this on its edge and strips it from inbound traffic, so it
 * cannot be spoofed once you're behind Vercel) and falls back to
 * `x-forwarded-for` / `x-real-ip` for local dev and non-Vercel hosting.
 *
 * Returns null when no recognisable IP is present.
 */
export function getClientIp(headers: Pick<Headers, "get">): string | null {
  const vercel = headers.get("x-vercel-forwarded-for");
  if (vercel) {
    const candidate = vercel.split(",")[0]?.trim();
    if (candidate && IP_PATTERN.test(candidate)) return candidate;
  }
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const candidate = xff.split(",")[0]?.trim();
    if (candidate && IP_PATTERN.test(candidate)) return candidate;
  }
  const xri = headers.get("x-real-ip")?.trim();
  if (xri && IP_PATTERN.test(xri)) return xri;
  return null;
}
