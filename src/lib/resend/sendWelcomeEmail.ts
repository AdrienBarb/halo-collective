import { getTranslations } from "next-intl/server";
import { resendClient } from "@/lib/resend/resendClient";
import {
  WelcomeEmail,
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
  locale?: Locale | string;
}

const SOCIAL_KEYS = ["instagram", "x", "tiktok", "facebook", "linkedin"] as const;
const RESEND_TIMEOUT_MS = 10_000;

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
  } = input;
  const locale: Locale = isLocale(input.locale) ? input.locale : DEFAULT_LOCALE;
  const t = await getTranslations({ locale, namespace: "Emails.Welcome" });
  const athleteName = `${athleteFirstName} ${athleteLastName}`;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BETTER_AUTH_URL ||
    config.project.url;

  const safeCover = isHttpsUrl(coverImageUrl) ? coverImageUrl : undefined;

  const result = await Promise.race([
    resendClient.emails.send({
      from: getRequiredEnv("RESEND_FROM_EMAIL"),
      to: email,
      subject: t("preview", { athleteFirstName }),
      react: WelcomeEmail({
        profileUrl: `${baseUrl}/${athleteSlug}`,
        athleteFirstName,
        coverImageUrl: safeCover,
        welcomeMessage: welcomeMessage ?? undefined,
        sponsors: normalizeSponsors(sponsors),
        socialLinks: normalizeSocialLinks(socialLinks),
        messages: {
          preview: t("preview", { athleteFirstName }),
          greetingHeading: firstName
            ? t("greetingHeading", { fanFirstName: firstName })
            : t("greetingHeadingFallback", { athleteFirstName }),
          fallbackBody: t("fallbackBody", { athleteFirstName }),
          partnersLabel: t("partnersLabel"),
          followSocial: t("followSocial", { athleteFirstName }),
          unsubscribeLabel: t("unsubscribeLabel"),
          footerNote: t("footerNote", { athleteName }),
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
