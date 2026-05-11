import { Section } from "@react-email/components";
import type { FanEngagementBlock } from "@/lib/schemas/newsletterSection";
import {
  ChallengeBlock,
  PollBlock,
  PredictionBlock,
  PrizeDrawBlock,
  QABlock,
  QuizBlock,
  SurveyBlock,
} from "@/lib/emails/blocks/EngagementBlocks";

interface FanEngagementSectionProps {
  blocks: FanEngagementBlock[];
  /** URL on the web reader where activations are submitted. */
  ctaUrl?: string;
}

function renderBlock(
  block: FanEngagementBlock,
  ctaUrl: string | undefined,
): React.ReactNode {
  switch (block.kind) {
    case "poll":
      return <PollBlock block={block} ctaUrl={ctaUrl} />;
    case "prediction":
      return <PredictionBlock block={block} ctaUrl={ctaUrl} />;
    case "quiz":
      return <QuizBlock block={block} ctaUrl={ctaUrl} />;
    case "prize_draw":
      return <PrizeDrawBlock block={block} ctaUrl={ctaUrl} />;
    case "qa":
      return <QABlock block={block} ctaUrl={ctaUrl} />;
    case "survey":
      return <SurveyBlock block={block} ctaUrl={ctaUrl} />;
    case "challenge":
      return <ChallengeBlock block={block} />;
  }
}

export default function FanEngagementSection({
  blocks,
  ctaUrl,
}: FanEngagementSectionProps) {
  return (
    <Section>
      {blocks.map((block) => (
        <div key={block.id}>{renderBlock(block, ctaUrl)}</div>
      ))}
    </Section>
  );
}
