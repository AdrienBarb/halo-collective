import { Section, Text } from "@react-email/components";
import type { PullQuote as PullQuoteType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface PullQuoteProps {
  quote: PullQuoteType;
}

export default function PullQuote({ quote }: PullQuoteProps) {
  return (
    <Section
      style={{
        backgroundColor: palette.cream,
        borderRadius: 6,
        padding: "14px 16px",
        marginTop: 16,
      }}
    >
      {quote.contextLabel ? (
        <Text
          style={{
            margin: "0 0 6px",
            color: palette.ink3,
            fontFamily: fonts.mono,
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {quote.contextLabel}
        </Text>
      ) : null}
      <Text
        style={{
          margin: 0,
          color: palette.ink2,
          fontFamily: fonts.serif,
          fontSize: 14,
          fontStyle: "italic",
          lineHeight: 1.6,
        }}
      >
        “{quote.text}”
      </Text>
    </Section>
  );
}
