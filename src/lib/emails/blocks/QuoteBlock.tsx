import { Section, Text } from "@react-email/components";
import type { QuoteBlock as QuoteBlockType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface QuoteBlockProps {
  block: QuoteBlockType;
}

export default function QuoteBlock({ block }: QuoteBlockProps) {
  return (
    <Section
      style={{
        backgroundColor: palette.surface,
        borderRadius: 6,
        padding: "16px 18px",
        marginTop: 16,
      }}
    >
      <Text
        style={{
          margin: 0,
          color: palette.panelDark,
          fontFamily: fonts.serif,
          fontSize: 17,
          fontStyle: "italic",
          lineHeight: 1.55,
        }}
      >
        “{block.text}”
      </Text>
      {block.attribution ? (
        <Text
          style={{
            margin: "10px 0 0",
            color: palette.textMuted,
            fontFamily: fonts.mono,
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          — {block.attribution}
        </Text>
      ) : null}
    </Section>
  );
}
