import { Hr, Section, Text } from "@react-email/components";
import type { EngagementContent } from "@/lib/schemas/newsletterSection";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { EmailCtaButton } from "@/lib/emails/_brand/atoms";
import PollOption from "@/lib/emails/blocks/PollOption";

interface EngagementSectionProps {
  content: EngagementContent;
  askQuestionUrl?: string | null;
}

export default function EngagementSection({
  content,
  askQuestionUrl,
}: EngagementSectionProps) {
  const labels = getNewsletterLabels();

  return (
    <Section>
      {content.question ? (
        <Section>
          <Text
            style={{
              margin: 0,
              color: palette.ink,
              fontFamily: fonts.sans,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {content.question}
          </Text>
          <Text
            style={{
              margin: "8px 0 0",
              color: palette.ink2,
              fontFamily: fonts.sans,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {labels.questionIntro}
          </Text>
        </Section>
      ) : null}

      {content.pollOptions.length > 0 ? (
        <Section style={{ marginTop: 12 }}>
          {content.pollOptions.map((opt, i) => (
            <PollOption key={i} option={opt} />
          ))}
        </Section>
      ) : null}

      {content.pollUrl ? (
        <Section style={{ marginTop: 16 }}>
          <EmailCtaButton href={content.pollUrl}>
            {labels.ctas.vote}
          </EmailCtaButton>
        </Section>
      ) : null}

      {askQuestionUrl ? (
        <Section style={{ marginTop: 20 }}>
          <Hr style={{ borderColor: palette.line, margin: "0 0 16px" }} />
          <EmailCtaButton href={askQuestionUrl}>
            {labels.ctas.askMe}
          </EmailCtaButton>
          <Text
            style={{
              margin: "12px 0 0",
              color: palette.ink3,
              fontFamily: fonts.sans,
              fontSize: 12,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {labels.reassuranceText}
          </Text>
        </Section>
      ) : null}
    </Section>
  );
}
