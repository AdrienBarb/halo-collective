import type { EngagementContent } from "@/lib/schemas/newsletterSection";
import { getNewsletterLabels } from "@/lib/newsletter/labels";

interface EngagementSectionProps {
  content: EngagementContent;
  /** Used to build the "Ask me a question" URL. */
  athleteSlug?: string;
}

export default function EngagementSection({
  content,
  athleteSlug,
}: EngagementSectionProps) {
  const labels = getNewsletterLabels();
  const askQuestionUrl = athleteSlug ? `/athletes/${athleteSlug}/feedback` : null;

  return (
    <div className="space-y-6">
      {content.question ? (
        <div>
          <div className="text-base font-bold text-ink">{content.question}</div>
          <div className="mt-2 text-[14px] text-ink-2">{labels.questionIntro}</div>
        </div>
      ) : null}

      {content.pollOptions.length > 0 ? (
        <ul className="space-y-2">
          {content.pollOptions.map((opt, i) => (
            <li
              key={i}
              className={`flex items-center gap-3 border px-4 py-3 text-sm ${
                opt.isHighlighted
                  ? "border-action bg-cream-2 font-semibold text-ink"
                  : "border-line bg-cream text-ink-2"
              }`}
            >
              <span className="inline-block h-4 w-4 shrink-0 rounded-full border-2 border-line-2" />
              <span className="flex-1">
                {opt.emoji ? <span className="mr-2">{opt.emoji}</span> : null}
                {opt.label}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {content.pollUrl ? (
        <a
          href={content.pollUrl}
          target="_blank"
          rel="noreferrer"
          className="block bg-action px-6 py-4 text-center font-mono text-xs font-bold uppercase tracking-[0.18em] text-cream"
        >
          {labels.ctas.vote}
        </a>
      ) : null}

      {askQuestionUrl ? (
        <div className="border-t border-line pt-5">
          <a
            href={askQuestionUrl}
            className="block bg-action px-6 py-4 text-center font-mono text-xs font-bold uppercase tracking-[0.18em] text-cream"
          >
            {labels.ctas.askMe}
          </a>
          <p className="mt-3 text-center text-[12px] text-ink-3">
            {labels.reassuranceText}
          </p>
        </div>
      ) : null}
    </div>
  );
}
