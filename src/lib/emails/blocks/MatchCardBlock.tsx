import { Link, Section, Text } from "@react-email/components";
import type { MatchCardBlock as MatchCardBlockType } from "@/lib/schemas/newsletterSection";
import {
  getNewsletterLabels,
  type NewsletterLocale,
} from "@/lib/newsletter/labels";
import { parseYouTubeId } from "@/lib/newsletter/youtube";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface MatchCardBlockProps {
  match: MatchCardBlockType;
  locale?: NewsletterLocale;
}

const RESULT_STYLES: Record<
  MatchCardBlockType["result"],
  { background: string; color: string }
> = {
  W: { background: palette.accent, color: palette.surface },
  L: { background: palette.loss, color: palette.surface },
  BYE: { background: palette.panelMuted, color: palette.textMuted },
  EXEMPT: { background: palette.panelMuted, color: palette.textMuted },
};

export default function MatchCardBlock({ match, locale }: MatchCardBlockProps) {
  const style = RESULT_STYLES[match.result];
  const showOpponent =
    match.opponentName && match.result !== "BYE" && match.result !== "EXEMPT";
  const labels = getNewsletterLabels(locale);
  const resultLetter =
    match.result === "W"
      ? labels.matchResultLetters.win
      : match.result === "L"
        ? labels.matchResultLetters.loss
        : "—";
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
                          fontFamily: fonts.display,
                          fontSize: 12,
                          fontWeight: 800,
                          fontStyle: "italic",
                          textAlign: "center",
                        }}
                      >
                        {resultLetter}
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
                    color: palette.textPrimary,
                    fontFamily: fonts.display,
                    fontSize: 18,
                    fontWeight: 800,
                    fontStyle: "italic",
                    letterSpacing: "-0.005em",
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
                    fontFamily: fonts.sans,
                    fontSize: 10,
                    fontWeight: 500,
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
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  fontWeight: 500,
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
                    fontFamily: fonts.display,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
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
            fontFamily: fonts.sans,
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.6,
          }}
        >
          {match.commentary}
        </Text>
      ) : null}
    </Section>
  );
}
