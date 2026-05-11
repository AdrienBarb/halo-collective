import { Section, Text } from "@react-email/components";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { EmailParagraphs } from "@/lib/emails/_brand/atoms";
import MediaBlock from "@/lib/emails/blocks/MediaBlock";
import type { MediaBlock as MediaBlockType } from "@/lib/schemas/newsletterSection";

interface TextUpdateBlockProps {
  eyebrow: string;
  body: string;
  media?: MediaBlockType;
}

// Shared shell for training_update / recovery_travel_update / throwback.
export default function TextUpdateBlock({
  eyebrow,
  body,
  media,
}: TextUpdateBlockProps) {
  return (
    <Section style={{ marginBottom: 16 }}>
      <Text
        style={{
          margin: "0 0 10px",
          color: palette.ink3,
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </Text>
      {media ? <MediaBlock media={media} /> : null}
      <EmailParagraphs paragraphs={splitParagraphs(body)} />
    </Section>
  );
}
