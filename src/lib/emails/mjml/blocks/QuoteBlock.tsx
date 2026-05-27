import { MjmlColumn, MjmlSection, MjmlText } from "@faire/mjml-react";
import type { QuoteBlock as QuoteBlockType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import {
  escapeHtml,
  singleQuoteFontStack,
} from "@/lib/emails/mjml/_brand/html";

interface QuoteBlockProps {
  block: QuoteBlockType;
}

// Left bar rendered as its own 3px-wide cell (not a CSS border) so it
// survives Outlook's Word renderer.
export default function QuoteBlock({ block }: QuoteBlockProps) {
  const monoFont = singleQuoteFontStack(fonts.mono);
  const serifFont = singleQuoteFontStack(fonts.serif);
  const text = escapeHtml(block.text);
  const attribution = block.attribution ? escapeHtml(block.attribution) : null;

  const html = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
      <tr>
        <td width="3" style="width:3px;background-color:${palette.accent};line-height:1px;font-size:0;">&nbsp;</td>
        <td style="padding-left:18px;vertical-align:top;">
          ${
            attribution
              ? `<div style="margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid ${palette.borderSoft};color:${palette.textMuted};font-family:${monoFont};font-size:10px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;">${attribution}</div>`
              : ""
          }
          <div style="margin:0;color:${palette.panelDark};font-family:${serifFont};font-size:17px;font-style:italic;line-height:1.55;">&ldquo;${text}&rdquo;</div>
        </td>
      </tr>
    </table>
  `;

  return (
    <MjmlSection
      backgroundColor={palette.panel}
      cssClass="force-light-bg"
      padding="16px 32px 0"
    >
      <MjmlColumn padding="0">
        <MjmlText padding="0">
          <span dangerouslySetInnerHTML={{ __html: html }} />
        </MjmlText>
      </MjmlColumn>
    </MjmlSection>
  );
}
