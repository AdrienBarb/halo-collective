import type { MatchCardBlock as MatchCardBlockType } from "@/lib/schemas/newsletterSection";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import { parseYouTubeId } from "@/lib/newsletter/youtube";

interface MatchCardBlockProps {
  match: MatchCardBlockType;
}

const RESULT_STYLES: Record<MatchCardBlockType["result"], string> = {
  W: "bg-win text-cream",
  L: "bg-loss text-cream",
  BYE: "bg-cream-3 text-ink-3",
  EXEMPT: "bg-cream-3 text-ink-3",
};

export default function MatchCardBlock({ match }: MatchCardBlockProps) {
  const showOpponent =
    match.opponentName && match.result !== "BYE" && match.result !== "EXEMPT";
  const labels = getNewsletterLabels();
  const isYouTube = parseYouTubeId(match.highlightUrl) !== null;
  const highlightsLabel = isYouTube
    ? labels.ctas.watchOnYoutube
    : labels.ctas.highlights;

  return (
    <article className="border-b border-line py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] font-bold ${RESULT_STYLES[match.result]}`}
            >
              {match.result === "EXEMPT" ? "—" : match.result.charAt(0)}
            </span>
            {showOpponent ? (
              <span className="text-sm font-bold text-ink">
                vs {match.opponentName}
                {match.opponentRank ? (
                  <span className="ml-2 font-normal text-ink-3">
                    {match.opponentRank}
                    {match.opponentCountry ? ` ${match.opponentCountry}` : ""}
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="text-sm font-bold text-ink">{match.roundName}</span>
            )}
          </div>

          {match.score ? (
            <div className="font-mono text-xs text-ink-2">
              {match.score.split(/\s+/).map((set, i) => (
                <span key={i} className="mr-2 font-semibold">
                  {set}
                </span>
              ))}
            </div>
          ) : match.result === "BYE" || match.result === "EXEMPT" ? (
            <div>
              <span className="inline-block bg-cream-3 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-ink-3">
                {match.result}
              </span>
            </div>
          ) : null}

          <div className="font-mono text-[10px] uppercase tracking-wide text-ink-3">
            {showOpponent ? match.roundName : null}
            {showOpponent && match.date ? " · " : null}
            {match.date}
            {match.contextNote ? ` · ${match.contextNote}` : null}
          </div>
        </div>

        {match.highlightUrl ? (
          <a
            href={match.highlightUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded bg-action px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-cream"
          >
            ▶ {highlightsLabel}
          </a>
        ) : null}
      </div>

      {match.commentary ? (
        <p className="mt-3 font-serif text-sm italic leading-relaxed text-ink-2">
          {match.commentary}
        </p>
      ) : null}
    </article>
  );
}
