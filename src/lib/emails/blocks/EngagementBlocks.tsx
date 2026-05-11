import { Section, Text } from "@react-email/components";
import type {
  ChallengeBlock as ChallengeBlockType,
  PollBlock as PollBlockType,
  PredictionBlock as PredictionBlockType,
  PrizeDrawBlock as PrizeDrawBlockType,
  QABlock as QABlockType,
  QuizBlock as QuizBlockType,
  SurveyBlock as SurveyBlockType,
} from "@/lib/schemas/newsletterSection";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import EngagementCard from "@/lib/emails/blocks/EngagementCard";
import MediaBlock from "@/lib/emails/blocks/MediaBlock";

interface CommonProps {
  ctaUrl?: string;
}

function OptionsPreview({
  options,
}: {
  options: Array<{ label: string; emoji?: string }>;
}) {
  if (options.length === 0) return null;
  return (
    <Section style={{ marginTop: 10 }}>
      {options.map((opt, i) => (
        <Text
          key={i}
          style={{
            margin: i === 0 ? 0 : "6px 0 0",
            color: palette.ink2,
            fontFamily: fonts.sans,
            fontSize: 13,
          }}
        >
          {opt.emoji ? `${opt.emoji}  ` : "•  "}
          {opt.label}
        </Text>
      ))}
    </Section>
  );
}

export function PollBlock({ block, ctaUrl }: { block: PollBlockType } & CommonProps) {
  const labels = getNewsletterLabels();
  return (
    <EngagementCard
      eyebrow={labels.engagementEyebrows.poll}
      prompt={block.question}
      ctaUrl={ctaUrl}
      ctaLabel={labels.ctas.vote}
      closesAt={block.closesAt}
    >
      <OptionsPreview options={block.options} />
    </EngagementCard>
  );
}

export function PredictionBlock({
  block,
  ctaUrl,
}: { block: PredictionBlockType } & CommonProps) {
  const labels = getNewsletterLabels();
  return (
    <EngagementCard
      eyebrow={labels.engagementEyebrows.prediction}
      prompt={block.prompt}
      ctaUrl={ctaUrl}
      ctaLabel={labels.ctas.vote}
      closesAt={block.closesAt}
    >
      <OptionsPreview options={block.options} />
    </EngagementCard>
  );
}

export function QuizBlock({ block, ctaUrl }: { block: QuizBlockType } & CommonProps) {
  const labels = getNewsletterLabels();
  return (
    <EngagementCard
      eyebrow={labels.engagementEyebrows.quiz}
      prompt={block.question}
      ctaUrl={ctaUrl}
      ctaLabel={labels.ctas.vote}
      closesAt={block.closesAt}
    >
      <OptionsPreview
        options={block.options.map((o) => ({ label: o.label }))}
      />
    </EngagementCard>
  );
}

export function PrizeDrawBlock({
  block,
  ctaUrl,
}: { block: PrizeDrawBlockType } & CommonProps) {
  const labels = getNewsletterLabels();
  return (
    <EngagementCard
      eyebrow={labels.engagementEyebrows.prize_draw}
      prompt={block.title}
      body={block.body}
      ctaUrl={ctaUrl}
      ctaLabel={block.ctaLabel ?? labels.ctas.enterDraw}
      closesAt={block.closesAt}
    >
      {block.prizeMedia ? <MediaBlock media={block.prizeMedia} /> : null}
    </EngagementCard>
  );
}

export function QABlock({ block, ctaUrl }: { block: QABlockType } & CommonProps) {
  const labels = getNewsletterLabels();
  return (
    <EngagementCard
      eyebrow={labels.engagementEyebrows.qa}
      prompt={block.prompt}
      body={block.intro}
      ctaUrl={ctaUrl}
      ctaLabel={labels.ctas.askMe}
      reassurance={block.reassurance ?? labels.reassuranceText}
    />
  );
}

export function SurveyBlock({
  block,
  ctaUrl,
}: { block: SurveyBlockType } & CommonProps) {
  const labels = getNewsletterLabels();
  const href = block.externalUrl ?? ctaUrl;
  return (
    <EngagementCard
      eyebrow={labels.engagementEyebrows.survey}
      prompt={block.title}
      body={block.body}
      ctaUrl={href}
      ctaLabel={labels.ctas.learnMore}
    />
  );
}

export function ChallengeBlock({ block }: { block: ChallengeBlockType }) {
  const labels = getNewsletterLabels();
  return (
    <EngagementCard
      eyebrow={labels.engagementEyebrows.challenge}
      prompt={block.title}
      body={block.brief}
    >
      {block.media ? <MediaBlock media={block.media} /> : null}
    </EngagementCard>
  );
}
