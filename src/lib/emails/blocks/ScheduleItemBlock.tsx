import { Section, Text } from "@react-email/components";
import type { ScheduleItemBlock as ScheduleItemBlockType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface ScheduleItemBlockProps {
  item: ScheduleItemBlockType;
  isLast: boolean;
}

export default function ScheduleItemBlock({ item, isLast }: ScheduleItemBlockProps) {
  return (
    <Section
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
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {item.dateRange}
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
                {item.title}
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
                {item.description}
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}
