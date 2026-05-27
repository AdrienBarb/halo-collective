import { MjmlColumn, MjmlSection, MjmlText } from "@faire/mjml-react";
import type { ReactNode } from "react";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { EmailCtaButton } from "@/lib/emails/mjml/_brand/atoms";

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
    <MjmlSection
      backgroundColor={palette.surface}
      cssClass="force-light-bg"
      padding="18px 32px 24px"
    >
      <MjmlColumn
        backgroundColor={palette.surface}
        border={`1px solid ${palette.borderSoft}`}
        padding="18px 18px"
      >
        <MjmlText
          color={palette.accent}
          fontFamily={fonts.mono}
          fontSize="10px"
          fontWeight="700"
          letterSpacing="0.18em"
          textTransform="uppercase"
          padding="0"
        >
          {eyebrow}
        </MjmlText>
        <MjmlText
          color={palette.panelDark}
          fontFamily={fonts.serif}
          fontSize="17px"
          fontStyle="italic"
          lineHeight="1.45"
          padding="10px 0 0"
        >
          {prompt}
        </MjmlText>
        {body ? (
          <MjmlText
            color={palette.textBody}
            fontFamily={fonts.sans}
            fontSize="14px"
            lineHeight="1.6"
            padding="10px 0 0"
          >
            {body}
          </MjmlText>
        ) : null}
        {children}
        {ctaUrl && ctaLabel ? (
          <EmailCtaButton href={ctaUrl} padding="14px 0 0">
            {ctaLabel}
          </EmailCtaButton>
        ) : null}
        {reassurance ? (
          <MjmlText
            color={palette.textMuted}
            fontFamily={fonts.mono}
            fontSize="10px"
            letterSpacing="0.12em"
            textTransform="uppercase"
            padding="12px 0 0"
          >
            {reassurance}
          </MjmlText>
        ) : null}
        {closesAt ? (
          <MjmlText
            color={palette.textMuted}
            fontFamily={fonts.mono}
            fontSize="10px"
            letterSpacing="0.12em"
            textTransform="uppercase"
            padding="8px 0 0"
          >
            Closes {closesAt}
          </MjmlText>
        ) : null}
      </MjmlColumn>
    </MjmlSection>
  );
}
