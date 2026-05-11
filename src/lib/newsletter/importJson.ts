import { isAllowedMediaUrl } from "@/lib/schemas/common";
import { toSlug } from "@/lib/newsletter/slug";
import {
  SECTION_ORDER,
  emptyContentFor,
} from "@/lib/newsletter/sectionDefaults";
import type { NewsletterFormInput } from "@/lib/schemas/newsletter";
import type { SectionTypeValue } from "@/lib/schemas/newsletterSection";

export interface ParsedNewsletterImport {
  header: NewsletterFormInput;
  sections: Record<SectionTypeValue, unknown>;
}

const SECTION_KEYS = new Set<string>(SECTION_ORDER);

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
  // Accept YYYY-MM-DD directly; also accept ISO strings and slice.
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

// Strip non-Supabase media URLs from a section's content tree.
// Mutates a shallow clone, returns the cleaned content.
function sanitizeSectionContent(
  type: SectionTypeValue,
  raw: unknown,
): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return raw;
  }
  const content = { ...(raw as Record<string, unknown>) };

  // ── media block (DEBRIEF, WHATS_NEXT, RESULTS.subSection.media) ──
  if (content.media !== undefined) {
    content.media = sanitizeMediaBlock(content.media);
    if (content.media === undefined) delete content.media;
  }

  if (type === "RESULTS") {
    const sub = content.subSection;
    if (sub && typeof sub === "object" && !Array.isArray(sub)) {
      const cleaned = { ...(sub as Record<string, unknown>) };
      if (cleaned.media !== undefined) {
        cleaned.media = sanitizeMediaBlock(cleaned.media);
        if (cleaned.media === undefined) delete cleaned.media;
      }
      content.subSection = cleaned;
    }
  }

  if (type === "KIT") {
    if (content.imageUrl !== undefined) {
      const cleaned = sanitizedSupabaseUrl(content.imageUrl);
      if (cleaned) content.imageUrl = cleaned;
      else delete content.imageUrl;
    }
  }

  return content;
}

function sanitizeMediaBlock(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const block = { ...(raw as Record<string, unknown>) };
  const kind = block.kind;
  if (kind === "voicenote") {
    // audioUrl is REQUIRED + Supabase-only — if it isn't, the whole block
    // is unsalvageable.
    const audio = sanitizedSupabaseUrl(block.audioUrl);
    if (!audio) return undefined;
    block.audioUrl = audio;
    return block;
  }
  if (kind === "video") {
    // thumbnailUrl is optional + Supabase-only; videoUrl is any http.
    if (block.thumbnailUrl !== undefined) {
      const thumb = sanitizedSupabaseUrl(block.thumbnailUrl);
      if (thumb) block.thumbnailUrl = thumb;
      else delete block.thumbnailUrl;
    }
    // videoUrl stays as-is — submit-time validation will catch garbage.
    return block;
  }
  // Unknown kind — drop it so the form doesn't crash.
  return undefined;
}

function buildHeader(source: Record<string, unknown>): NewsletterFormInput {
  const title = asString(source.title) ?? "";
  const slugFromInput = asString(source.slug);
  const slug =
    slugFromInput && /^[a-z0-9-]+$/.test(slugFromInput)
      ? slugFromInput
      : title
        ? toSlug(title)
        : "";

  return {
    title,
    slug,
    heroImageUrl: sanitizedSupabaseUrl(source.heroImageUrl),
    editionNumber: asNumber(source.editionNumber) ?? 1,
    editionDate: asDateInput(source.editionDate),
    tournamentName: asString(source.tournamentName),
    tournamentLogoUrl: sanitizedSupabaseUrl(source.tournamentLogoUrl),
    tournamentContext: asString(source.tournamentContext),
    worldRankSnapshot: asNumber(source.worldRankSnapshot),
    countryRankSnapshot: asNumber(source.countryRankSnapshot),
  };
}

function buildSections(
  source: unknown,
): Record<SectionTypeValue, unknown> {
  const map = {} as Record<SectionTypeValue, unknown>;
  const incoming =
    source && typeof source === "object" && !Array.isArray(source)
      ? (source as Record<string, unknown>)
      : {};
  for (const type of SECTION_ORDER) {
    const raw = incoming[type];
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      map[type] = sanitizeSectionContent(type, raw);
    } else {
      map[type] = emptyContentFor(type);
    }
  }
  return map;
}

/**
 * Parse a JSON string into newsletter form values.
 *
 * Throws if the JSON is malformed. Otherwise returns a best-effort import:
 * - non-Supabase media URLs are silently dropped (user re-uploads via the
 *   regular uploaders)
 * - missing slug is derived from title
 * - missing sections fall back to the empty content for that type
 *
 * No Zod validation here — the existing submit-time validator already
 * surfaces per-section errors with scroll-to-section UX.
 */
export function parseNewsletterImport(raw: string): ParsedNewsletterImport {
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Expected a JSON object at the top level");
  }

  const obj = parsed as Record<string, unknown>;

  // Allow two layouts:
  //   { ...header, sections: { DEBRIEF: {...}, ... } }
  //   { ...header, DEBRIEF: {...}, RESULTS: {...} ... }
  const sectionSource =
    obj.sections && typeof obj.sections === "object" && !Array.isArray(obj.sections)
      ? obj.sections
      : Object.fromEntries(
          Object.entries(obj).filter(([k]) => SECTION_KEYS.has(k)),
        );

  return {
    header: buildHeader(obj),
    sections: buildSections(sectionSource),
  };
}

/**
 * Example payload — shown to editors so they can paste it into an LLM
 * prompt and get back a JSON in the exact shape this importer expects.
 */
export const NEWSLETTER_JSON_EXAMPLE = `{
  "title": "Roland-Garros: the long way in",
  "slug": "roland-garros-the-long-way-in",
  "editionNumber": 12,
  "editionDate": "2026-05-28",
  "tournamentName": "Roland-Garros",
  "tournamentContext": "Round of 16 · first time on clay this year",
  "worldRankSnapshot": 24,
  "countryRankSnapshot": 3,
  "sections": {
    "DEBRIEF": {
      "body": "It was a week of small adjustments...",
      "pullQuote": { "contextLabel": "After the R16 loss", "text": "..." }
    },
    "RESULTS": {
      "stats": [
        { "value": "3-1", "label": "Win-loss" },
        { "value": "78%", "label": "1st-serve in" }
      ],
      "matches": [
        {
          "result": "W",
          "opponentName": "J. Doe",
          "opponentRank": "54",
          "opponentCountry": "ESP",
          "score": "6-3 7-5",
          "roundName": "R64",
          "date": "2026-05-25",
          "commentary": "Held serve through the third.",
          "highlightUrl": "https://youtu.be/xxxx"
        }
      ],
      "pressLinks": [
        { "source": "L'Équipe", "headline": "Une semaine ascendante", "url": "https://lequipe.fr/..." }
      ]
    },
    "WHATS_NEXT": {
      "tournamentMeta": "ATP 250 · Stuttgart",
      "body": "Short turnaround onto grass.",
      "schedule": [
        { "dateRange": "Jun 9–15", "title": "Stuttgart", "description": "Main draw" }
      ]
    },
    "KIT": {
      "body": "The shoes I broke in this week.",
      "cta": { "label": "Shop the kit", "url": "https://shop.example.com/kit" }
    },
    "ENGAGEMENT": {
      "question": "Best surface to watch you on?",
      "pollOptions": [
        { "label": "Clay", "emoji": "🟧" },
        { "label": "Grass", "emoji": "🟩" },
        { "label": "Hard", "emoji": "🟦" }
      ]
    }
  }
}`;
