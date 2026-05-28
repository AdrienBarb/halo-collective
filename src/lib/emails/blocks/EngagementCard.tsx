import { Section, Text } from "@react-email/components";
import type { ReactNode } from "react";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { EmailCtaButton } from "@/lib/emails/_brand/atoms";

interface EngagementCardProps {
  eyebrow: string;
  prompt: string;
  body?: string;
  ctaUrl?: string;
  ctaLabel?: string;
  closesAt?: string;
  /** Optional content (poll options preview, prize media) rendered before CTA. */
  children?: ReactNode;
  reassurance?: string;
}

// Email-side engagement blocks all degrade to a styled card with a CTA
// linking back to the web reader (where the actual interaction lives).
// This shared shell keeps the surface consistent across poll, prediction,
// quiz, prize_draw, qa, survey, challenge.
export default function EngagementCard({
  eyebrow,
  prompt,
  body,
  ctaUrl,
  ctaLabel,
  closesAt,
  children,
  reassurance,
}: EngagementCardProps) {
  return (
    <Section
      style={{
        backgroundColor: palette.surface,
        borderRadius: 6,
        padding: "18px 18px",
        marginBottom: 24,
      }}
    >
      <Text
        style={{
          margin: 0,
          color: palette.accent,
          fontFamily: fonts.sans,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </Text>
      <Text
        style={{
          margin: "10px 0 0",
          color: palette.panelDark,
          fontFamily: fonts.display,
          fontSize: 19,
          fontStyle: "italic",
          fontWeight: 400,
          lineHeight: 1.35,
        }}
      >
        {prompt}
      </Text>
      {body ? (
        <Text
          style={{
            margin: "10px 0 0",
            color: palette.textBody,
            fontFamily: fonts.sans,
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {body}
        </Text>
      ) : null}
      {children}
      {ctaUrl && ctaLabel ? (
        <Section style={{ marginTop: 14 }}>
          <EmailCtaButton href={ctaUrl}>{ctaLabel}</EmailCtaButton>
        </Section>
      ) : null}
      {reassurance ? (
        <Text
          style={{
            margin: "12px 0 0",
            color: palette.textMuted,
            fontFamily: fonts.sans,
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {reassurance}
        </Text>
      ) : null}
      {closesAt ? (
        <Text
          style={{
            margin: "8px 0 0",
            color: palette.textMuted,
            fontFamily: fonts.sans,
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Closes {closesAt}
        </Text>
      ) : null}
    </Section>
  );
}
