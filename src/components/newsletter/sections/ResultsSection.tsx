import type { ResultsContent } from "@/lib/schemas/newsletterSection";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import MatchBlock from "@/components/newsletter/blocks/MatchBlock";
import MediaBlock from "@/components/newsletter/blocks/MediaBlock";
import PressLinkRow from "@/components/newsletter/blocks/PressLinkRow";
import StatBox from "@/components/newsletter/blocks/StatBox";

interface ResultsSectionProps {
  content: ResultsContent;
}

export default function ResultsSection({ content }: ResultsSectionProps) {
  const labels = getNewsletterLabels();

  return (
    <div className="space-y-6">
      {content.stats.length > 0 ? (
        <div className="flex gap-1">
          {content.stats.map((stat, i) => (
            <StatBox key={i} stat={stat} />
          ))}
        </div>
      ) : null}

      {content.matches.length > 0 ? (
        <div>
          <div className="border-b-2 border-ink pb-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
            Singles
          </div>
          <div>
            {content.matches.map((match, i) => (
              <MatchBlock key={i} match={match} />
            ))}
          </div>
        </div>
      ) : null}

      {content.pressLinks && content.pressLinks.length > 0 ? (
        <div className="border-t border-line pt-5">
          <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ink-3">
            {labels.eyebrows.press}
          </div>
          <div>
            {content.pressLinks.map((link, i) => (
              <PressLinkRow key={i} link={link} />
            ))}
          </div>
        </div>
      ) : null}

      {content.subSection ? (
        <div className="border-t border-line pt-5">
          <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ink-3">
            {content.subSection.label}
          </div>
          {content.subSection.media ? (
            <div className="mb-4">
              <MediaBlock media={content.subSection.media} />
            </div>
          ) : null}
          <div className="space-y-3 text-[15px] leading-[1.75] text-ink-2">
            {content.subSection.body
              .split(/\n{2,}/)
              .map((p, i) => (
                <p key={i} className="font-serif italic">
                  {p.trim()}
                </p>
              ))}
          </div>
          {content.subSection.pressLinks && content.subSection.pressLinks.length > 0 ? (
            <div className="mt-4">
              {content.subSection.pressLinks.map((link, i) => (
                <PressLinkRow key={i} link={link} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
