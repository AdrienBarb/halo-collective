import { getTranslations } from "next-intl/server";
import { resendClient } from "@/lib/resend/resendClient";
import { WelcomeEmail } from "@/lib/emails/WelcomeEmail";
import { getRequiredEnv } from "@/lib/utils/env";
import config from "@/lib/config";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";

interface SendWelcomeEmailInput {
  email: string;
  firstName: string;
  athleteFirstName: string;
  athleteLastName: string;
  athleteSlug: string;
  locale?: Locale | string;
}

export async function sendWelcomeEmail(input: SendWelcomeEmailInput) {
  const { email, firstName, athleteFirstName, athleteLastName, athleteSlug } =
    input;
  const locale: Locale = isLocale(input.locale) ? input.locale : DEFAULT_LOCALE;
  const t = await getTranslations({ locale, namespace: "Emails.Welcome" });
  const athleteName = `${athleteFirstName} ${athleteLastName}`;
  const greeting = firstName ? `${firstName}, ` : "";

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BETTER_AUTH_URL ||
    config.project.url;

  const result = await resendClient.emails.send({
    from: getRequiredEnv("RESEND_FROM_EMAIL"),
    to: email,
    subject: t("preview", { athleteFirstName }),
    react: WelcomeEmail({
      profileUrl: `${baseUrl}/${athleteSlug}`,
      messages: {
        preview: t("preview", { athleteFirstName }),
        eyebrow: t("eyebrow"),
        footerNote: t("footerNote", { athleteName }),
        heading: t("heading", { athleteFirstName }),
        lead: t("lead", { greeting, athleteFirstName }),
        body: t("body"),
        button: t("button", { athleteFirstName }),
      },
    }),
  });

  if (result.error) {
    throw new Error(`Welcome email failed: ${result.error.message}`);
  }
}
