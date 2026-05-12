import { getTranslations } from "next-intl/server";
import { resendClient } from "@/lib/resend/resendClient";
import { PasswordResetEmail } from "@/lib/emails/PasswordResetEmail";
import { getRequiredEnv } from "@/lib/utils/env";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";

interface SendPasswordResetEmailInput {
  email: string;
  resetUrl: string;
  firstName?: string;
  locale?: Locale | string;
}

export async function sendPasswordResetEmail(
  input: SendPasswordResetEmailInput,
) {
  const { email, resetUrl, firstName } = input;
  const locale: Locale = isLocale(input.locale) ? input.locale : DEFAULT_LOCALE;
  const t = await getTranslations({
    locale,
    namespace: "Emails.PasswordReset",
  });
  const greeting = firstName ? `${firstName}, ` : "";

  const result = await resendClient.emails.send({
    from: getRequiredEnv("RESEND_FROM_EMAIL"),
    to: email,
    subject: t("preview"),
    react: PasswordResetEmail({
      resetUrl,
      messages: {
        preview: t("preview"),
        eyebrow: t("eyebrow"),
        footer: t("footer"),
        heading: t("heading"),
        body: t("body", { greeting }),
        button: t("button"),
      },
    }),
  });

  if (result.error) {
    throw new Error(`Password reset email failed: ${result.error.message}`);
  }
}
