import { getTranslations } from "next-intl/server";
import { resendClient } from "@/lib/resend/resendClient";
import { EmailOtpEmail } from "@/lib/emails/EmailOtpEmail";
import { getRequiredEnv } from "@/lib/utils/env";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";

interface SendOtpEmailInput {
  email: string;
  otp: string;
  locale?: Locale | string;
}

export async function sendOtpEmail(input: SendOtpEmailInput) {
  const { email, otp } = input;
  const locale: Locale = isLocale(input.locale) ? input.locale : DEFAULT_LOCALE;
  const t = await getTranslations({ locale, namespace: "Emails.OTP" });

  const result = await resendClient.emails.send({
    from: getRequiredEnv("RESEND_FROM_EMAIL"),
    to: email,
    subject: t("preview"),
    react: EmailOtpEmail({
      otp,
      messages: {
        preview: t("preview"),
        eyebrow: t("eyebrow"),
        footer: t("footer"),
        heading: t("heading"),
        lead: t("lead"),
        expiry: t("expiry"),
      },
    }),
  });

  if (result.error) {
    throw new Error(`OTP email failed: ${result.error.message}`);
  }
}
