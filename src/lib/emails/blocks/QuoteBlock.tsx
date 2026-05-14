import { Section, Text } from "@react-email/components";
import type { QuoteBlock as QuoteBlockType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface QuoteBlockProps {
  block: QuoteBlockType;
}

// Outlook desktop (Word renderer) drops CSS borders on <table>/<td>, so
// the left bar is rendered as its own 3px-wide cell instead of a CSS
// border. Same pattern as MJML's mj-divider — works in Outlook, Gmail,
// Apple Mail.
export default function QuoteBlock({ block }: QuoteBlockProps) {
  return (
    <Section style={{ marginTop: 16 }}>
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        width="100%"
        style={{ borderCollapse: "collapse" }}
      >
        <tbody>
          <tr>
            <td
              width={3}
              style={{
                width: 3,
                backgroundColor: palette.accent,
                lineHeight: "1px",
                fontSize: 0,
              }}
            >
              &nbsp;
            </td>
            <td style={{ paddingLeft: 18, verticalAlign: "top" }}>
              {block.attribution ? (
                <Text
                  style={{
                    margin: "0 0 10px",
                    paddingBottom: 10,
                    borderBottom: `1px solid ${palette.borderSoft}`,
                    color: palette.textMuted,
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                  }}
                >
                  {block.attribution}
                </Text>
              ) : null}
              <Text
                style={{
                  margin: 0,
                  color: palette.panelDark,
                  fontFamily: fonts.serif,
                  fontSize: 17,
                  fontStyle: "italic",
                  lineHeight: 1.55,
                }}
              >
                {`"${block.text}"`}
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}
