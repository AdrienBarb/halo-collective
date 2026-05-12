import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { IntlErrorCode, type IntlError } from "next-intl";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./locales";

const messageLoaders: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import("./messages/en.json"),
  fr: () => import("./messages/fr.json"),
};

// Default next-intl behaviour is to throw on MISSING_MESSAGE in
// server contexts — which would 500 a newsletter publish if any
// locale is missing a key, leaving the row in SENDING state and
// requiring manual DB intervention. We log the failure and fall
// back to the key name so the campaign still ships with a
// human-recognizable placeholder.
function onError(error: IntlError) {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    console.error(
      JSON.stringify({
        scope: "i18n",
        event: "missing_message",
        message: error.message,
      }),
    );
    return;
  }
  console.error(
    JSON.stringify({ scope: "i18n", event: "intl_error", message: error.message }),
  );
}

function getMessageFallback({ key, namespace }: { key: string; namespace?: string }) {
  return namespace ? `${namespace}.${key}` : key;
}

export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieValue = store.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await messageLoaders[locale]()).default,
    onError,
    getMessageFallback,
  };
});
