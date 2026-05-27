import { Fragment } from "react";
import { MjmlColumn, MjmlSection, MjmlText } from "@faire/mjml-react";
import type { MonetisationBlock } from "@/lib/schemas/newsletterSection";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import {
  getNewsletterLabels,
  type NewsletterLocale,
} from "@/lib/newsletter/labels";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import {
  EmailCtaButton,
  EmailParagraphs,
} from "@/lib/emails/mjml/_brand/atoms";
import MediaBlock from "@/lib/emails/mjml/blocks/MediaBlock";
import { safeHttpUrl } from "@/lib/emails/mjml/_brand/url";
import {
  escapeHtml,
  singleQuoteFontStack,
} from "@/lib/emails/mjml/_brand/html";

// The email row renderer handles commerce blocks only; phase_timeline is
// rendered upstream via PhaseTimelineBlock and never reaches this component.
type CommercialBlock = Exclude<MonetisationBlock, { kind: "phase_timeline" }>;

interface MonetisationItemBlockProps {
  block: CommercialBlock;
  locale: NewsletterLocale;
}

function kindExtra(block: CommercialBlock): string | null {
  switch (block.kind) {
    case "kit":
    case "athlete_product":
      return block.price ?? null;
    case "partner_content":
      return block.partnerName ?? null;
    case "donation":
      return block.goalLabel ?? null;
    case "fan_experience":
      return block.dateLabel ?? null;
    default:
      return null;
  }
}

export default function MonetisationItemBlock({
  block,
  locale,
}: MonetisationItemBlockProps) {
  const labels = getNewsletterLabels(locale);
  const eyebrow = labels.monetisationEyebrows[block.kind];
  const extra = kindExtra(block);
  const monoFont = singleQuoteFontStack(fonts.mono);

  const headerHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="vertical-align:middle;color:${palette.accent};font-family:${monoFont};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">${escapeHtml(eyebrow)}</td>
        ${
          extra
            ? `<td style="width:1px;vertical-align:middle;white-space:nowrap;padding-left:12px;color:${palette.textMuted};font-family:${monoFont};font-size:10px;letter-spacing:0.12em;text-transform:uppercase;">${escapeHtml(extra)}</td>`
            : ""
        }
      </tr>
    </table>
  `;

  return (
    <Fragment>
      <MjmlSection
        backgroundColor={palette.panel}
        cssClass="force-light-bg"
        padding="0 32px"
      >
        <MjmlColumn padding="0">
          <MjmlText padding="0">
            <span dangerouslySetInnerHTML={{ __html: headerHtml }} />
          </MjmlText>
        </MjmlColumn>
      </MjmlSection>

      {block.media ? <MediaBlock media={block.media} /> : null}

      <MjmlSection
        backgroundColor={palette.panel}
        cssClass="force-light-bg"
        padding="0 32px"
      >
        <MjmlColumn padding="0">
          <MjmlText
            color={palette.panelDark}
            fontFamily={fonts.sans}
            fontSize="16px"
            fontWeight="700"
            padding="12px 0 0"
          >
            {block.title}
          </MjmlText>
          <EmailParagraphs paragraphs={splitParagraphs(block.body)} />
          <EmailCtaButton
            href={safeHttpUrl(block.cta.url)}
            padding="14px 0 0"
          >
            {block.cta.label}
          </EmailCtaButton>
        </MjmlColumn>
      </MjmlSection>

      <MjmlSection
        backgroundColor={palette.panel}
        cssClass="force-light-bg"
        borderBottom={`1px solid ${palette.border}`}
        padding="0 32px 24px"
      >
        <MjmlColumn padding="0" />
      </MjmlSection>
    </Fragment>
  );
}
