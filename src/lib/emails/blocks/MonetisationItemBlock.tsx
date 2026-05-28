import { Section, Text } from "@react-email/components";
import type { MonetisationBlock } from "@/lib/schemas/newsletterSection";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { EmailCtaButton, EmailParagraphs } from "@/lib/emails/_brand/atoms";
import MediaBlock from "@/lib/emails/blocks/MediaBlock";

// The email row renderer handles commerce blocks only; phase_timeline is
// rendered upstream via PhaseTimelineBlock and never reaches this component.
type CommercialBlock = Exclude<MonetisationBlock, { kind: "phase_timeline" }>;

interface MonetisationItemBlockProps {
  block: CommercialBlock;
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
}: MonetisationItemBlockProps) {
  const labels = getNewsletterLabels();
  const eyebrow = labels.monetisationEyebrows[block.kind];
  const extra = kindExtra(block);

  return (
    <Section
      style={{
        borderBottom: `1px solid ${palette.border}`,
        paddingBottom: 24,
        marginBottom: 24,
      }}
    >
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <tbody>
          <tr>
            <td style={{ verticalAlign: "middle" }}>
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
            </td>
            {extra ? (
              <td
                style={{
                  width: 1,
                  verticalAlign: "middle",
                  whiteSpace: "nowrap",
                  paddingLeft: 12,
                }}
              >
                <Text
                  style={{
                    margin: 0,
                    color: palette.textMuted,
                    fontFamily: fonts.sans,
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {extra}
                </Text>
              </td>
            ) : null}
          </tr>
        </tbody>
      </table>

      {block.media ? <MediaBlock media={block.media} /> : null}

      <Text
        style={{
          margin: "12px 0 0",
          color: palette.panelDark,
          fontFamily: fonts.sans,
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        {block.title}
      </Text>

      <EmailParagraphs paragraphs={splitParagraphs(block.body)} />

      <Section style={{ marginTop: 14 }}>
        <EmailCtaButton href={block.cta.url}>{block.cta.label}</EmailCtaButton>
      </Section>
    </Section>
  );
}
