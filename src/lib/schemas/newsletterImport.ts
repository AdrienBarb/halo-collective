import { z } from "zod";
import { editionModeSchema } from "@/lib/schemas/newsletterSection";

// ─────────────────────────────────────────────────────────────────────
// LLM-target schema for newsletter generation.
//
// This is intentionally *looser* than the strict form/DB schema
// (`newsletterSection.ts`). The LLM produces a best-effort draft; then
// `parseNewsletterImport()` (importJson.ts) sanitises URLs, backfills
// missing block UUIDs, normalises dates, and strips invalid fields.
//
// Loosening contract vs. the strict schema:
//   - `id` on ID-bearing blocks (monetisation/fan_engagement) is omitted
//     — importJson generates one via `ensureBlockId`.
//   - URLs are plain strings; importJson strips invalid http(s) URLs.
//   - WEEK_RECAP is a single discriminatedUnion of TOURNAMENT + WEEKLY
//     block kinds; importJson drops blocks that don't match the active
//     editionMode and emits warnings.
//   - Top-level fields with strict-side defaults (editionMode WEEKLY,
//     editionNumber 1) are optional here; importJson applies defaults.
//
// Drift guard: `newsletterImport.assert.ts` contains compile-time
// assertions that every section/block kind exposed by the strict
// schema is also accepted here. Adding a kind to newsletterSection.ts
// without mirroring it here will fail typecheck.
// ─────────────────────────────────────────────────────────────────────

// ── Loose primitives ─────────────────────────────────────────────────

const looseString = z.string().optional().nullable();
const looseUrl = z
  .string()
  .optional()
  .nullable()
  .describe("Full http(s) URL or null. Invalid URLs are stripped downstream.");

// ── MediaBlock (text / image / audio / video) ─────────────────────────

const textMedia = z
  .object({
    kind: z.literal("text"),
    body: z.string().describe("Paragraph body text in the athlete's voice."),
  })
  .describe("A paragraph of narrative copy.");

const imageMedia = z
  .object({
    kind: z.literal("image"),
    url: z.string().describe("Image URL (any host). Omit if no image source."),
    alt: looseString.describe("Alt text; empty string = decorative."),
  })
  .describe("An inline image.");

const audioMedia = z
  .object({
    kind: z.literal("audio"),
    url: z.string().describe("Audio URL."),
    title: looseString.describe("Short title, e.g., 'My Munich debrief'."),
    location: looseString.describe("e.g., 'Post-final · Munich'."),
    durationLabel: looseString.describe("e.g., '1 min 30'."),
  })
  .describe("An athlete voicenote or audio clip.");

const videoMedia = z
  .object({
    kind: z.literal("video"),
    url: z.string().describe("Video URL (YouTube, Vimeo, etc.)."),
    thumbnailUrl: looseUrl,
  })
  .describe("An embedded video.");

const mediaBlock = z.discriminatedUnion("kind", [
  textMedia,
  imageMedia,
  audioMedia,
  videoMedia,
]);

const optionalMedia = mediaBlock.optional();

// Pull-quote primitive — used by ATHLETE_REVIEW and WEEK_RECAP (weekly).
const quote = z
  .object({
    kind: z.literal("quote"),
    text: z.string().describe("Quote text, without surrounding quotation marks."),
    attribution: looseString.describe(
      "Optional context label shown above the quote (e.g., 'After the match vs Alcaraz').",
    ),
  })
  .describe("A pull quote.");

const athleteReviewBlock = z.discriminatedUnion("kind", [
  textMedia,
  imageMedia,
  audioMedia,
  videoMedia,
  quote,
]);

// ── WEEK_RECAP block kinds (tournament family) ────────────────────────

const tournamentSummary = z
  .object({
    kind: z.literal("tournament_summary"),
    name: z.string().describe("Full tournament name, e.g., 'BMW Open by Bitpanda'."),
    logoUrl: looseUrl,
    category: looseString.describe("e.g., 'ATP 500', 'Masters 1000'."),
    location: looseString.describe("City, country."),
    surface: looseString.describe("e.g., 'Clay', 'Hard'."),
    dateRange: looseString.describe("e.g., '14–20 April'."),
  })
  .describe("TOURNAMENT mode. Header card summarising the tournament.");

const heroMetric = z
  .object({
    kind: z.literal("hero_metric"),
    value: z.string().describe("Short metric value, e.g., 'Final', 'QF', '4-1'."),
    label: z.string().describe("Short label, e.g., 'Result', 'W / L'."),
  })
  .describe("TOURNAMENT mode. Prominent stat tile; use 2–4 per WEEK_RECAP.");

const matchCard = z
  .object({
    kind: z.literal("match_card"),
    format: z
      .enum(["singles", "doubles"])
      .describe(
        "Match format: 'singles' (1v1) or 'doubles' (2v2). Required on every match_card. Use 'singles' when in doubt (the source rarely says 'singles' explicitly). Use 'doubles' whenever the source mentions a partner, a '/' in the opponent name (e.g. 'Medvedev / Tien'), or any explicit doubles cue. Used to group matches under separate 'Simples' / 'Doubles' headers in the recap.",
      ),
    result: z.enum(["W", "L", "BYE", "EXEMPT"]).describe("Match outcome."),
    roundName: z
      .string()
      .describe("e.g., 'Round 1', 'Round of 16', 'Quarterfinal', 'Semifinal', 'Final'."),
    opponentName: looseString.describe("Opponent's name, formatted 'B. Shelton'."),
    opponentCountry: looseString.describe("3-letter country code, e.g., 'USA'."),
    opponentRank: looseString.describe("e.g., '#6'. Omit if unranked."),
    score: looseString.describe("e.g., '6-4 7-5' or '2-6 5-7'."),
    date: looseString.describe("ISO or human date, e.g., '14 April'."),
    contextNote: looseString,
    commentary: looseString.describe("Short post-match commentary (1–2 sentences)."),
    highlightUrl: looseUrl.describe("Link to match highlights video."),
  })
  .describe("TOURNAMENT mode. One match in the tournament run.");

const mediaLink = z
  .object({
    kind: z.literal("media_link"),
    source: z.string().describe("Publication, e.g., 'ATP Tour', 'Tennis365'."),
    headline: z.string(),
    url: z.string(),
    ctaLabel: looseString.describe("e.g., 'Read', 'See'. Defaults if omitted."),
  })
  .describe("TOURNAMENT mode. A press/media link about the athlete.");

// ── WEEK_RECAP block kinds (weekly family) ────────────────────────────

const trainingUpdate = z
  .object({
    kind: z.literal("training_update"),
    body: z.string().describe("What the athlete trained this week."),
    media: optionalMedia,
  })
  .describe("WEEKLY mode. General training update outside a tournament week.");

const recoveryTravelUpdate = z
  .object({
    kind: z.literal("recovery_travel_update"),
    body: z.string().describe("Recovery, rehab, travel, or off-court routines."),
    media: optionalMedia,
  })
  .describe("WEEKLY mode.");

const socialRecap = z
  .object({
    kind: z.literal("social_recap"),
    posts: z.array(
      z.object({
        url: z.string().describe("Link to the social post."),
        caption: looseString.describe("Short caption or context."),
      }),
    ),
  })
  .describe("WEEKLY mode. Roundup of the athlete's social posts.");

const mediaRecap = z
  .object({
    kind: z.literal("media_recap"),
    links: z.array(
      z.object({
        source: z.string(),
        headline: z.string(),
        url: z.string(),
      }),
    ),
  })
  .describe("WEEKLY mode. Roundup of press/media coverage.");

const statsUpdate = z
  .object({
    kind: z.literal("stats_update"),
    body: looseString,
    rankingCurrent: looseString.describe("e.g., '#13'."),
    rankingChange: looseString.describe("Change vs. previous, e.g., '+2', '-5'."),
  })
  .describe("WEEKLY mode. Ranking/stats snapshot.");

const throwback = z
  .object({
    kind: z.literal("throwback"),
    body: z.string(),
    media: optionalMedia,
  })
  .describe("WEEKLY mode.");

// Single flat discriminated union over ALL week-recap kinds — the
// importer drops blocks that don't match the active editionMode and
// emits warnings. Keeping one discriminator gives Claude a clean
// branching cue and produces compact validation errors.

const weekRecapBlock = z.discriminatedUnion("kind", [
  tournamentSummary,
  heroMetric,
  matchCard,
  mediaLink,
  trainingUpdate,
  recoveryTravelUpdate,
  socialRecap,
  mediaRecap,
  statsUpdate,
  throwback,
  quote,
]);

// ── COMING_UP blocks ──────────────────────────────────────────────────

const scheduleItem = z
  .object({
    kind: z.literal("schedule_item"),
    dateRange: z.string().describe("e.g., '20–21 Apr', '25 Apr'."),
    title: z.string().describe("e.g., 'Rest day in Rome', 'Arrival in Madrid'."),
    description: z.string().describe("1–2 sentence detail."),
  })
  .describe("One item on the upcoming schedule.");

const cta = z
  .object({
    kind: z.literal("cta"),
    label: z.string().describe("Button label, e.g., 'Watch the preview'."),
    url: z.string(),
  })
  .describe("A call-to-action button.");

const comingUpBlock = z.discriminatedUnion("kind", [
  textMedia,
  imageMedia,
  audioMedia,
  videoMedia,
  scheduleItem,
  cta,
]);

// ── MONETISATION blocks ───────────────────────────────────────────────
//
// `id` is OMITTED — importJson backfills via ensureBlockId.

const ctaInline = z.object({
  label: z.string().describe("Button label, e.g., 'Shop the kit'."),
  url: z.string(),
});

const monetisationBase = {
  title: z.string().describe("Card title."),
  body: looseString.describe("Short body copy, 1–3 sentences."),
  media: optionalMedia,
  cta: ctaInline,
};

const kit = z
  .object({
    kind: z.literal("kit"),
    price: looseString.describe("e.g., '$129', '€89'."),
    ...monetisationBase,
  })
  .describe("Kit drop / equipment commerce.");

const partnerContent = z
  .object({
    kind: z.literal("partner_content"),
    partnerName: looseString.describe("Partner brand, e.g., 'On Running'."),
    ...monetisationBase,
  })
  .describe("Sponsored content from a partner brand.");

const affiliate = z
  .object({ kind: z.literal("affiliate"), ...monetisationBase })
  .describe("Affiliate link.");

const paidContent = z
  .object({ kind: z.literal("paid_content"), ...monetisationBase })
  .describe("Paywalled premium content offer.");

const athleteProduct = z
  .object({
    kind: z.literal("athlete_product"),
    price: looseString,
    ...monetisationBase,
  })
  .describe("Athlete's own product (book, course, merch).");

const donation = z
  .object({
    kind: z.literal("donation"),
    goalLabel: looseString.describe("e.g., '$10,000 raised'."),
    ...monetisationBase,
  })
  .describe("Donation / charity / cause CTA.");

const fanExperience = z
  .object({
    kind: z.literal("fan_experience"),
    dateLabel: looseString.describe("e.g., 'May 12, 2026'."),
    ...monetisationBase,
  })
  .describe("Fan event, meet-and-greet, or clinic.");

const phaseItem = z.object({
  label: z.string().describe("Left-column tag, e.g., 'PHASE 1', 'WEEK 1-2'."),
  title: z.string().describe("Short headline for the phase."),
  description: z.string().describe("1-2 sentences describing the phase."),
});

const phaseTimeline = z
  .object({
    kind: z.literal("phase_timeline"),
    phases: z
      .array(phaseItem)
      .describe("Ordered phases (2-10) — recovery plan, season prep, programme steps."),
  })
  .describe(
    "Standalone phase/programme timeline. No title/body/cta — the section title acts as the heading.",
  );

const monetisationBlock = z.discriminatedUnion("kind", [
  kit,
  partnerContent,
  affiliate,
  paidContent,
  athleteProduct,
  donation,
  fanExperience,
  phaseTimeline,
]);

// ── FAN_ENGAGEMENT blocks ─────────────────────────────────────────────
//
// `id` is OMITTED — importJson backfills via ensureBlockId.

const pollOption = z.object({
  label: z.string().describe("Option label, e.g., 'Aggressive baseline game'."),
  emoji: looseString,
  isHighlighted: z.boolean().optional(),
});

const quizOption = z.object({
  label: z.string(),
  isCorrect: z.boolean().optional(),
});

const poll = z
  .object({
    kind: z.literal("poll"),
    question: z.string().describe("Poll question in the athlete's voice."),
    options: z.array(pollOption).describe("2–6 options."),
    closesAt: looseString,
  })
  .describe("Reader poll.");

const prediction = z
  .object({
    kind: z.literal("prediction"),
    prompt: z.string().describe("e.g., 'How far will I go in Madrid?'."),
    options: z.array(pollOption).optional(),
    closesAt: looseString,
  })
  .describe("Fan prediction.");

const quiz = z
  .object({
    kind: z.literal("quiz"),
    question: z.string(),
    options: z.array(quizOption).describe("Options, with one marked isCorrect: true."),
    closesAt: looseString,
  })
  .describe("Trivia quiz with a correct answer.");

const prizeDraw = z
  .object({
    kind: z.literal("prize_draw"),
    title: z.string(),
    body: looseString,
    prizeMedia: optionalMedia,
    ctaLabel: looseString,
    closesAt: looseString,
  })
  .describe("Giveaway / prize draw.");

const qa = z
  .object({
    kind: z.literal("qa"),
    prompt: z.string().describe("e.g., 'Ask me a question'."),
    intro: looseString,
    reassurance: looseString.describe(
      "e.g., 'I'll pick 3 questions and answer them in the next newsletter'.",
    ),
  })
  .describe("Open Q&A; fans submit free-form questions.");

const survey = z
  .object({
    kind: z.literal("survey"),
    title: z.string(),
    body: looseString,
    externalUrl: looseUrl,
  })
  .describe("External survey link.");

const challenge = z
  .object({
    kind: z.literal("challenge"),
    title: z.string(),
    brief: z.string().describe("What fans should do to participate."),
    media: optionalMedia,
  })
  .describe("Fan challenge / UGC prompt.");

const fanEngagementBlock = z.discriminatedUnion("kind", [
  poll,
  prediction,
  quiz,
  prizeDraw,
  qa,
  survey,
  challenge,
]);

// ── Top-level import schema ───────────────────────────────────────────

export const newsletterImportSchema = z.object({
  title: z
    .string()
    .describe("Newsletter title, max 200 chars, no line breaks. e.g., 'Munich: Runner-up'."),
  slug: looseString.describe("URL-safe slug. Omit to auto-generate from title."),
  // Optional — importJson defaults to 1 when omitted, so the LLM doesn't
  // have to invent an edition number when the source doesn't mention one.
  editionNumber: z
    .number()
    .int()
    .optional()
    .nullable()
    .describe("Edition number, e.g., 2. Omit if the source doesn't mention one."),
  editionDate: looseString.describe("Send date in YYYY-MM-DD."),
  // .catch soft-recovers if the LLM emits an invalid string; importJson
  // also normalises case and defaults to WEEKLY.
  editionMode: editionModeSchema.catch("WEEKLY"),

  heroImageUrl: looseUrl.describe("Hero image URL for the masthead."),
  tournamentName: looseString.describe("Tournament name. TOURNAMENT mode only."),
  tournamentLogoUrl: looseUrl,
  tournamentCategory: looseString.describe("e.g., 'ATP 500'."),
  tournamentLocation: looseString,
  tournamentSurface: looseString,
  tournamentStartDate: looseString.describe("YYYY-MM-DD."),
  tournamentEndDate: looseString.describe("YYYY-MM-DD."),
  worldRankSnapshot: z.number().int().optional().nullable().describe("ATP/WTA world ranking."),
  countryRankSnapshot: z.number().int().optional().nullable().describe("National ranking."),

  sections: z
    .object({
      ATHLETE_REVIEW: z
        .object({
          title: looseString.describe(
            "Optional custom section header (≤ 120 chars). Omit to use the default 'My week'.",
          ),
          blocks: z
            .array(athleteReviewBlock)
            .describe("Athlete's first-person debrief. Lead with a `text` block."),
        })
        .optional(),
      WEEK_RECAP: z
        .object({
          title: looseString.describe(
            "Optional custom section header (≤ 120 chars). Omit to use the default 'What happened this week'.",
          ),
          blocks: z
            .array(weekRecapBlock)
            .describe(
              "Use TOURNAMENT kinds (tournament_summary, hero_metric, match_card, media_link) when editionMode=TOURNAMENT; WEEKLY kinds otherwise. Do not mix families.",
            ),
        })
        .optional(),
      COMING_UP: z
        .object({
          title: looseString.describe(
            "Optional custom section header (≤ 120 chars). Omit to use the default 'What's coming next'.",
          ),
          blocks: z.array(comingUpBlock).describe("What's next: schedule items, previews, CTAs."),
        })
        .optional(),
      MONETISATION: z
        .object({
          title: looseString.describe(
            "Optional custom section header (≤ 120 chars). Omit to use the default 'What I'm into right now'.",
          ),
          blocks: z
            .array(monetisationBlock)
            .describe("Commerce / sponsor / kit blocks. Omit if the source has no monetisation hooks."),
        })
        .optional(),
      FAN_ENGAGEMENT: z
        .object({
          title: looseString.describe(
            "Optional custom section header (≤ 120 chars). Omit to use the default 'Your turn'.",
          ),
          blocks: z
            .array(fanEngagementBlock)
            .describe("Polls, quizzes, Q&A. A poll is a good default to drive replies."),
        })
        .optional(),
    })
    .describe("The five fixed sections; omit any section the source doesn't cover."),
});

export type NewsletterImportInput = z.input<typeof newsletterImportSchema>;
export type NewsletterImportOutput = z.output<typeof newsletterImportSchema>;
