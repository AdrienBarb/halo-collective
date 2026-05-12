import { Section, Text } from "@react-email/components";
import type { StatsUpdateBlock as StatsUpdateBlockType } from "@/lib/schemas/newsletterSection";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { EmailParagraphs } from "@/lib/emails/_brand/atoms";

interface StatsUpdateBlockProps {
  block: StatsUpdateBlockType;
}

export default function StatsUpdateBlock({ block }: StatsUpdateBlockProps) {
  const hasRanking = block.rankingCurrent || block.rankingChange;
  return (
    <Section style={{ marginBottom: 16 }}>
      <Text
        style={{
          margin: "0 0 10px",
          color: palette.textMuted,
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        Ranking & stats
      </Text>
      {hasRanking ? (
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          style={{
            borderCollapse: "collapse",
            backgroundColor: palette.surface,
            padding: 0,
            marginBottom: 12,
          }}
        >
          <tbody>
            <tr>
              {block.rankingCurrent ? (
                <td style={{ padding: "10px 14px", verticalAlign: "baseline" }}>
                  <Text
                    style={{
                      margin: 0,
                      color: palette.panelDark,
                      fontFamily: fonts.mono,
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    {block.rankingCurrent}
                  </Text>
                </td>
              ) : null}
              {block.rankingChange ? (
                <td style={{ padding: "10px 14px 10px 0", verticalAlign: "baseline" }}>
                  <Text
                    style={{
                      margin: 0,
                      color: palette.textMuted,
                      fontFamily: fonts.mono,
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    {block.rankingChange}
                  </Text>
                </td>
              ) : null}
            </tr>
          </tbody>
        </table>
      ) : null}
      <EmailParagraphs paragraphs={splitParagraphs(block.body)} />
    </Section>
  );
}
