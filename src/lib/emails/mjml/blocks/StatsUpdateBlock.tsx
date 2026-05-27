import { MjmlColumn, MjmlSection, MjmlText } from "@faire/mjml-react";
import type { StatsUpdateBlock as StatsUpdateBlockType } from "@/lib/schemas/newsletterSection";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { EmailParagraphs } from "@/lib/emails/mjml/_brand/atoms";
import {
  escapeHtml,
  singleQuoteFontStack,
} from "@/lib/emails/mjml/_brand/html";

interface StatsUpdateBlockProps {
  block: StatsUpdateBlockType;
}

export default function StatsUpdateBlock({ block }: StatsUpdateBlockProps) {
  const hasRanking = Boolean(block.rankingCurrent || block.rankingChange);
  const monoFont = singleQuoteFontStack(fonts.mono);

  const rankingHtml = hasRanking
    ? `
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background-color:${palette.surface};margin-bottom:12px;">
      <tr>
        ${
          block.rankingCurrent
            ? `<td style="padding:10px 14px;vertical-align:baseline;color:${palette.panelDark};font-family:${monoFont};font-size:22px;font-weight:700;">${escapeHtml(block.rankingCurrent)}</td>`
            : ""
        }
        ${
          block.rankingChange
            ? `<td style="padding:10px 14px 10px 0;vertical-align:baseline;color:${palette.textMuted};font-family:${monoFont};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">${escapeHtml(block.rankingChange)}</td>`
            : ""
        }
      </tr>
    </table>
  `
    : "";

  return (
    <MjmlSection
      backgroundColor={palette.panel}
      cssClass="force-light-bg"
      padding="0 32px 16px"
    >
      <MjmlColumn padding="0">
        <MjmlText
          color={palette.textMuted}
          fontFamily={fonts.mono}
          fontSize="10px"
          letterSpacing="0.18em"
          textTransform="uppercase"
          padding="0 0 10px"
        >
          Ranking &amp; stats
        </MjmlText>
        {hasRanking ? (
          <MjmlText padding="0">
            <span dangerouslySetInnerHTML={{ __html: rankingHtml }} />
          </MjmlText>
        ) : null}
        <EmailParagraphs paragraphs={splitParagraphs(block.body)} />
      </MjmlColumn>
    </MjmlSection>
  );
}
