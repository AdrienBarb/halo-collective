import { useLocale } from "next-intl";
import type { MediaRecapBlock as MediaRecapBlockType } from "@/lib/schemas/newsletterSection";
import MediaLinkRow from "@/components/newsletter/blocks/MediaLinkRow";
import {
  getNewsletterLabels,
  type NewsletterLocale,
} from "@/lib/newsletter/labels";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locales";

interface MediaRecapBlockProps {
  block: MediaRecapBlockType;
}

export default function MediaRecapBlock({ block }: MediaRecapBlockProps) {
  return (
    <div className="space-y-3">
      <MediaLinkGroupHeader count={block.links.length} />
      <div className="-mr-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 pr-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {block.links.map((link, i) => (
          <MediaLinkRow key={i} link={link} asCard />
        ))}
      </div>
    </div>
  );
}

export function MediaLinkGroupHeader({ count }: { count?: number }) {
  const rawLocale = useLocale();
  const locale: NewsletterLocale = isLocale(rawLocale)
    ? rawLocale
    : DEFAULT_LOCALE;
  const labels = getNewsletterLabels(locale);

  const countLabel =
    typeof count === "number" && count > 0
      ? (count === 1
          ? labels.mediaRecap.articleSingularTemplate
          : labels.mediaRecap.articlePluralTemplate
        ).replace("{count}", String(count))
      : null;

  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="font-serif text-[16px] font-medium leading-tight text-ink">
        {labels.mediaRecap.header}
      </div>
      {countLabel ? (
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
          {countLabel}
        </div>
      ) : null}
    </div>
  );
}
