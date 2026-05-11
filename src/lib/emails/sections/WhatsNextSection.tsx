import { Section, Text } from "@react-email/components";
import type { WhatsNextContent } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { EmailParagraphs } from "@/lib/emails/_brand/atoms";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import MediaBlock from "@/lib/emails/blocks/MediaBlock";
import ScheduleItem from "@/lib/emails/blocks/ScheduleItem";

interface WhatsNextSectionProps {
  content: WhatsNextContent;
}

export default function WhatsNextSection({ content }: WhatsNextSectionProps) {
  return (
    <Section>
      {content.media ? <MediaBlock media={content.media} /> : null}

      {content.tournamentMeta ? (
        <Text
          style={{
            margin: "0 0 12px",
            color: palette.ink3,
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {content.tournamentMeta}
        </Text>
      ) : null}

      <EmailParagraphs paragraphs={splitParagraphs(content.body)} />

      {content.schedule.length > 0 ? (
        <Section style={{ marginTop: 16 }}>
          {content.schedule.map((item, i) => (
            <ScheduleItem
              key={i}
              item={item}
              isLast={i === content.schedule.length - 1}
            />
          ))}
        </Section>
      ) : null}
    </Section>
  );
}
