import { render } from "@faire/mjml-react/utils/render";
import { namedEntityToHexCode } from "@faire/mjml-react/utils";
import type { ReactElement } from "react";

export interface MjmlRenderResult {
  html: string;
  errors: ReadonlyArray<{ formattedMessage?: string; message?: string }>;
}

// Server-only. Do not import from client components — `mjml` core
// pulls in html-minifier / juice / parsers (~3MB).
export function renderMjmlEmail(element: ReactElement): MjmlRenderResult {
  const result = render(element, {
    validationLevel: "soft",
    minify: true,
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
