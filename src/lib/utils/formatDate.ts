import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import type { Locale } from "@/i18n/locales";

const DATE_FNS_LOCALES = { en: enUS, fr } as const;

export function formatShortDate(date: Date, locale: Locale): string {
  return format(date, "d MMM yyyy", { locale: DATE_FNS_LOCALES[locale] });
}

export function formatShortDateNoYear(date: Date, locale: Locale): string {
  return format(date, "d MMM", { locale: DATE_FNS_LOCALES[locale] });
}

export function formatDateRange(
  start: Date,
  end: Date,
  locale: Locale,
): string {
  const dfnsLocale = DATE_FNS_LOCALES[locale];

  if (start.getTime() === end.getTime()) {
    return format(end, "d MMM", { locale: dfnsLocale });
  }

  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();

  if (sameMonth) {
    const startDay = format(start, "d", { locale: dfnsLocale });
    const endLong = format(end, "d MMM", { locale: dfnsLocale });
    return `${startDay}–${endLong}`;
  }

  const startShort = format(start, "d MMM", { locale: dfnsLocale });
  const endShort = format(end, "d MMM", { locale: dfnsLocale });
  return `${startShort} – ${endShort}`;
}
