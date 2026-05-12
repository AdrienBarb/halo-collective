import { getLocale } from "next-intl/server";
import {
  getNewsletterLabels,
  type NewsletterLocale,
} from "@/lib/newsletter/labels";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locales";

interface MediaLinkRowProps {
  link: {
    source: string;
    headline: string;
    url: string;
    ctaLabel?: string;
  };
  /** When true, renders as a fixed-width card for a horizontal carousel. */
  asCard?: boolean;
}

export default async function MediaLinkRow({
  link,
  asCard = false,
}: MediaLinkRowProps) {
  const rawLocale = await getLocale();
  const locale: NewsletterLocale = isLocale(rawLocale)
    ? rawLocale
    : DEFAULT_LOCALE;
  const readLabel = link.ctaLabel ?? getNewsletterLabels(locale).ctas.read;

  if (asCard) {
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-[240px] shrink-0 snap-start flex-col justify-between rounded-xl border border-line bg-cream p-4 transition-colors duration-200 hover:border-line-2"
      >
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
            {link.source}
          </div>
          <div className="mt-2 font-serif text-[15px] font-medium leading-[1.25] tracking-[-0.01em] text-ink">
            {link.headline}
          </div>
        </div>
        <span className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-action">
          {readLabel} →
        </span>
      </a>
    );
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0"
    >
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-wide text-ink-3">
          {link.source}
        </div>
        <div className="mt-1 text-sm text-ink">{link.headline}</div>
      </div>
      <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-wide text-action">
        {readLabel} →
      </span>
    </a>
  );
}
