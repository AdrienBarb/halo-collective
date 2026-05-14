import { z } from "zod";
import {
  mediaUrl,
  optionalMediaUrl,
  optionalSafeUrl,
  optionalTrimmedString,
  safeUrl,
} from "@/lib/schemas/common";

// ── Length caps ───────────────────────────────────────────────────────
//
// Tight per-field caps prevent megabyte-sized fields landing in jsonb +
// fan inboxes. Tuned to comfortable editorial use; any field exceeding
// these limits in practice means the editor should split the block.

const SHORT = 200;
const LABEL = 120;
const BODY = 5_000;
const PROMPT = 1_000;
const URL_MAX = 2_048;

const shortText = (min = 1) =>
  z.string().trim().min(min).max(SHORT, `Must be ${SHORT} characters or fewer`);
const bodyText = (min = 1) =>
  z.string().trim().min(min).max(BODY, `Must be ${BODY} characters or fewer`);
const promptText = (min = 1) =>
  z.string().trim().min(min).max(PROMPT, `Must be ${PROMPT} characters or fewer`);
const labelText = (min = 1) =>
  z.string().trim().min(min).max(LABEL, `Must be ${LABEL} characters or fewer`);

// Optional per-section custom title. Trimmed; empty → null so renderers
// can fall back to the static default from `lib/newsletter/labels.ts`.
// Same line-break/tab rejection as the newsletter title because this
// string also lands in HTML email headers where stray CRs would corrupt
// downstream Brevo headers if ever surfaced there.
export const optionalSectionTitle = z
  .union([z.string(), z.null(), z.undefined()])
  .optional()
  .transform((v) => {
    if (v == null) return null;
    const trimmed = v.trim();
    return trimmed === "" ? null : trimmed;
  })
  .refine((v) => v == null || v.length <= LABEL, {
    message: `Must be ${LABEL} characters or fewer`,
  })
  .refine((v) => v == null || /^[^\r\n\t]+$/.test(v), {
    message: "Title cannot contain line breaks or tabs",
  });

const cappedMediaUrl = mediaUrl.max(URL_MAX);
const cappedOptionalMediaUrl = optionalMediaUrl;
const cappedSafeUrl = safeUrl.max(URL_MAX);
const cappedOptionalSafeUrl = optionalSafeUrl;

// ── Enums ─────────────────────────────────────────────────────────────

export const sectionTypeSchema = z
  .enum([
    "ATHLETE_REVIEW",
    "WEEK_RECAP",
    "COMING_UP",
    "MONETISATION",
    "FAN_ENGAGEMENT",
  ])
  .describe(
    "One of the five fixed newsletter sections. ATHLETE_REVIEW = athlete's first-person debrief/voicenote. WEEK_RECAP = results, matches, training, social, press. COMING_UP = next tournaments, schedule, training plan. MONETISATION = kit, partner content, affiliate links, paid products. FAN_ENGAGEMENT = polls, predictions, quizzes, Q&A, prize draws.",
  );

export type SectionTypeValue = z.infer<typeof sectionTypeSchema>;

export const editionModeSchema = z
  .enum(["TOURNAMENT", "WEEKLY"])
  .describe(
    "TOURNAMENT when the source describes a single tournament/event (results, opponents, scores). WEEKLY for a general weekly recap with training, social, and stats but no single tournament focus.",
  );

export type EditionModeValue = z.infer<typeof editionModeSchema>;

// Stable per-block identifier used for future tracking. Admin form mints
// `crypto.randomUUID()` when a block is added; importJson sanitiser fills
// it in if missing. Required so we never persist a block without an id.
const blockId = z.string().uuid({ message: "Block id must be a UUID" });

// Per-section block array cap. 50 is generous for editorial use and
// bounds the worst-case JSON payload size.
const MAX_BLOCKS_PER_SECTION = 50;
const MAX_OPTIONS_PER_BLOCK = 20;
const MAX_LINKS_PER_BLOCK = 20;

// ── Shared MediaBlock primitive ───────────────────────────────────────

const textMediaSchema = z.object({
  kind: z.literal("text"),
  body: bodyText(),
});

const imageMediaSchema = z.object({
  kind: z.literal("image"),
  url: cappedMediaUrl,
  // Empty string is allowed and means "decorative" (the form UI nudges
  // editors to fill it in; the renderer treats empty alt as decorative).
  alt: z
    .string()
    .trim()
    .max(SHORT, `Must be ${SHORT} characters or fewer`)
    .default(""),
});

const audioMediaSchema = z.object({
  kind: z.literal("audio"),
  url: cappedMediaUrl,
  title: optionalTrimmedString,
  location: optionalTrimmedString,
  durationLabel: optionalTrimmedString,
});

const videoMediaSchema = z.object({
  kind: z.literal("video"),
  url: cappedSafeUrl,
  thumbnailUrl: cappedOptionalMediaUrl,
});

export const mediaBlockSchema = z.discriminatedUnion("kind", [
  textMediaSchema,
  imageMediaSchema,
  audioMediaSchema,
  videoMediaSchema,
]);

const optionalNestedMedia = mediaBlockSchema.optional();

// Pull-quote primitive — used by ATHLETE_REVIEW and WEEK_RECAP (weekly).
const quoteBlockSchema = z.object({
  kind: z.literal("quote"),
  text: bodyText(),
  attribution: optionalTrimmedString,
});

// ── ATHLETE_REVIEW blocks ─────────────────────────────────────────────

export const athleteReviewBlockSchema = z.discriminatedUnion("kind", [
  textMediaSchema,
  imageMediaSchema,
  audioMediaSchema,
  videoMediaSchema,
  quoteBlockSchema,
]);

// ── WEEK_RECAP — TOURNAMENT blocks ────────────────────────────────────

const tournamentSummaryBlockSchema = z.object({
  kind: z.literal("tournament_summary"),
  logoUrl: cappedOptionalMediaUrl,
  name: shortText(),
  category: optionalTrimmedString,
  location: optionalTrimmedString,
  surface: optionalTrimmedString,
  dateRange: optionalTrimmedString,
});

const heroMetricBlockSchema = z.object({
  kind: z.literal("hero_metric"),
  value: shortText(),
  label: shortText(),
});

const matchCardBlockSchema = z.object({
  kind: z.literal("match_card"),
  // .default lets old persisted blocks (pre-format) parse as "singles"
  // so no DB migration is needed — Zod backfills on read.
  format: z.enum(["singles", "doubles"]).default("singles"),
  result: z.enum(["W", "L", "BYE", "EXEMPT"]),
  roundName: shortText(),
  opponentName: optionalTrimmedString,
  opponentCountry: optionalTrimmedString,
  opponentRank: optionalTrimmedString,
  score: optionalTrimmedString,
  date: optionalTrimmedString,
  contextNote: optionalTrimmedString,
  commentary: bodyText().optional(),
  highlightUrl: cappedOptionalSafeUrl,
});

const mediaLinkBlockSchema = z.object({
  kind: z.literal("media_link"),
  source: shortText(),
  headline: shortText(),
  url: cappedSafeUrl,
  ctaLabel: optionalTrimmedString,
});

export const weekRecapTournamentBlockSchema = z.discriminatedUnion("kind", [
  tournamentSummaryBlockSchema,
  heroMetricBlockSchema,
  matchCardBlockSchema,
  mediaLinkBlockSchema,
]);

// ── WEEK_RECAP — WEEKLY blocks ────────────────────────────────────────

const trainingUpdateBlockSchema = z.object({
  kind: z.literal("training_update"),
  body: bodyText(),
  media: optionalNestedMedia,
});

const recoveryTravelUpdateBlockSchema = z.object({
  kind: z.literal("recovery_travel_update"),
  body: bodyText(),
  media: optionalNestedMedia,
});

const socialPostSchema = z.object({
  url: cappedSafeUrl,
  caption: optionalTrimmedString,
});

const socialRecapBlockSchema = z.object({
  kind: z.literal("social_recap"),
  posts: z.array(socialPostSchema).min(1).max(MAX_LINKS_PER_BLOCK),
});

const mediaRecapLinkSchema = z.object({
  source: shortText(),
  headline: shortText(),
  url: cappedSafeUrl,
});

const mediaRecapBlockSchema = z.object({
  kind: z.literal("media_recap"),
  links: z.array(mediaRecapLinkSchema).min(1).max(MAX_LINKS_PER_BLOCK),
});

const statsUpdateBlockSchema = z.object({
  kind: z.literal("stats_update"),
  body: optionalTrimmedString,
  rankingCurrent: optionalTrimmedString,
  rankingChange: optionalTrimmedString,
});

const throwbackBlockSchema = z.object({
  kind: z.literal("throwback"),
  body: bodyText(),
  media: optionalNestedMedia,
});

export const weekRecapWeeklyBlockSchema = z.discriminatedUnion("kind", [
  trainingUpdateBlockSchema,
  recoveryTravelUpdateBlockSchema,
  socialRecapBlockSchema,
  mediaRecapBlockSchema,
  statsUpdateBlockSchema,
  throwbackBlockSchema,
  quoteBlockSchema,
]);

// ── COMING_UP blocks ──────────────────────────────────────────────────

const scheduleItemBlockSchema = z.object({
  kind: z.literal("schedule_item"),
  dateRange: shortText(),
  title: shortText(),
  description: bodyText(),
});

const ctaBlockSchema = z.object({
  kind: z.literal("cta"),
  label: labelText(),
  url: cappedSafeUrl,
});

export const comingUpBlockSchema = z.discriminatedUnion("kind", [
  textMediaSchema,
  imageMediaSchema,
  audioMediaSchema,
  videoMediaSchema,
  scheduleItemBlockSchema,
  ctaBlockSchema,
]);

// ── MONETISATION blocks ───────────────────────────────────────────────

const ctaSchema = z.object({
  label: labelText(),
  url: cappedSafeUrl,
});

const monetisationBaseFields = {
  id: blockId,
  title: shortText(),
  body: bodyText().optional(),
  media: optionalNestedMedia,
  cta: ctaSchema,
};

const kitBlockSchema = z.object({
  kind: z.literal("kit"),
  price: optionalTrimmedString,
  ...monetisationBaseFields,
});

const partnerContentBlockSchema = z.object({
  kind: z.literal("partner_content"),
  partnerName: optionalTrimmedString,
  ...monetisationBaseFields,
});

const affiliateBlockSchema = z.object({
  kind: z.literal("affiliate"),
  ...monetisationBaseFields,
});

const paidContentBlockSchema = z.object({
  kind: z.literal("paid_content"),
  ...monetisationBaseFields,
});

const athleteProductBlockSchema = z.object({
  kind: z.literal("athlete_product"),
  price: optionalTrimmedString,
  ...monetisationBaseFields,
});

const donationBlockSchema = z.object({
  kind: z.literal("donation"),
  goalLabel: optionalTrimmedString,
  ...monetisationBaseFields,
});

const fanExperienceBlockSchema = z.object({
  kind: z.literal("fan_experience"),
  dateLabel: optionalTrimmedString,
  ...monetisationBaseFields,
});

export const monetisationBlockSchema = z.discriminatedUnion("kind", [
  kitBlockSchema,
  partnerContentBlockSchema,
  affiliateBlockSchema,
  paidContentBlockSchema,
  athleteProductBlockSchema,
  donationBlockSchema,
  fanExperienceBlockSchema,
]);

// ── FAN_ENGAGEMENT blocks ─────────────────────────────────────────────

const pollOptionEngagementSchema = z.object({
  label: labelText(),
  emoji: optionalTrimmedString,
  isHighlighted: z.boolean().default(false),
});

const quizOptionSchema = z.object({
  label: labelText(),
  isCorrect: z.boolean().default(false),
});

const pollBlockSchema = z.object({
  kind: z.literal("poll"),
  id: blockId,
  question: promptText(),
  options: z.array(pollOptionEngagementSchema).min(2).max(MAX_OPTIONS_PER_BLOCK),
  closesAt: optionalTrimmedString,
});

const predictionBlockSchema = z.object({
  kind: z.literal("prediction"),
  id: blockId,
  prompt: promptText(),
  options: z.array(pollOptionEngagementSchema).max(MAX_OPTIONS_PER_BLOCK).default([]),
  closesAt: optionalTrimmedString,
});

const quizBlockSchema = z.object({
  kind: z.literal("quiz"),
  id: blockId,
  question: promptText(),
  options: z.array(quizOptionSchema).min(2).max(MAX_OPTIONS_PER_BLOCK),
  closesAt: optionalTrimmedString,
});

const prizeDrawBlockSchema = z.object({
  kind: z.literal("prize_draw"),
  id: blockId,
  title: shortText(),
  body: bodyText().optional(),
  prizeMedia: optionalNestedMedia,
  ctaLabel: optionalTrimmedString,
  closesAt: optionalTrimmedString,
});

const qaBlockSchema = z.object({
  kind: z.literal("qa"),
  id: blockId,
  prompt: promptText(),
  intro: optionalTrimmedString,
  reassurance: optionalTrimmedString,
});

const surveyBlockSchema = z.object({
  kind: z.literal("survey"),
  id: blockId,
  title: shortText(),
  body: bodyText().optional(),
  externalUrl: cappedOptionalSafeUrl,
});

const challengeBlockSchema = z.object({
  kind: z.literal("challenge"),
  id: blockId,
  title: shortText(),
  brief: bodyText(),
  media: optionalNestedMedia,
});

export const fanEngagementBlockSchema = z.discriminatedUnion("kind", [
  pollBlockSchema,
  predictionBlockSchema,
  quizBlockSchema,
  prizeDrawBlockSchema,
  qaBlockSchema,
  surveyBlockSchema,
  challengeBlockSchema,
]);

// ── Block-kind metadata (single source of truth) ──────────────────────
//
// Used by the importJson sanitiser to decide which kinds need a stable
// `id`. Derived from the schema option literals so a new kind can't
// drift out of sync — adding a kind to a union below auto-extends the
// set without any cross-file coordination.

export const MONETISATION_KINDS: readonly string[] = monetisationBlockSchema.options.map(
  (o) => o.shape.kind.value,
);
export const FAN_ENGAGEMENT_KINDS: readonly string[] = fanEngagementBlockSchema.options.map(
  (o) => o.shape.kind.value,
);
export const ID_BEARING_KINDS: ReadonlySet<string> = new Set<string>([
  ...MONETISATION_KINDS,
  ...FAN_ENGAGEMENT_KINDS,
]);

// ── Section → block-list schema resolver ──────────────────────────────

type BlocksByType = {
  ATHLETE_REVIEW: z.ZodArray<typeof athleteReviewBlockSchema>;
  WEEK_RECAP:
    | z.ZodArray<typeof weekRecapTournamentBlockSchema>
    | z.ZodArray<typeof weekRecapWeeklyBlockSchema>;
  COMING_UP: z.ZodArray<typeof comingUpBlockSchema>;
  MONETISATION: z.ZodArray<typeof monetisationBlockSchema>;
  FAN_ENGAGEMENT: z.ZodArray<typeof fanEngagementBlockSchema>;
};

export function blocksFor<T extends SectionTypeValue>(
  type: T,
  mode: EditionModeValue,
): BlocksByType[T] {
  switch (type) {
    case "ATHLETE_REVIEW":
      return z.array(athleteReviewBlockSchema).max(MAX_BLOCKS_PER_SECTION) as unknown as BlocksByType[T];
    case "WEEK_RECAP":
      return (mode === "TOURNAMENT"
        ? z.array(weekRecapTournamentBlockSchema).max(MAX_BLOCKS_PER_SECTION)
        : z.array(weekRecapWeeklyBlockSchema).max(MAX_BLOCKS_PER_SECTION)) as unknown as BlocksByType[T];
    case "COMING_UP":
      return z.array(comingUpBlockSchema).max(MAX_BLOCKS_PER_SECTION) as unknown as BlocksByType[T];
    case "MONETISATION":
      return z.array(monetisationBlockSchema).max(MAX_BLOCKS_PER_SECTION) as unknown as BlocksByType[T];
    case "FAN_ENGAGEMENT":
      return z.array(fanEngagementBlockSchema).max(MAX_BLOCKS_PER_SECTION) as unknown as BlocksByType[T];
  }
  // Unreachable — exhaustive switch on a literal union.
  throw new Error(`Unknown section type: ${type as string}`);
}

export function validateSectionBlocks<T extends SectionTypeValue>(
  type: T,
  mode: EditionModeValue,
  blocks: unknown,
): z.output<BlocksByType[T]> {
  return blocksFor(type, mode).parse(blocks) as z.output<BlocksByType[T]>;
}

export function safeParseSectionBlocks<T extends SectionTypeValue>(
  type: T,
  mode: EditionModeValue,
  blocks: unknown,
) {
  return blocksFor(type, mode).safeParse(blocks);
}

// ── Emptiness helper ──────────────────────────────────────────────────

export function isSectionMeaningful(
  _type: SectionTypeValue,
  blocks: unknown,
): boolean {
  return Array.isArray(blocks) && blocks.length > 0;
}

// ── CRUD payload schemas ──────────────────────────────────────────────
//
// `blocks` is `z.unknown()` here so the per-type discriminated union
// can be applied at the service layer (where we also know the edition
// mode). The service is the single chokepoint that calls
// `validateSectionBlocks` — anyone bypassing it writes raw `unknown`
// and Prisma will reject the `blocks` field as `Prisma.InputJsonValue`
// at compile time anyway.

export const addSectionSchema = z.object({
  type: sectionTypeSchema,
  title: optionalSectionTitle,
  blocks: z.unknown(),
  order: z.number().int().nonnegative().optional(),
});

export const updateSectionSchema = z.object({
  blocks: z.unknown().optional(),
});

export const reorderSectionsSchema = z.object({
  sectionIds: z.array(z.string().min(1)).min(1),
});

// ── Inferred types ────────────────────────────────────────────────────

export type MediaBlock = z.output<typeof mediaBlockSchema>;
export type TextMedia = z.output<typeof textMediaSchema>;
export type ImageMedia = z.output<typeof imageMediaSchema>;
export type AudioMedia = z.output<typeof audioMediaSchema>;
export type VideoMedia = z.output<typeof videoMediaSchema>;

export type AthleteReviewBlock = z.output<typeof athleteReviewBlockSchema>;

export type TournamentSummaryBlock = z.output<typeof tournamentSummaryBlockSchema>;
export type HeroMetricBlock = z.output<typeof heroMetricBlockSchema>;
export type MatchCardBlock = z.output<typeof matchCardBlockSchema>;
export type MediaLinkBlock = z.output<typeof mediaLinkBlockSchema>;
export type WeekRecapTournamentBlock = z.output<typeof weekRecapTournamentBlockSchema>;

export type TrainingUpdateBlock = z.output<typeof trainingUpdateBlockSchema>;
export type RecoveryTravelUpdateBlock = z.output<typeof recoveryTravelUpdateBlockSchema>;
export type SocialRecapBlock = z.output<typeof socialRecapBlockSchema>;
export type MediaRecapBlock = z.output<typeof mediaRecapBlockSchema>;
export type StatsUpdateBlock = z.output<typeof statsUpdateBlockSchema>;
export type ThrowbackBlock = z.output<typeof throwbackBlockSchema>;
export type QuoteBlock = z.output<typeof quoteBlockSchema>;
export type WeekRecapWeeklyBlock = z.output<typeof weekRecapWeeklyBlockSchema>;

export type ScheduleItemBlock = z.output<typeof scheduleItemBlockSchema>;
export type CtaBlock = z.output<typeof ctaBlockSchema>;
export type ComingUpBlock = z.output<typeof comingUpBlockSchema>;

export type KitBlock = z.output<typeof kitBlockSchema>;
export type PartnerContentBlock = z.output<typeof partnerContentBlockSchema>;
export type AffiliateBlock = z.output<typeof affiliateBlockSchema>;
export type PaidContentBlock = z.output<typeof paidContentBlockSchema>;
export type AthleteProductBlock = z.output<typeof athleteProductBlockSchema>;
export type DonationBlock = z.output<typeof donationBlockSchema>;
export type FanExperienceBlock = z.output<typeof fanExperienceBlockSchema>;
export type MonetisationBlock = z.output<typeof monetisationBlockSchema>;

export type PollBlock = z.output<typeof pollBlockSchema>;
export type PredictionBlock = z.output<typeof predictionBlockSchema>;
export type QuizBlock = z.output<typeof quizBlockSchema>;
export type PrizeDrawBlock = z.output<typeof prizeDrawBlockSchema>;
export type QABlock = z.output<typeof qaBlockSchema>;
export type SurveyBlock = z.output<typeof surveyBlockSchema>;
export type ChallengeBlock = z.output<typeof challengeBlockSchema>;
export type FanEngagementBlock = z.output<typeof fanEngagementBlockSchema>;

export type PollOption = z.output<typeof pollOptionEngagementSchema>;
export type QuizOption = z.output<typeof quizOptionSchema>;

export type AddSectionInput = z.input<typeof addSectionSchema>;
export type AddSectionOutput = z.output<typeof addSectionSchema>;
export type UpdateSectionInput = z.input<typeof updateSectionSchema>;
export type UpdateSectionOutput = z.output<typeof updateSectionSchema>;
export type ReorderSectionsInput = z.input<typeof reorderSectionsSchema>;
