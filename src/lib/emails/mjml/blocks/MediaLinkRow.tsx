import { MjmlColumn, MjmlSection, MjmlText } from "@faire/mjml-react";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { safeHttpUrl } from "@/lib/emails/mjml/_brand/url";

interface MediaLinkRowProps {
  link: {
    source: string;
    headline: string;
    url: string;
    ctaLabel?: string;
  };
}

export default function MediaLinkRow({ link }: MediaLinkRowProps) {
  const readLabel = link.ctaLabel ?? getNewsletterLabels().ctas.read;

  return (
    <MjmlSection
      backgroundColor={palette.panel}
      cssClass="force-light-bg"
      padding="12px 32px"
      borderBottom={`1px solid ${palette.border}`}
    >
      <MjmlColumn width="75%" verticalAlign="middle">
        <MjmlText
          color={palette.textMuted}
          fontFamily={fonts.mono}
          fontSize="10px"
          letterSpacing="0.12em"
          textTransform="uppercase"
          padding="0"
        >
          <a
            href={safeHttpUrl(link.url)}
            style={{ color: palette.textMuted, textDecoration: "none" }}
          >
            {link.source}
          </a>
        </MjmlText>
        <MjmlText
          color={palette.panelDark}
          fontFamily={fonts.sans}
          fontSize="14px"
          padding="4px 0 0"
        >
          <a
            href={safeHttpUrl(link.url)}
            style={{ color: palette.panelDark, textDecoration: "none" }}
          >
            {link.headline}
          </a>
        </MjmlText>
      </MjmlColumn>
      <MjmlColumn width="25%" verticalAlign="middle">
        <MjmlText
          align="right"
          color={palette.accent}
          fontFamily={fonts.mono}
          fontSize="10px"
          fontWeight="700"
          letterSpacing="0.12em"
          textTransform="uppercase"
          padding="0"
        >
          <a
            href={safeHttpUrl(link.url)}
            style={{ color: palette.accent, textDecoration: "none" }}
          >
            {readLabel} →
          </a>
        </MjmlText>
      </MjmlColumn>
    </MjmlSection>
  );
}
