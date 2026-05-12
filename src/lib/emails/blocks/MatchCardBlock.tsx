import { Link, Section, Text } from "@react-email/components";
import type { MatchCardBlock as MatchCardBlockType } from "@/lib/schemas/newsletterSection";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import { parseYouTubeId } from "@/lib/newsletter/youtube";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface MatchCardBlockProps {
  match: MatchCardBlockType;
}

const RESULT_STYLES: Record<
  MatchCardBlockType["result"],
  { background: string; color: string; letter: string }
> = {
  W: { background: palette.accent, color: palette.surface, letter: "W" },
  L: { background: palette.loss, color: palette.surface, letter: "L" },
  BYE: { background: palette.panelMuted, color: palette.textMuted, letter: "—" },
  EXEMPT: { background: palette.panelMuted, color: palette.textMuted, letter: "—" },
};

export default function MatchCardBlock({ match }: MatchCardBlockProps) {
  const style = RESULT_STYLES[match.result];
  const showOpponent =
    match.opponentName && match.result !== "BYE" && match.result !== "EXEMPT";
  const labels = getNewsletterLabels();
  const isYouTube = parseYouTubeId(match.highlightUrl) !== null;
  const highlightsLabel = isYouTube
    ? labels.ctas.watchOnYoutube
    : labels.ctas.highlights;

  return (
    <Section
      style={{
        borderBottom: `1px solid ${palette.border}`,
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
                          color: palette.panelDark,
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
                                  color: palette.textMuted,
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
                    color: palette.textBody,
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
                    backgroundColor: palette.panelMuted,
                    color: palette.textMuted,
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
                  color: palette.textMuted,
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
                    backgroundColor: palette.panelDark,
                    color: palette.accent,
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
            color: palette.textBody,
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
