// Compile-time drift guard between the strict newsletter schema
// (`newsletterSection.ts`) and the LLM-target schema (`newsletterImport.ts`).
//
// Both files declare per-section block-kind discriminated unions. If a
// new block kind is added to the strict schema without mirroring it in
// the LLM-target schema, the LLM will silently never emit that kind and
// the editor will see empty data. This file fails typecheck in that
// case, surfacing the drift at build time.
//
// To add a new block kind:
//   1. Define it in newsletterSection.ts (strict shape for form + DB)
//   2. Define a loose mirror in newsletterImport.ts (URL/id loosened)
//   3. typecheck passes — done. No assertion list to maintain.

import type {
  AthleteReviewBlock,
  ComingUpBlock,
  FanEngagementBlock,
  MonetisationBlock,
  WeekRecapTournamentBlock,
  WeekRecapWeeklyBlock,
} from "@/lib/schemas/newsletterSection";
import type { NewsletterImportOutput } from "@/lib/schemas/newsletterImport";

type KindOf<T> = T extends { kind: infer K } ? K : never;

type ImportSections = NonNullable<NewsletterImportOutput["sections"]>;

type ImportKindsForSection<K extends keyof ImportSections> =
  NonNullable<ImportSections[K]> extends { blocks: Array<infer B> }
    ? KindOf<B>
    : never;

// `Assert<true>` compiles; `Assert<false>` is a type error.
type Assert<T extends true> = T;
type Extends<A, B> = [A] extends [B] ? true : false;

// Each strict block kind must be a subset of the LLM-target kinds for
// the same section. WEEK_RECAP is a union of tournament + weekly.
type _AR = Assert<
  Extends<KindOf<AthleteReviewBlock>, ImportKindsForSection<"ATHLETE_REVIEW">>
>;
type _WR_T = Assert<
  Extends<KindOf<WeekRecapTournamentBlock>, ImportKindsForSection<"WEEK_RECAP">>
>;
type _WR_W = Assert<
  Extends<KindOf<WeekRecapWeeklyBlock>, ImportKindsForSection<"WEEK_RECAP">>
>;
type _CU = Assert<
  Extends<KindOf<ComingUpBlock>, ImportKindsForSection<"COMING_UP">>
>;
type _MN = Assert<
  Extends<KindOf<MonetisationBlock>, ImportKindsForSection<"MONETISATION">>
>;
type _FE = Assert<
  Extends<KindOf<FanEngagementBlock>, ImportKindsForSection<"FAN_ENGAGEMENT">>
>;

// Mark types as used so they're not stripped as dead code.
export type _DriftGuard = [_AR, _WR_T, _WR_W, _CU, _MN, _FE];
