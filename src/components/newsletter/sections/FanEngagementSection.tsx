import type { FanEngagementBlock } from "@/lib/schemas/newsletterSection";
import ChallengeBlock from "@/components/newsletter/blocks/ChallengeBlock";
import PollBlock from "@/components/newsletter/blocks/PollBlock";
import PredictionBlock from "@/components/newsletter/blocks/PredictionBlock";
import PrizeDrawBlock from "@/components/newsletter/blocks/PrizeDrawBlock";
import QABlock from "@/components/newsletter/blocks/QABlock";
import QuizBlock from "@/components/newsletter/blocks/QuizBlock";
import SurveyBlock from "@/components/newsletter/blocks/SurveyBlock";

interface FanEngagementSectionProps {
  blocks: FanEngagementBlock[];
  athleteSlug?: string;
  newsletterId?: string;
  previewMode?: boolean;
}

interface BlockCommonProps {
  athleteSlug: string;
  newsletterId: string;
  previewMode: boolean;
}

function renderBlock(
  block: FanEngagementBlock,
  common: BlockCommonProps,
): React.ReactNode {
  switch (block.kind) {
    case "poll":
      return <PollBlock block={block} {...common} />;
    case "prediction":
      return <PredictionBlock block={block} {...common} />;
    case "quiz":
      return <QuizBlock block={block} {...common} />;
    case "prize_draw":
      return <PrizeDrawBlock block={block} {...common} />;
    case "qa":
      return <QABlock block={block} {...common} />;
    case "survey":
      return <SurveyBlock block={block} {...common} />;
    case "challenge":
      return <ChallengeBlock block={block} {...common} />;
  }
}

export default function FanEngagementSection({
  blocks,
  athleteSlug,
  newsletterId,
  previewMode = false,
}: FanEngagementSectionProps) {
  // The parent only renders this section to subscribed users; without slug
  // and newsletterId we can't address the engagement API at all.
  if (!athleteSlug || !newsletterId) return null;

  const common: BlockCommonProps = { athleteSlug, newsletterId, previewMode };

  return (
    <div className="space-y-8">
      {blocks.map((block) => (
        <div
          key={block.id}
          className="border-b border-line pb-6 last:border-b-0 last:pb-0"
        >
          {renderBlock(block, common)}
        </div>
      ))}
    </div>
  );
}
