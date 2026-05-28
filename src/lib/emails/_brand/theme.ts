// Email-only palette. Intentionally diverges from the web reader's
// "Court Cream" tokens (see src/app/globals.css) — the email surface
// adopts a sportier navy/teal/cream system inspired by the Brevo
// reference template. Web reader keeps its existing brand.
//
// All small/uppercase copy below 14px is held to WCAG AA contrast
// (≥4.5:1) against the surface it sits on. Don't introduce a new
// muted color without checking the ratio first.
export const palette = {
  // Surfaces
  surface: "#EDEAE3",       // outer page bg (warm off-white)
  panel: "#FFFFFF",         // content panels
  panelMuted: "#F5F3EF",    // voice notes, alternating poll rows
  panelDark: "#0A1F3D",     // section header bands, footer band
  panelStat: "#2D3748",     // stat tiles (slightly lighter navy)

  // Text
  textPrimary: "#0A1F3D",   // primary on light
  textBody: "#555555",      // body copy
  textMuted: "#6B6B6B",     // labels, meta, dates  (4.6:1 on white — AA)
  textOnDark: "#FFFFFF",    // primary on navy
  textOnDarkMuted: "#A8B8D0", // muted on navy  (5.4:1 on #0A1F3D — AA)
  textOnAccent: "#FFFFFF",  // text on teal

  // Accent
  accent: "#009DBF",        // teal — links, CTAs, highlights button
  accentText: "#FFFFFF",    // text on accent

  // Borders
  border: "#EBEBEB",        // primary divider
  borderSoft: "#E8E0D8",    // soft cream divider on light surfaces

  // Status
  win: "#0A7A34",
  loss: "#CC2233",
  bye: "#999999",
} as const;

// Email-safe font stacks. Web fonts don't reliably load in Outlook/Gmail
// clients, so we use system-resident families only. The stacks below
// approximate the web brand (Barlow Condensed + Inter) using the closest
// system equivalents — recipients with the brand fonts installed locally
// will see them; everyone else falls back gracefully.
//
//  display → Barlow Condensed approximation (Arial Narrow on Windows/Office,
//            Helvetica Neue Condensed on Apple)
//  sans    → Inter, leading with the user's local install before OS sans
//  serif   → deprecated; remaining references are migrating to display/sans
//  mono    → OTP code display only
export const fonts = {
  display: '"Barlow Condensed", "Helvetica Neue Condensed", "Arial Narrow", Oswald, Impact, Helvetica, Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", Times, serif',
  sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: '"SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
} as const;
