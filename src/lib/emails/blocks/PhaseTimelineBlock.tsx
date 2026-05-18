import { Section, Text } from "@react-email/components";
import type { PhaseTimelineBlock as PhaseTimelineBlockType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface PhaseTimelineBlockProps {
  block: PhaseTimelineBlockType;
}

export default function PhaseTimelineBlock({ block }: PhaseTimelineBlockProps) {
  return (
    <Section style={{ marginBottom: 24 }}>
      {block.phases.map((phase, i) => {
        const isLast = i === block.phases.length - 1;
        return (
          <Section
            key={i}
            style={{
              borderTop: `1px solid ${palette.border}`,
              borderBottom: isLast ? `1px solid ${palette.border}` : undefined,
              padding: "12px 0",
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
                  <td style={{ width: 90, verticalAlign: "top", paddingTop: 2 }}>
                    <Text
                      style={{
                        margin: 0,
                        color: palette.accent,
                        fontFamily: fonts.mono,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                      }}
                    >
                      {phase.label}
                    </Text>
                  </td>
                  <td style={{ verticalAlign: "top", paddingLeft: 12 }}>
                    <Text
                      style={{
                        margin: 0,
                        color: palette.panelDark,
                        fontFamily: fonts.sans,
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {phase.title}
                    </Text>
                    <Text
                      style={{
                        margin: "4px 0 0",
                        color: palette.textMuted,
                        fontFamily: fonts.sans,
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      {phase.description}
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>
        );
      })}
    </Section>
  );
}
