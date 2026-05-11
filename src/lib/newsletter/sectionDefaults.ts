import type { SectionTypeValue } from "@/lib/schemas/newsletterSection";

// The 5 sections in the order they always render. Hardcoded — there is
// no add/remove/reorder UI.
export const SECTION_ORDER: readonly SectionTypeValue[] = [
  "ATHLETE_REVIEW",
  "WEEK_RECAP",
  "COMING_UP",
  "MONETISATION",
  "FAN_ENGAGEMENT",
] as const;
