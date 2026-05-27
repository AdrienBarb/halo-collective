import { Fragment } from "react";
import type { FanEngagementBlock } from "@/lib/schemas/newsletterSection";
import type { NewsletterLocale } from "@/lib/newsletter/labels";
import {
  ChallengeBlock,
  PollBlock,
  PredictionBlock,
  PrizeDrawBlock,
  QABlock,
  QuizBlock,
  SurveyBlock,
} from "@/lib/emails/mjml/blocks/EngagementBlocks";

interface FanEngagementSectionProps {
  blocks: FanEngagementBlock[];
  editionUrl: string;
  askQuestionUrl?: string;
  locale: NewsletterLocale;
}

function ctaUrlFor(
  block: FanEngagementBlock,
  editionUrl: string,
  askQuestionUrl: string | undefined,
): string | undefined {
  switch (block.kind) {
    case "qa":
      return askQuestionUrl ?? editionUrl;
    case "survey":
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
  locale: NewsletterLocale,
): React.ReactNode {
  switch (block.kind) {
    case "poll":
      return <PollBlock block={block} ctaUrl={ctaUrl} locale={locale} />;
    case "prediction":
      return (
        <PredictionBlock block={block} ctaUrl={ctaUrl} locale={locale} />
      );
    case "quiz":
      return <QuizBlock block={block} ctaUrl={ctaUrl} locale={locale} />;
    case "prize_draw":
      return (
        <PrizeDrawBlock block={block} ctaUrl={ctaUrl} locale={locale} />
      );
    case "qa":
      return <QABlock block={block} ctaUrl={ctaUrl} locale={locale} />;
    case "survey":
      return <SurveyBlock block={block} ctaUrl={ctaUrl} locale={locale} />;
    case "challenge":
      return <ChallengeBlock block={block} locale={locale} />;
  }
}

export default function FanEngagementSection({
  blocks,
  editionUrl,
  askQuestionUrl,
  locale,
}: FanEngagementSectionProps) {
  return (
    <>
      {blocks.map((block) => (
        <Fragment key={block.id}>
          {renderBlock(
            block,
            ctaUrlFor(block, editionUrl, askQuestionUrl),
            locale,
          )}
        </Fragment>
      ))}
    </>
  );
}
