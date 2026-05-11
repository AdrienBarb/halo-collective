import type { SectionTypeValue } from "@/lib/schemas/newsletterSection";

// The 5 sections in the order they always render. Hardcoded — there is
// no add/remove/reorder UI.
export const SECTION_ORDER: readonly SectionTypeValue[] = [
  "DEBRIEF",
  "RESULTS",
  "WHATS_NEXT",
  "KIT",
  "ENGAGEMENT",
] as const;

// Per-type empty content shapes. Used (a) when seeding a new newsletter,
// and (b) when an existing newsletter doesn't have a row for one of the
// 5 types yet.
export function emptyContentFor(type: SectionTypeValue): unknown {
  switch (type) {
    case "DEBRIEF":
      return {};
    case "RESULTS":
      return { stats: [], matches: [] };
    case "WHATS_NEXT":
      return { schedule: [] };
    case "KIT":
      return {};
    case "ENGAGEMENT":
      return { pollOptions: [] };
  }
}
