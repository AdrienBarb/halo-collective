import { isAllowedMediaUrl, isSafeHttpUrl } from "@/lib/schemas/common";
import { SECTION_ORDER } from "@/lib/newsletter/sectionDefaults";
import type { NewsletterFormInput } from "@/lib/schemas/newsletter";
import {
  ID_BEARING_KINDS,
  type SectionTypeValue,
} from "@/lib/schemas/newsletterSection";

// Max raw JSON payload accepted by the importer. 256 KiB is generous
// for an editorial newsletter; anything larger is likely paste-error or
// abuse, and we want to fail fast before the form state explodes.
const MAX_RAW_BYTES = 256 * 1024;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ImportWarning {
  section: SectionTypeValue | "header";
  kind?: string;
  reason: string;
}

export interface ParsedNewsletterSection {
  blocks: unknown[];
}

export interface ParsedNewsletterImport {
  header: NewsletterFormInput;
  sections: Record<SectionTypeValue, ParsedNewsletterSection>;
  warnings: ImportWarning[];
}

const SECTION_KEYS = new Set<string>(SECTION_ORDER);

// Web Crypto is available in modern browsers and Node ≥ 19 — so this
// works in both Server Components / API routes AND Client Components
// that import this module. Avoids pulling `node:crypto` into the
// client bundle.
function newId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  // Fallback for environments without Web Crypto (very old runtimes).
  // RFC 4122 v4 shape — not cryptographically strong, only used as a
  // last resort.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function asNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function asDateInput(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

function sanitizedSupabaseUrl(v: unknown): string | undefined {
  const s = asString(v);
  if (!s) return undefined;
  return isAllowedMediaUrl(s) ? s : undefined;
}

function sanitizedSafeUrl(v: unknown): string | undefined {
  const s = asString(v);
  if (!s) return undefined;
  return isSafeHttpUrl(s) ? s : undefined;
}

function ensureBlockId(block: Record<string, unknown>): void {
  const existing = asString(block.id);
  block.id = existing && UUID_PATTERN.test(existing) ? existing : newId();
}

// Sanitise a single MediaBlock (text|image|audio|video). Returns the
// cleaned object or undefined if the block is unsalvageable.
function sanitizeMediaBlock(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const block = { ...(raw as Record<string, unknown>) };
  switch (block.kind) {
    case "text": {
      const body = asString(block.body);
      if (!body) return undefined;
      block.body = body;
      return block;
    }
    case "image": {
      const url = sanitizedSupabaseUrl(block.url);
      if (!url) return undefined;
      block.url = url;
      const alt = typeof block.alt === "string" ? block.alt.trim() : "";
      block.alt = alt;
      return block;
    }
    case "audio": {
      const url = sanitizedSupabaseUrl(block.url);
      if (!url) return undefined;
      block.url = url;
      return block;
    }
    case "video": {
      const url = sanitizedSafeUrl(block.url);
      if (!url) return undefined;
      block.url = url;
      if (block.thumbnailUrl !== undefined) {
        const thumb = sanitizedSupabaseUrl(block.thumbnailUrl);
        if (thumb) block.thumbnailUrl = thumb;
        else delete block.thumbnailUrl;
      }
      return block;
    }
    default:
      return undefined;
  }
}

function sanitizeNestedMedia(block: Record<string, unknown>): void {
  if (block.media !== undefined) {
    const cleaned = sanitizeMediaBlock(block.media);
    if (cleaned) block.media = cleaned;
    else delete block.media;
  }
}

function sanitizeCta(block: Record<string, unknown>): void {
  const cta = block.cta;
  if (!cta || typeof cta !== "object" || Array.isArray(cta)) return;
  const cleaned = { ...(cta as Record<string, unknown>) };
  if (cleaned.url !== undefined) {
    const safe = sanitizedSafeUrl(cleaned.url);
    if (safe) cleaned.url = safe;
    else delete cleaned.url;
  }
  block.cta = cleaned;
}

// Per-kind sanitiser registry. Each entry takes a shallow-cloned block
// and returns the cleaned block or undefined to drop it.
type Sanitiser = (block: Record<string, unknown>) => unknown;

const SANITISERS: Record<string, Sanitiser> = {
  // WEEK_RECAP TOURNAMENT
  tournament_summary(block) {
    if (block.logoUrl !== undefined) {
      const logo = sanitizedSupabaseUrl(block.logoUrl);
      if (logo) block.logoUrl = logo;
      else delete block.logoUrl;
    }
    return block;
  },
  match_card(block) {
    if (block.highlightUrl !== undefined) {
      const safe = sanitizedSafeUrl(block.highlightUrl);
      if (safe) block.highlightUrl = safe;
      else delete block.highlightUrl;
    }
    return block;
  },
  media_link(block) {
    const url = sanitizedSafeUrl(block.url);
    if (!url) return undefined;
    block.url = url;
    return block;
  },
  hero_metric: (block) => block,

  // WEEK_RECAP WEEKLY
  training_update(block) {
    sanitizeNestedMedia(block);
    return block;
  },
  recovery_travel_update(block) {
    sanitizeNestedMedia(block);
    return block;
  },
  throwback(block) {
    sanitizeNestedMedia(block);
    return block;
  },
  social_recap(block) {
    if (!Array.isArray(block.posts)) return undefined;
    const cleaned = block.posts
      .map((p) => {
        if (!p || typeof p !== "object" || Array.isArray(p)) return null;
        const post = { ...(p as Record<string, unknown>) };
        const url = sanitizedSafeUrl(post.url);
        if (!url) return null;
        post.url = url;
        return post;
      })
      .filter((p): p is Record<string, unknown> => p !== null);
    if (cleaned.length === 0) return undefined;
    block.posts = cleaned;
    return block;
  },
  media_recap(block) {
    if (!Array.isArray(block.links)) return undefined;
    const cleaned = block.links
      .map((l) => {
        if (!l || typeof l !== "object" || Array.isArray(l)) return null;
        const link = { ...(l as Record<string, unknown>) };
        const url = sanitizedSafeUrl(link.url);
        if (!url) return null;
        link.url = url;
        return link;
      })
      .filter((l): l is Record<string, unknown> => l !== null);
    if (cleaned.length === 0) return undefined;
    block.links = cleaned;
    return block;
  },
  stats_update: (block) => block,
  quote: (block) => block,

  // COMING_UP
  schedule_item: (block) => block,
  cta(block) {
    const url = sanitizedSafeUrl(block.url);
    if (!url) return undefined;
    block.url = url;
    return block;
  },

  // MONETISATION (7 kinds, same anatomy)
  ...Object.fromEntries(
    [
      "kit",
      "partner_content",
      "affiliate",
      "paid_content",
      "athlete_product",
      "donation",
      "fan_experience",
    ].map((kind) => [
      kind,
      (block: Record<string, unknown>) => {
        sanitizeNestedMedia(block);
        sanitizeCta(block);
        ensureBlockId(block);
        return block;
      },
    ]),
  ),

  // FAN_ENGAGEMENT
  poll: (block) => (ensureBlockId(block), block),
  prediction: (block) => (ensureBlockId(block), block),
  quiz: (block) => (ensureBlockId(block), block),
  qa: (block) => (ensureBlockId(block), block),
  survey(block) {
    if (block.externalUrl !== undefined) {
      const safe = sanitizedSafeUrl(block.externalUrl);
      if (safe) block.externalUrl = safe;
      else delete block.externalUrl;
    }
    ensureBlockId(block);
    return block;
  },
  prize_draw(block) {
    if (block.prizeMedia !== undefined) {
      const cleaned = sanitizeMediaBlock(block.prizeMedia);
      if (cleaned) block.prizeMedia = cleaned;
      else delete block.prizeMedia;
    }
    ensureBlockId(block);
    return block;
  },
  challenge(block) {
    sanitizeNestedMedia(block);
    ensureBlockId(block);
    return block;
  },
};

const MEDIA_KINDS = new Set(["text", "image", "audio", "video"]);

function sanitizeBlock(
  type: SectionTypeValue,
  raw: unknown,
  warnings: ImportWarning[],
): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    warnings.push({ section: type, reason: "Block was not an object" });
    return undefined;
  }
  const block = { ...(raw as Record<string, unknown>) };
  const kind = asString(block.kind);
  if (!kind) {
    warnings.push({ section: type, reason: "Block had no `kind` field" });
    return undefined;
  }

  // ATHLETE_REVIEW + media kinds inside COMING_UP are plain MediaBlocks.
  if (type === "ATHLETE_REVIEW" || MEDIA_KINDS.has(kind)) {
    const cleaned = sanitizeMediaBlock(block);
    if (!cleaned) {
      warnings.push({ section: type, kind, reason: "Media block was unsalvageable" });
    }
    return cleaned;
  }

  const sanitiser = SANITISERS[kind];
  if (!sanitiser) {
    warnings.push({ section: type, kind, reason: "Unknown block kind — dropped" });
    return undefined;
  }
  const cleaned = sanitiser(block);
  if (!cleaned) {
    warnings.push({ section: type, kind, reason: "Block was unsalvageable" });
    // Ensure id-bearing kinds that fail still leave no trace — we drop
    // them rather than persisting a partial row.
    return undefined;
  }
  // If a sanitiser forgot to call ensureBlockId for an id-bearing kind,
  // fill in here so the schema validator never sees a missing id.
  if (
    ID_BEARING_KINDS.has(kind) &&
    typeof (cleaned as Record<string, unknown>).id !== "string"
  ) {
    ensureBlockId(cleaned as Record<string, unknown>);
  }
  return cleaned;
}

function sanitizeSectionBlocks(
  type: SectionTypeValue,
  raw: unknown,
  warnings: ImportWarning[],
): unknown[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((b) => sanitizeBlock(type, b, warnings))
    .filter((b): b is unknown => b !== undefined);
}

function buildHeader(
  source: Record<string, unknown>,
  warnings: ImportWarning[],
): NewsletterFormInput {
  const titleRaw = asString(source.title) ?? "";
  // Pre-sanitise CRLF/tabs in title to match newsletterFormSchema's
  // CRLF-rejecting regex — strip them rather than rejecting outright,
  // so an editor isn't forced to re-edit valid-looking JSON.
  const title = titleRaw.replace(/[\r\n\t]+/g, " ").slice(0, 200);
  if (title !== titleRaw) {
    warnings.push({ section: "header", reason: "Title was trimmed/cleaned" });
  }
  const editionModeRaw = asString(source.editionMode)?.toUpperCase();
  const editionMode =
    editionModeRaw === "TOURNAMENT" || editionModeRaw === "WEEKLY"
      ? (editionModeRaw as "TOURNAMENT" | "WEEKLY")
      : "WEEKLY";

  return {
    title,
    heroImageUrl: sanitizedSupabaseUrl(source.heroImageUrl),
    editionMode,
    tournamentName: asString(source.tournamentName),
    tournamentLogoUrl: sanitizedSupabaseUrl(source.tournamentLogoUrl),
    tournamentCategory: asString(source.tournamentCategory),
    tournamentLocation: asString(source.tournamentLocation),
    tournamentSurface: asString(source.tournamentSurface),
    tournamentStartDate: asDateInput(source.tournamentStartDate),
    tournamentEndDate: asDateInput(source.tournamentEndDate),
    worldRankSnapshot: asNumber(source.worldRankSnapshot),
    countryRankSnapshot: asNumber(source.countryRankSnapshot),
  };
}

function buildSections(
  source: unknown,
  warnings: ImportWarning[],
): Record<SectionTypeValue, ParsedNewsletterSection> {
  const map = {} as Record<SectionTypeValue, ParsedNewsletterSection>;
  const incoming =
    source && typeof source === "object" && !Array.isArray(source)
      ? (source as Record<string, unknown>)
      : {};
  for (const type of SECTION_ORDER) {
    const raw = incoming[type];
    let blocks: unknown[] = [];
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const wrapper = raw as Record<string, unknown>;
      if (Array.isArray(wrapper.blocks)) {
        blocks = wrapper.blocks;
      }
    } else if (Array.isArray(raw)) {
      blocks = raw;
    }
    map[type] = { blocks: sanitizeSectionBlocks(type, blocks, warnings) };
  }
  return map;
}

/**
 * Parse a JSON string into newsletter form values.
 *
 * Canonical layout:
 *   {
 *     editionMode, ...header,
 *     sections: { ATHLETE_REVIEW: { blocks: [...] }, ... }
 *   }
 *
 * Throws on malformed JSON or oversize input (> 256 KiB). Otherwise
 * best-effort: invalid URLs are silently dropped, unknown block kinds
 * are removed, missing block ids are auto-generated. Returns a list of
 * warnings the caller should surface in the editor UI. Zod validation
 * runs at submit time.
 */
export function parseNewsletterImport(raw: string): ParsedNewsletterImport {
  if (raw.length > MAX_RAW_BYTES) {
    throw new Error(
      `JSON payload is too large (${raw.length} bytes, limit ${MAX_RAW_BYTES})`,
    );
  }
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Expected a JSON object at the top level");
  }

  const obj = parsed as Record<string, unknown>;
  const warnings: ImportWarning[] = [];
  const sectionSource =
    obj.sections && typeof obj.sections === "object" && !Array.isArray(obj.sections)
      ? obj.sections
      : Object.fromEntries(
          Object.entries(obj).filter(([k]) => SECTION_KEYS.has(k)),
        );

  return {
    header: buildHeader(obj, warnings),
    sections: buildSections(sectionSource, warnings),
    warnings,
  };
}

export const NEWSLETTER_JSON_EXAMPLE = `{
  "title": "Monte-Carlo: into the quarters",
  "slug": "monte-carlo-into-the-quarters",
  "editionNumber": 14,
  "editionDate": "2026-04-13",
  "editionMode": "TOURNAMENT",
  "tournamentName": "Rolex Monte-Carlo Masters",
  "tournamentCategory": "ATP Masters 1000",
  "tournamentLocation": "Monte Carlo, Monaco",
  "tournamentSurface": "Clay",
  "tournamentStartDate": "2026-04-06",
  "tournamentEndDate": "2026-04-13",
  "worldRankSnapshot": 18,
  "countryRankSnapshot": 2,
  "sections": {
    "ATHLETE_REVIEW": {
      "blocks": [
        { "kind": "text", "body": "Three matches, two wins, one tough loss. Here's how it felt..." }
      ]
    },
    "WEEK_RECAP": {
      "blocks": [
        {
          "kind": "tournament_summary",
          "name": "Rolex Monte-Carlo Masters",
          "category": "ATP Masters 1000",
          "location": "Monte Carlo, Monaco",
          "surface": "Clay",
          "dateRange": "6–13 April"
        },
        { "kind": "hero_metric", "value": "QF", "label": "Best result" },
        { "kind": "hero_metric", "value": "3", "label": "Matches" },
        { "kind": "hero_metric", "value": "2-1", "label": "W / L" },
        {
          "kind": "match_card",
          "result": "W",
          "roundName": "Round of 16",
          "opponentName": "J. Lehecka",
          "opponentCountry": "CZE",
          "opponentRank": "#13",
          "score": "6-2 7-5",
          "highlightUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
      ]
    },
    "COMING_UP": {
      "blocks": [
        { "kind": "text", "body": "Short turnaround onto Barcelona next week." },
        { "kind": "schedule_item", "dateRange": "Apr 15–22", "title": "Barcelona Open", "description": "Main draw, R1 Tuesday" }
      ]
    },
    "MONETISATION": {
      "blocks": [
        {
          "kind": "kit",
          "id": "11111111-1111-4111-8111-111111111111",
          "title": "Rackets I played with this week",
          "body": "Same string tension as last month.",
          "cta": { "label": "Shop the kit", "url": "https://shop.example.com/kit" }
        }
      ]
    },
    "FAN_ENGAGEMENT": {
      "blocks": [
        {
          "kind": "poll",
          "id": "22222222-2222-4222-8222-222222222222",
          "question": "How far do you think I'll go in Barcelona?",
          "options": [
            { "label": "R32" },
            { "label": "R16" },
            { "label": "QF or better" }
          ]
        }
      ]
    }
  }
}`;
