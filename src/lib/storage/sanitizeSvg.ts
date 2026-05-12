import DOMPurify from "isomorphic-dompurify";

// Allowed SVG tags. We deliberately drop `use`, `image`, `pattern`, `symbol`,
// and `marker` — they are only useful with `href`/`xlink:href`, which we strip
// entirely, so they would render as inert no-ops while keeping attack surface
// alive for any future DOMPurify bypass in those elements.
const ALLOWED_TAGS = [
  "svg",
  "g",
  "path",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "defs",
  "clipPath",
  "mask",
  "title",
  "desc",
  "linearGradient",
  "radialGradient",
  "stop",
  "ellipse",
];

const ALLOWED_ATTR = [
  "xmlns",
  "viewBox",
  "width",
  "height",
  "x",
  "y",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "d",
  "fill",
  "fill-rule",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-dasharray",
  "stroke-dashoffset",
  "opacity",
  "transform",
  "id",
  "class",
  "gradientUnits",
  "gradientTransform",
  "offset",
  "stop-color",
  "stop-opacity",
  "points",
  "preserveAspectRatio",
  "x1",
  "y1",
  "x2",
  "y2",
  "fx",
  "fy",
  "patternUnits",
  "spreadMethod",
];

const FORBID_TAGS = [
  "script",
  "iframe",
  "foreignObject",
  "style",
  "object",
  "embed",
  "textarea",
  "form",
  "input",
  "a",
];

const FORBID_ATTR = [
  "onerror",
  "onload",
  "onclick",
  "onmouseover",
  "onmouseout",
  "onmousedown",
  "onmouseup",
  "onmouseenter",
  "onmouseleave",
  "onchange",
  "onfocus",
  "onblur",
  "onkeydown",
  "onkeyup",
  "onkeypress",
  "onsubmit",
  "onreset",
  "onresize",
  "onscroll",
  "onwheel",
  "ondrag",
  "ondrop",
  "onbegin",
  "onend",
  "onrepeat",
  "formaction",
  "action",
  "href",
  "xlink:href",
];

export function sanitizeSvgString(raw: string): string {
  if (typeof raw !== "string" || raw.length === 0) {
    throw new Error("Empty SVG content");
  }

  const cleaned = DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: false },
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS,
    FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });

  const trimmed = cleaned.trim();
  if (!/^<svg[\s>]/i.test(trimmed) || !/<\/svg>\s*$/i.test(trimmed)) {
    throw new Error("Invalid SVG content");
  }
  return trimmed;
}
