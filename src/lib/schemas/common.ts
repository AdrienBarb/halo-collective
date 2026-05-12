import { z } from "zod";

// Common validation schemas

export const emailSchema = z.string().email("Invalid email address");

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const idSchema = z.string().min(1, "ID is required");

// Waitlist schema
export const waitlistSchema = z.object({
  email: emailSchema,
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

// ── Shared URL + string helpers ───────────────────────────────────────

export const isAllowedMediaUrl = (raw: string): boolean => {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  if (parsed.protocol === "https:") {
    return parsed.hostname.endsWith(".supabase.co");
  }
  if (parsed.protocol === "http:" && process.env.NODE_ENV !== "production") {
    return parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
  }
  return false;
};

export const isSafeHttpUrl = (raw: string): boolean => {
  try {
    const protocol = new URL(raw).protocol;
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
};

/** Supabase-restricted media URL (required). */
export const mediaUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .refine(isAllowedMediaUrl, "Must be a Supabase storage URL");

/** Supabase-restricted media URL (optional, blank/null → undefined). */
export const optionalMediaUrl = z
  .union([mediaUrl, z.literal(""), z.null(), z.undefined()])
  .optional()
  .transform((v) => (v === "" || v === null || v === undefined ? undefined : v));

/** Any http(s) URL (required). Blocks javascript:/data:/etc. */
export const safeUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .refine(isSafeHttpUrl, "Must be an http(s) URL");

/** Any http(s) URL (optional, blank/null → undefined). */
export const optionalSafeUrl = z
  .union([safeUrl, z.literal(""), z.null(), z.undefined()])
  .optional()
  .transform((v) => (v === "" || v === null || v === undefined ? undefined : v));

/** Trimmed string that becomes undefined when blank. */
export const optionalTrimmedString = z
  .union([z.string(), z.undefined()])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    const trimmed = v.trim();
    return trimmed === "" ? undefined : trimmed;
  });

/**
 * Trimmed string with a maximum length, becomes undefined when blank.
 * Use for athlete-controlled free text that flows to fan-facing surfaces
 * (email bodies etc.) — unbounded TEXT is an abuse vector.
 */
export const boundedTrimmedString = (max: number) =>
  z
    .union([z.string(), z.undefined()])
    .optional()
    .transform((v, ctx) => {
      if (v === undefined) return undefined;
      const trimmed = v.trim();
      if (trimmed === "") return undefined;
      if (trimmed.length > max) {
        ctx.addIssue({
          code: "too_big",
          maximum: max,
          origin: "string",
          inclusive: true,
          message: `Must be ${max} characters or fewer`,
        });
        return z.NEVER;
      }
      return trimmed;
    });

/** Trimmed string that becomes `null` when blank — for fields meant to be unset. */
export const clearableTrimmedString = z
  .union([z.string(), z.null(), z.undefined()])
  .optional()
  .transform((v) => {
    if (v === null) return null;
    if (v === undefined) return undefined;
    const trimmed = v.trim();
    return trimmed === "" ? null : trimmed;
  });

/**
 * Clearable trimmed string with a max length. `null` = explicitly unset,
 * `undefined` = leave unchanged. Same intent as boundedTrimmedString but
 * for PATCH-style update schemas.
 */
export const boundedClearableTrimmedString = (max: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((v, ctx) => {
      if (v === null) return null;
      if (v === undefined) return undefined;
      const trimmed = v.trim();
      if (trimmed === "") return null;
      if (trimmed.length > max) {
        ctx.addIssue({
          code: "too_big",
          maximum: max,
          origin: "string",
          inclusive: true,
          message: `Must be ${max} characters or fewer`,
        });
        return z.NEVER;
      }
      return trimmed;
    });

/** Single-line name: trimmed, capped, no control characters (blocks CRLF header injection). */
export const personNameSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .max(80, "Must be 80 characters or fewer")
  .regex(/^[^\r\n\t]+$/, "Must not contain line breaks");

/** Positive int that becomes `null` when blank/cleared. */
export const clearablePositiveInt = z
  .union([z.coerce.number().int().positive(), z.literal(""), z.null(), z.undefined()])
  .optional()
  .transform((v) =>
    v === "" || v === null ? null : v === undefined ? undefined : v,
  );

/**
 * Bounded positive int that becomes `null` when blank/cleared. Use for
 * any value that ships permanently into an email body (rank, titles
 * count, etc.) — a 5-digit typo cannot be unsent to 10k inboxes.
 */
export const clearableBoundedInt = (max: number) =>
  z
    .union([
      z.coerce.number().int().min(1).max(max),
      z.literal(""),
      z.null(),
      z.undefined(),
    ])
    .optional()
    .transform((v) =>
      v === "" || v === null ? null : v === undefined ? undefined : v,
    );

/** Date that becomes `null` when blank/cleared. */
export const clearableDate = z
  .union([z.coerce.date(), z.literal(""), z.null(), z.undefined()])
  .optional()
  .transform((v) =>
    v === "" || v === null ? null : v === undefined ? undefined : v,
  );

/** Supabase media URL (optional) that becomes `null` when cleared. */
export const clearableMediaUrl = z
  .union([mediaUrl, z.literal(""), z.null(), z.undefined()])
  .optional()
  .transform((v) =>
    v === "" || v === null ? null : v === undefined ? undefined : v,
  );

/** Slug pattern: a–z, 0–9, dashes. */
export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes only");
