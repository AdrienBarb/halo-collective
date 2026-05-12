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
  /** Web reader URL for this edition — where polls/quizzes/draws actually live. */
  editionUrl: string;
  /** Optional dedicated feedback URL — used only by the Q&A "Ask me anything" CTA. */
  askQuestionUrl?: string;
}

// Picks the right destination per engagement block:
//   - poll / prediction / quiz / prize_draw / survey → the web reader
//     (these activations need the interactive widget, not a generic form)
//   - qa                                              → the feedback URL
//   - challenge                                       → no CTA
function ctaUrlFor(
  block: FanEngagementBlock,
  editionUrl: string,
  askQuestionUrl: string | undefined,
): string | undefined {
  switch (block.kind) {
    case "qa":
      return askQuestionUrl ?? editionUrl;
    case "survey":
      // Surveys may carry their own externalUrl; that's resolved inside
      // SurveyBlock. Falling back to editionUrl is correct when they don't.
      return editionUrl;
    case "challenge":
      return undefined;
    default:
      return editionUrl;
  }
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
  editionUrl,
  askQuestionUrl,
}: FanEngagementSectionProps) {
  return (
    <Section>
      {blocks.map((block) => (
        <div key={block.id}>
          {renderBlock(block, ctaUrlFor(block, editionUrl, askQuestionUrl))}
        </div>
      ))}
    </Section>
  );
}
