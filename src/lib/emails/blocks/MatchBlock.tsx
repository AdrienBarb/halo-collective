import { Link, Section, Text } from "@react-email/components";
import type { MatchBlock as MatchBlockType } from "@/lib/schemas/newsletterSection";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface MatchBlockProps {
  match: MatchBlockType;
}

const RESULT_STYLES: Record<
  MatchBlockType["result"],
  { background: string; color: string; letter: string }
> = {
  W: { background: palette.accentGold, color: palette.cream, letter: "W" },
  L: { background: palette.loss, color: palette.cream, letter: "L" },
  BYE: { background: palette.cream3, color: palette.ink3, letter: "—" },
  EXEMPT: { background: palette.cream3, color: palette.ink3, letter: "—" },
};

export default function MatchBlock({ match }: MatchBlockProps) {
  const style = RESULT_STYLES[match.result];
  const showOpponent =
    match.opponentName && match.result !== "BYE" && match.result !== "EXEMPT";
  const highlightsLabel = getNewsletterLabels().ctas.highlights;

  return (
    <Section
      style={{
        borderBottom: `1px solid ${palette.line}`,
        padding: "16px 0",
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
            <td style={{ verticalAlign: "top" }}>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse" }}
              >
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: "middle", paddingRight: 8 }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          lineHeight: "20px",
                          borderRadius: 10,
                          backgroundColor: style.background,
                          color: style.color,
                          fontFamily: fonts.mono,
                          fontSize: 10,
                          fontWeight: 700,
                          textAlign: "center",
                        }}
                      >
                        {style.letter}
                      </div>
                    </td>
                    <td style={{ verticalAlign: "middle" }}>
                      <Text
                        style={{
                          margin: 0,
                          color: palette.ink,
                          fontFamily: fonts.sans,
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        {showOpponent ? (
                          <>
                            vs {match.opponentName}
                            {match.opponentRank ? (
                              <span
                                style={{
                                  marginLeft: 8,
                                  color: palette.ink3,
                                  fontWeight: 400,
                                }}
                              >
                                {match.opponentRank}
                                {match.opponentCountry
                                  ? ` ${match.opponentCountry}`
                                  : ""}
                              </span>
                            ) : null}
                          </>
                        ) : (
                          match.roundName
                        )}
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>

              {match.score ? (
                <Text
                  style={{
                    margin: "6px 0 0",
                    color: palette.ink2,
                    fontFamily: fonts.mono,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {match.score}
                </Text>
              ) : match.result === "BYE" || match.result === "EXEMPT" ? (
                <Text
                  style={{
                    margin: "6px 0 0",
                    display: "inline-block",
                    backgroundColor: palette.cream3,
                    color: palette.ink3,
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "2px 6px",
                  }}
                >
                  {match.result}
                </Text>
              ) : null}

              <Text
                style={{
                  margin: "6px 0 0",
                  color: palette.ink3,
                  fontFamily: fonts.mono,
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {showOpponent ? match.roundName : null}
                {showOpponent && match.date ? " · " : null}
                {match.date}
                {match.contextNote ? ` · ${match.contextNote}` : null}
              </Text>
            </td>

            {match.highlightUrl ? (
              <td
                style={{
                  width: 1,
                  verticalAlign: "top",
                  paddingLeft: 12,
                  whiteSpace: "nowrap",
                }}
              >
                <Link
                  href={match.highlightUrl}
                  style={{
                    display: "inline-block",
                    backgroundColor: palette.ink,
                    color: palette.accentWarm,
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: 4,
                  }}
                >
                  ▶ {highlightsLabel}
                </Link>
              </td>
            ) : null}
          </tr>
        </tbody>
      </table>

      {match.commentary ? (
        <Text
          style={{
            margin: "12px 0 0",
            color: palette.ink2,
            fontFamily: fonts.serif,
            fontSize: 14,
            fontStyle: "italic",
            lineHeight: 1.6,
          }}
        >
          {match.commentary}
        </Text>
      ) : null}
    </Section>
  );
}
