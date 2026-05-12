import { palette } from "@/lib/emails/_brand/theme";

// Force the brand palette to render consistently across every dark mode
// implementation. This is *not* a dark-mode design — it's a defensive
// override that prevents Gmail/Outlook/Apple from silently inverting
// colours and destroying contrast on the dark section headers.
//
// Coverage:
//   - <meta color-scheme>                   → Apple Mail, Outlook.com (opt-out of auto-invert)
//   - [data-ogsc]/[data-ogsb]               → Outlook.com dark mode (fg/bg hooks)
//   - @media (prefers-color-scheme: dark)   → Apple Mail / iOS
//   - u + #body                             → Gmail iOS dark mode (wraps body in <u>)
//   - [class~="..."]                        → defeats Gmail web's class rewriting
//
// `:root { color-scheme }` is intentionally NOT in the inline <style> —
// Gmail web has been observed to reject the entire stylesheet on parse
// when it encounters `:root`. The same directive is on a <meta> tag
// inside <Head>, which is the form Gmail honours.

interface ClassRule {
  className: string;
  property: "background-color" | "color";
  value: string;
}

const RULES: ClassRule[] = [
  { className: "force-dark-bg", property: "background-color", value: palette.panelDark },
  { className: "force-dark-fg", property: "color", value: palette.textOnDark },
  { className: "force-dark-fg-muted", property: "color", value: palette.textOnDarkMuted },
  { className: "force-light-bg", property: "background-color", value: palette.panel },
  { className: "force-light-fg", property: "color", value: palette.textPrimary },
  { className: "force-light-fg-muted", property: "color", value: palette.textMuted },
];

function ruleLines(scopePrefix: string): string {
  return RULES.map(
    (r) =>
      `${scopePrefix}.${r.className}, ${scopePrefix}[class~="${r.className}"] { ${r.property}: ${r.value} !important; }`,
  ).join("\n  ");
}

export const darkModeLockCss = `
  /* Outlook.com dark mode */
  ${ruleLines("[data-ogsc] ")}
  ${ruleLines("[data-ogsb] ")}

  /* Apple Mail / iOS dark mode */
  @media (prefers-color-scheme: dark) {
    ${RULES.map((r) => `.${r.className} { ${r.property}: ${r.value} !important; }`).join("\n    ")}
  }

  /* Gmail mobile dark mode (body wrapped in <u>) */
  ${ruleLines("u + #body ")}

  /* Mobile reflow */
  @media (max-width: 480px) {
    .hero-name {
      font-size: 26px !important;
      letter-spacing: 0 !important;
    }
    .sponsor-cell {
      padding: 8px 6px !important;
    }
  }
`;
