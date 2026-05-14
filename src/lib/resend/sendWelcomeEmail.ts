import { getTranslations } from "next-intl/server";
import { resendClient } from "@/lib/resend/resendClient";
import {
  WelcomeEmail,
  type WelcomeRecentEdition,
  type WelcomeSocialLinks,
  type WelcomeSponsor,
} from "@/lib/emails/WelcomeEmail";
import { getRequiredEnv } from "@/lib/utils/env";
import config from "@/lib/config";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";

interface SendWelcomeEmailInput {
  email: string;
  firstName: string;
  athleteFirstName: string;
  athleteLastName: string;
  athleteSlug: string;
  coverImageUrl?: string | null;
  socialLinks?: unknown;
  welcomeMessage?: string | null;
  sponsors?: Array<{
    id?: string;
    name: string;
    logoUrl: string;
    websiteUrl: string;
  }>;
  recentEditions?: Array<{
    slug: string;
    title: string;
    editionNumber: number;
    editionDate?: Date | string | null;
  }>;
  locale?: Locale | string;
}

const SOCIAL_KEYS = ["instagram", "x", "tiktok", "facebook", "linkedin"] as const;
const RESEND_TIMEOUT_MS = 10_000;
const SLUG_PATTERN = /^[a-z0-9-]+$/;

/**
 * Email recipients are lower-trust than the admin who wrote the source data.
 * The schema validates URLs on write, but seeds / Prisma Studio / manual SQL
 * can land arbitrary strings in Postgres JSON columns. We re-validate at the
 * render boundary to guarantee no `javascript:` / `data:` / `mailto:` URL is
 * ever clicked by a fan from a Halo-branded email.
 */
function isHttpsUrl(raw: unknown): raw is string {
  if (typeof raw !== "string") return false;
  try {
    return new URL(raw).protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeSocialLinks(value: unknown): WelcomeSocialLinks | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const out: WelcomeSocialLinks = {};
  for (const key of SOCIAL_KEYS) {
    const url = record[key];
    if (isHttpsUrl(url)) out[key] = url;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function normalizeSponsors(
  sponsors: SendWelcomeEmailInput["sponsors"],
): WelcomeSponsor[] | undefined {
  if (!sponsors || sponsors.length === 0) return undefined;
  const safe = sponsors.filter(
    (s) => isHttpsUrl(s.logoUrl) && isHttpsUrl(s.websiteUrl),
  );
  return safe.length > 0 ? safe : undefined;
}

// Re-validates athlete + edition slugs at the render boundary. Slugs come from
// the DB but we mirror the strictness of buildEditionUrl in the newsletter
// service so a stray value can never produce a malformed URL in a Halo email.
function buildRecentEditions(
  baseUrl: string,
  athleteSlug: string,
  locale: Locale,
  editions: SendWelcomeEmailInput["recentEditions"],
): WelcomeRecentEdition[] | undefined {
  if (!editions || editions.length === 0) return undefined;
  if (!SLUG_PATTERN.test(athleteSlug)) return undefined;

  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const safe: WelcomeRecentEdition[] = [];
  for (const edition of editions) {
    if (!SLUG_PATTERN.test(edition.slug)) continue;
    const url = new URL(`/${athleteSlug}`, baseUrl);
    url.searchParams.set("edition", edition.slug);
    const rawDate = edition.editionDate
      ? new Date(edition.editionDate)
      : undefined;
    const formattedDate =
      rawDate && !Number.isNaN(rawDate.getTime())
        ? formatter.format(rawDate)
        : undefined;
    safe.push({
      title: edition.title,
      editionNumber: edition.editionNumber,
      formattedDate,
      url: url.toString(),
    });
  }
  return safe.length > 0 ? safe : undefined;
}

// Replaces {{fanFirstName}} / {{athleteFirstName}} placeholders in the
// athlete-authored welcome message. Mirrors the newsletter merge-tag UX, but
// since Resend has no native merge syntax we substitute server-side here.
// Single-pass replace so a fan-controlled value (e.g. firstName="{{athleteFirstName}}")
// is not re-scanned and re-substituted.
function substituteWelcomeMessage(
  template: string | null | undefined,
  vars: Record<"fanFirstName" | "athleteFirstName", string>,
): string | undefined {
  if (!template) return undefined;
  const out = template.replace(
    /\{\{\s*(fanFirstName|athleteFirstName)\s*\}\}/g,
    (_match, key: "fanFirstName" | "athleteFirstName") => vars[key],
  );
  return out.trim() ? out : undefined;
}

export async function sendWelcomeEmail(input: SendWelcomeEmailInput) {
  const {
    email,
    firstName,
    athleteFirstName,
    athleteLastName,
    athleteSlug,
    coverImageUrl,
    socialLinks,
    welcomeMessage,
    sponsors,
    recentEditions,
  } = input;
  const locale: Locale = isLocale(input.locale) ? input.locale : DEFAULT_LOCALE;
  const t = await getTranslations({ locale, namespace: "Emails.Welcome" });
  const athleteName = `${athleteFirstName} ${athleteLastName}`;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BETTER_AUTH_URL ||
    config.project.url;

  const safeCover = isHttpsUrl(coverImageUrl) ? coverImageUrl : undefined;
  const personalizedMessage = substituteWelcomeMessage(welcomeMessage, {
    fanFirstName: firstName.trim() || t("fanFirstNameFallback"),
    athleteFirstName,
  });

  const result = await Promise.race([
    resendClient.emails.send({
      from: `"${athleteName.replace(/["\\]/g, "")}" <${getRequiredEnv("RESEND_FROM_EMAIL")}>`,
      to: email,
      subject: t("subject"),
      react: WelcomeEmail({
        profileUrl: `${baseUrl}/${athleteSlug}`,
        athleteFirstName,
        coverImageUrl: safeCover,
        welcomeMessage: personalizedMessage,
        sponsors: normalizeSponsors(sponsors),
        socialLinks: normalizeSocialLinks(socialLinks),
        recentEditions: buildRecentEditions(
          baseUrl,
          athleteSlug,
          locale,
          recentEditions,
        ),
        messages: {
          preview: t("preview", { athleteFirstName }),
          fallbackBody: t("fallbackBody", { athleteFirstName }),
          partnersLabel: t("partnersLabel"),
          followSocial: t("followSocial", { athleteFirstName }),
          unsubscribeLabel: t("unsubscribeLabel"),
          footerNote: t("footerNote", { athleteName }),
          previousEditionsLabel: t("previousEditionsLabel"),
          editionLabel: t("editionLabel"),
        },
      }),
    }),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Resend send timed out")),
        RESEND_TIMEOUT_MS,
      ),
    ),
  ]);

  if (result.error) {
    throw new Error(`Welcome email failed: ${result.error.message}`);
  }
}
