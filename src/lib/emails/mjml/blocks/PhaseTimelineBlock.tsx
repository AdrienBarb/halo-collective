import { Fragment } from "react";
import { MjmlColumn, MjmlSection, MjmlText } from "@faire/mjml-react";
import type { PhaseTimelineBlock as PhaseTimelineBlockType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import {
  escapeHtml,
  singleQuoteFontStack,
} from "@/lib/emails/mjml/_brand/html";

interface PhaseTimelineBlockProps {
  block: PhaseTimelineBlockType;
}

export default function PhaseTimelineBlock({ block }: PhaseTimelineBlockProps) {
  const monoFont = singleQuoteFontStack(fonts.mono);
  const sansFont = singleQuoteFontStack(fonts.sans);

  return (
    <Fragment>
      {block.phases.map((phase, i) => {
        const isLast = i === block.phases.length - 1;
        const label = escapeHtml(phase.label);
        const title = escapeHtml(phase.title);
        const description = phase.description
          ? escapeHtml(phase.description)
          : null;

        const html = `
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="width:90px;vertical-align:top;padding-top:2px;">
                <div style="margin:0;color:${palette.accent};font-family:${monoFont};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">${label}</div>
              </td>
              <td style="vertical-align:top;padding-left:12px;">
                <div style="margin:0;color:${palette.panelDark};font-family:${sansFont};font-size:14px;font-weight:700;">${title}</div>
                ${
                  description
                    ? `<div style="margin:4px 0 0;color:${palette.textMuted};font-family:${sansFont};font-size:13px;line-height:1.5;">${description}</div>`
                    : ""
                }
              </td>
            </tr>
          </table>
        `;

        return (
          <MjmlSection
            key={i}
            backgroundColor={palette.panel}
            cssClass="force-light-bg"
            borderTop={`1px solid ${palette.border}`}
            borderBottom={isLast ? `1px solid ${palette.border}` : undefined}
            padding="12px 32px"
          >
            <MjmlColumn padding="0">
              <MjmlText padding="0">
                <span dangerouslySetInnerHTML={{ __html: html }} />
              </MjmlText>
            </MjmlColumn>
          </MjmlSection>
        );
      })}
    </Fragment>
  );
}
