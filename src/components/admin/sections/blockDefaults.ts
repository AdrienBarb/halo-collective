import type {
  AthleteReviewBlock,
  ComingUpBlock,
  FanEngagementBlock,
  MediaBlock,
  MonetisationBlock,
  WeekRecapTournamentBlock,
  WeekRecapWeeklyBlock,
} from "@/lib/schemas/newsletterSection";

// Minimal empty block for each kind. The admin block-picker spawns one
// of these when the editor selects a kind; required fields are pre-filled
// with empty strings or sensible defaults so the form renders without a
// validation pass. Optional fields are set to `undefined` explicitly to
// satisfy strict-mode exactOptionalPropertyTypes.

export function mintBlockId(): string {
  return crypto.randomUUID();
}

export function emptyMediaBlock(kind: MediaBlock["kind"]): MediaBlock {
  switch (kind) {
    case "text":
      return { kind: "text", body: "" };
    case "image":
      return { kind: "image", url: "", alt: "" };
    case "audio":
      return {
        kind: "audio",
        url: "",
        title: undefined,
        location: undefined,
        durationLabel: undefined,
      };
    case "video":
      return { kind: "video", url: "", thumbnailUrl: undefined };
  }
}

export function emptyAthleteReviewBlock(
  kind: AthleteReviewBlock["kind"],
): AthleteReviewBlock {
  switch (kind) {
    case "text":
    case "image":
    case "audio":
    case "video":
      return emptyMediaBlock(kind);
    case "quote":
      return { kind: "quote", text: "", attribution: undefined };
  }
}

export type WeekRecapBlockKind =
  | WeekRecapTournamentBlock["kind"]
  | WeekRecapWeeklyBlock["kind"];

export function emptyWeekRecapBlock(
  kind: WeekRecapBlockKind,
): WeekRecapTournamentBlock | WeekRecapWeeklyBlock {
  switch (kind) {
    case "tournament_summary":
      return {
        kind: "tournament_summary",
        name: "",
        logoUrl: undefined,
        category: undefined,
        location: undefined,
        surface: undefined,
        dateRange: undefined,
      };
    case "hero_metric":
      return { kind: "hero_metric", value: "", label: "" };
    case "match_card":
      return {
        kind: "match_card",
        format: "singles",
        result: "W",
        roundName: "",
        opponentName: undefined,
        opponentCountry: undefined,
        opponentRank: undefined,
        score: undefined,
        date: undefined,
        contextNote: undefined,
        commentary: undefined,
        highlightUrl: undefined,
      };
    case "media_link":
      return {
        kind: "media_link",
        source: "",
        headline: "",
        url: "",
        ctaLabel: undefined,
      };
    case "training_update":
      return { kind: "training_update", body: "", media: undefined };
    case "recovery_travel_update":
      return { kind: "recovery_travel_update", body: "", media: undefined };
    case "social_recap":
      return { kind: "social_recap", posts: [{ url: "", caption: undefined }] };
    case "media_recap":
      return {
        kind: "media_recap",
        links: [{ source: "", headline: "", url: "" }],
      };
    case "stats_update":
      return {
        kind: "stats_update",
        body: undefined,
        rankingCurrent: undefined,
        rankingChange: undefined,
      };
    case "throwback":
      return { kind: "throwback", body: "", media: undefined };
    case "quote":
      return { kind: "quote", text: "", attribution: undefined };
  }
}

export function emptyComingUpBlock(kind: ComingUpBlock["kind"]): ComingUpBlock {
  switch (kind) {
    case "text":
    case "image":
    case "audio":
    case "video":
      return emptyMediaBlock(kind) as ComingUpBlock;
    case "schedule_item":
      return {
        kind: "schedule_item",
        dateRange: "",
        title: "",
        description: "",
      };
    case "cta":
      return { kind: "cta", label: "", url: "" };
  }
}

export function emptyMonetisationBlock(
  kind: MonetisationBlock["kind"],
): MonetisationBlock {
  const base = {
    id: mintBlockId(),
    title: "",
    body: undefined,
    media: undefined,
    cta: { label: "", url: "" },
  };
  switch (kind) {
    case "kit":
      return { kind: "kit", price: undefined, ...base };
    case "partner_content":
      return { kind: "partner_content", partnerName: undefined, ...base };
    case "affiliate":
      return { kind: "affiliate", ...base };
    case "paid_content":
      return { kind: "paid_content", ...base };
    case "athlete_product":
      return { kind: "athlete_product", price: undefined, ...base };
    case "donation":
      return { kind: "donation", goalLabel: undefined, ...base };
    case "fan_experience":
      return { kind: "fan_experience", dateLabel: undefined, ...base };
  }
}

export function emptyFanEngagementBlock(
  kind: FanEngagementBlock["kind"],
): FanEngagementBlock {
  const id = mintBlockId();
  switch (kind) {
    case "poll":
      return {
        kind: "poll",
        id,
        question: "",
        options: [
          { label: "", emoji: undefined, isHighlighted: false },
          { label: "", emoji: undefined, isHighlighted: false },
        ],
        closesAt: undefined,
      };
    case "prediction":
      return {
        kind: "prediction",
        id,
        prompt: "",
        options: [],
        closesAt: undefined,
      };
    case "quiz":
      return {
        kind: "quiz",
        id,
        question: "",
        options: [
          { label: "", isCorrect: false },
          { label: "", isCorrect: false },
        ],
        closesAt: undefined,
      };
    case "prize_draw":
      return {
        kind: "prize_draw",
        id,
        title: "",
        body: undefined,
        prizeMedia: undefined,
        ctaLabel: undefined,
        closesAt: undefined,
      };
    case "qa":
      return {
        kind: "qa",
        id,
        prompt: "",
        intro: undefined,
        reassurance: undefined,
      };
    case "survey":
      return {
        kind: "survey",
        id,
        title: "",
        body: undefined,
        externalUrl: undefined,
      };
    case "challenge":
      return {
        kind: "challenge",
        id,
        title: "",
        brief: "",
        media: undefined,
      };
  }
}
