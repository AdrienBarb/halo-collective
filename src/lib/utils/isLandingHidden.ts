// Landing (`/`) is hidden in production — see src/app/page.tsx.
// Use this helper anywhere a link or redirect would otherwise point to `/`
// so the navbar wordmark, CTAs, and back-links stay coherent with that.
export function isLandingHidden(): boolean {
  return process.env.NEXT_PUBLIC_APP_ENV === "production";
}
