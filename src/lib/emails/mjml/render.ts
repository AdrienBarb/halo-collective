import { render } from "@faire/mjml-react/utils/render";
import { namedEntityToHexCode } from "@faire/mjml-react/utils";
import type { ReactElement } from "react";

export interface MjmlRenderResult {
  html: string;
  errors: ReadonlyArray<{ formattedMessage?: string; message?: string }>;
}

// Server-only. Do not import from client components — `mjml` core
// pulls in html-minifier / juice / parsers (~3MB).
//
// `minify` is intentionally disabled: @faire/mjml-react routes `minify: true`
// through html-minifier with `minifyCSS: true`, which mis-parses inline
// `style="..."` attributes whose values contain HTML-entity-escaped double
// quotes (`&#34;`). Every font stack in `_brand/theme.ts` includes literal
// double quotes (e.g. `"Segoe UI"`, `"Arial Black"`), so React serializes
// them as `&#34;` — the minifier then truncates the `font-family` value at
// the first escape and merges adjacent CSS properties into an unterminated
// string the browser rejects. The result is invisible text on any
// `<MjmlText><span style={{ fontFamily: fonts.X }}>` (IdentityBlock rank
// tiles, "Exclusive member" badge, BYE/EXEMPT pill, highlights button, etc.)
// because the spans inherit the parent dark color on dark backgrounds.
// Disabling minify trades ~50% output size for correctness; even long
// editions stay well under Gmail's 102KB clipping threshold.
export function renderMjmlEmail(element: ReactElement): MjmlRenderResult {
  const result = render(element, {
    validationLevel: "soft",
    minify: false,
    keepComments: false,
  });

  if (result.errors && result.errors.length > 0) {
    console.warn(
      "[mjml-render] validation errors:",
      result.errors.map((e) => e.formattedMessage ?? e.message),
    );
  }

  return {
    html: namedEntityToHexCode(result.html),
    errors: (result.errors ?? []) as MjmlRenderResult["errors"],
  };
}
