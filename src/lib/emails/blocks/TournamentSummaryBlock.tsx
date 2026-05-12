import { Img, Section, Text } from "@react-email/components";
import type { TournamentSummaryBlock as TournamentSummaryBlockType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface TournamentSummaryBlockProps {
  summary: TournamentSummaryBlockType;
}

export default function TournamentSummaryBlock({
  summary,
}: TournamentSummaryBlockProps) {
  const meta = [
    summary.category,
    summary.location,
    summary.surface,
    summary.dateRange,
  ].filter(Boolean);

  return (
    <Section
      style={{
        borderBottom: `1px solid ${palette.border}`,
        paddingBottom: 16,
        marginBottom: 16,
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
            {summary.logoUrl ? (
              <td style={{ width: 64, verticalAlign: "middle", paddingRight: 12 }}>
                <Img
                  src={summary.logoUrl}
                  alt=""
                  width="56"
                  height="56"
                  style={{
                    display: "block",
                    width: 56,
                    height: 56,
                    borderRadius: 4,
                  }}
                />
              </td>
            ) : null}
            <td style={{ verticalAlign: "middle" }}>
              <Text
                style={{
                  margin: 0,
                  color: palette.panelDark,
                  fontFamily: fonts.sans,
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {summary.name}
              </Text>
              {meta.length > 0 ? (
                <Text
                  style={{
                    margin: "4px 0 0",
                    color: palette.textMuted,
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {meta.join(" · ")}
                </Text>
              ) : null}
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}
