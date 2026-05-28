import { Link, Section, Text } from "@react-email/components";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface MediaLinkRowProps {
  link: {
    source: string;
    headline: string;
    url: string;
    ctaLabel?: string;
  };
}

export default function MediaLinkRow({ link }: MediaLinkRowProps) {
  const readLabel = link.ctaLabel ?? getNewsletterLabels().ctas.read;

  return (
    <Section
      style={{
        borderBottom: `1px solid ${palette.border}`,
        padding: "12px 0",
      }}
    >
      <Link href={link.url} style={{ textDecoration: "none" }}>
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
                    color: palette.textMuted,
                    fontFamily: fonts.sans,
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {link.source}
                </Text>
                <Text
                  style={{
                    margin: "4px 0 0",
                    color: palette.panelDark,
                    fontFamily: fonts.sans,
                    fontSize: 14,
                  }}
                >
                  {link.headline}
                </Text>
              </td>
              <td
                style={{
                  width: 1,
                  verticalAlign: "middle",
                  paddingLeft: 12,
                  whiteSpace: "nowrap",
                }}
              >
                <Text
                  style={{
                    margin: 0,
                    color: palette.accent,
                    fontFamily: fonts.sans,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {readLabel} →
                </Text>
              </td>
            </tr>
          </tbody>
        </table>
      </Link>
    </Section>
  );
}
