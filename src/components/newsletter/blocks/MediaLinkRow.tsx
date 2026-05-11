import { getNewsletterLabels } from "@/lib/newsletter/labels";

interface MediaLinkRowProps {
  link: {
    source: string;
    headline: string;
    url: string;
    ctaLabel?: string;
  };
}

export default function MediaLinkRow({ link }: MediaLinkRowProps) {
  const readLabel = link.ctaLabel ?? getNewsletterLabels().ctas.read;

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
