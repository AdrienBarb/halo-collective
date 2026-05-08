// Court Cream palette — mirrors the CSS variables in src/app/globals.css.
// Inlined here because email clients don't support CSS custom properties.
export const palette = {
  cream: "#f1ebde",
  cream2: "#fbf6e9",
  cream3: "#e9e0cb",
  ink: "#1a1612",
  ink2: "#3d3528",
  ink3: "#75674e",
  line: "#d8cfb6",
  line2: "#beb295",
  accentGold: "#c8932e",
  accentWarm: "#d4a04a",
  loss: "#7a1f1f",
} as const;

// Email-safe font stacks (web fonts don't reliably load in Outlook/Gmail clients).
export const fonts = {
  serif: 'Georgia, "Times New Roman", Times, serif',
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: '"SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
} as const;
