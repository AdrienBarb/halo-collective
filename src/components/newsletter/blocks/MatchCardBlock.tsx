import { useLocale } from "next-intl";
import type { MatchCardBlock as MatchCardBlockType } from "@/lib/schemas/newsletterSection";
import {
  getNewsletterLabels,
  type NewsletterLocale,
} from "@/lib/newsletter/labels";
import { parseYouTubeId } from "@/lib/newsletter/youtube";
import YouTubeEmbed from "@/components/newsletter/blocks/YouTubeEmbed";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locales";

interface MatchCardBlockProps {
  match: MatchCardBlockType;
}

const BADGE_STYLES: Record<MatchCardBlockType["result"], string> = {
  W: "bg-win text-cream",
  L: "bg-loss text-cream",
  BYE: "bg-cream-3 text-ink-3",
  EXEMPT: "bg-cream-3 text-ink-3",
};

export default function MatchCardBlock({ match }: MatchCardBlockProps) {
  const showOpponent =
    match.opponentName && match.result !== "BYE" && match.result !== "EXEMPT";
  const rawLocale = useLocale();
  const locale: NewsletterLocale = isLocale(rawLocale)
    ? rawLocale
    : DEFAULT_LOCALE;
  const labels = getNewsletterLabels(locale);
  const youtubeId = parseYouTubeId(match.highlightUrl);
  const highlightsLabel = youtubeId
    ? labels.ctas.watchOnYoutube
    : labels.ctas.highlights;
  const resultLetter =
    match.result === "W"
      ? labels.matchResultLetters.win
      : match.result === "L"
        ? labels.matchResultLetters.loss
        : match.result === "EXEMPT"
          ? "—"
          : match.result;

  const metaRight = [match.roundName, match.date].filter(Boolean).join(" · ");
  const headline = showOpponent ? match.opponentName : resultLetter;
  const subline = showOpponent
    ? match.opponentRank
      ? `${match.opponentRank}${match.opponentCountry ? ` · ${match.opponentCountry}` : ""}`
      : match.contextNote ?? null
    : match.contextNote ?? null;

  return (
    <article className="rounded-xl border border-line bg-cream px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex h-6 min-w-[28px] items-center justify-center rounded-md px-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.12em] ${BADGE_STYLES[match.result]}`}
        >
          {resultLetter}
        </span>
        {metaRight ? (
          <span className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
            {metaRight}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[14px] font-semibold text-ink">{headline}</span>
        {subline ? (
          <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-ink-3">
            {subline}
          </span>
        ) : null}
      </div>

      {match.score ? (
        <div className="mt-1 font-display text-[32px] font-extrabold italic leading-[1.05] tracking-[-0.005em] text-ink">
          {match.score.split(/\s+/).map((set, i) => (
            <span key={i} className="mr-4 inline-block">
              {set}
            </span>
          ))}
        </div>
      ) : null}

      {match.commentary ? (
        <p className="mt-3 text-[13px] leading-[1.55] text-ink-2">
          {match.commentary}
        </p>
      ) : null}

      {youtubeId ? (
        <div className="mt-4">
          <YouTubeEmbed videoId={youtubeId} label={highlightsLabel} />
        </div>
      ) : match.highlightUrl ? (
        <div className="mt-4">
          <a
            href={match.highlightUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-action px-3 py-1.5 font-display text-[13px] font-bold uppercase tracking-[0.1em] text-cream"
          >
            ▶ {highlightsLabel} →
          </a>
        </div>
      ) : null}
    </article>
  );
}
