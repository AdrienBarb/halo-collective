import { Section, Text } from "@react-email/components";
import type { PollOption as PollOptionType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface PollOptionProps {
  option: PollOptionType;
}

export default function PollOption({ option }: PollOptionProps) {
  const isHighlighted = option.isHighlighted;

  return (
    <Section
      style={{
        backgroundColor: isHighlighted ? palette.cream2 : palette.cream,
        border: `1px solid ${isHighlighted ? palette.accentGold : palette.line}`,
        padding: "10px 14px",
        marginTop: 8,
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
            <td style={{ width: 24, verticalAlign: "middle" }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  border: `2px solid ${palette.line2}`,
                  backgroundColor: "transparent",
                }}
              />
            </td>
            <td style={{ verticalAlign: "middle", paddingLeft: 8 }}>
              <Text
                style={{
                  margin: 0,
                  color: isHighlighted ? palette.ink : palette.ink2,
                  fontFamily: fonts.sans,
                  fontSize: 14,
                  fontWeight: isHighlighted ? 600 : 400,
                }}
              >
                {option.emoji ? (
                  <span style={{ marginRight: 8 }}>{option.emoji}</span>
                ) : null}
                {option.label}
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}
