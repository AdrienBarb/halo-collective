import {
  MjmlColumn,
  MjmlSection,
  MjmlText,
} from "@faire/mjml-react";
import type { MatchCardBlock as MatchCardBlockType } from "@/lib/schemas/newsletterSection";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import { parseYouTubeId } from "@/lib/newsletter/youtube";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { safeHttpUrl } from "@/lib/emails/mjml/_brand/url";

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

  const monoFont = singleQuoteFontStack(fonts.mono);
  const sansFont = singleQuoteFontStack(fonts.sans);
  const headerHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="vertical-align:middle;padding-right:8px;">
          <div style="width:20px;height:20px;line-height:20px;border-radius:10px;background-color:${style.background};color:${style.color};font-family:${monoFont};font-size:10px;font-weight:700;text-align:center;">
            ${style.letter}
          </div>
        </td>
        <td style="vertical-align:middle;color:${palette.panelDark};font-family:${sansFont};font-size:14px;font-weight:700;">
          ${
            showOpponent
              ? `vs ${escapeHtml(match.opponentName ?? "")}${
                  match.opponentRank
                    ? `<span style="margin-left:8px;color:${palette.textMuted};font-weight:400;">${escapeHtml(match.opponentRank)}${
                        match.opponentCountry
                          ? ` ${escapeHtml(match.opponentCountry)}`
                          : ""
                      }</span>`
                    : ""
                }`
              : escapeHtml(match.roundName ?? "")
          }
        </td>
      </tr>
    </table>
  `;

  const metaParts: string[] = [];
  if (showOpponent && match.roundName) metaParts.push(escapeHtml(match.roundName));
  if (match.date) metaParts.push(escapeHtml(match.date));
  if (match.contextNote) metaParts.push(escapeHtml(match.contextNote));
  const metaLine = metaParts.join(" · ");

  return (
    <MjmlSection
      backgroundColor={palette.panel}
      cssClass="force-light-bg"
      padding="16px 32px"
      borderBottom={`1px solid ${palette.border}`}
    >
      <MjmlColumn verticalAlign="top" width="100%">
        <MjmlText padding="0">
          <span dangerouslySetInnerHTML={{ __html: headerHtml }} />
        </MjmlText>

        {match.score ? (
          <MjmlText
            color={palette.textBody}
            fontFamily={fonts.mono}
            fontSize="12px"
            fontWeight="600"
            padding="6px 0 0"
          >
            {match.score}
          </MjmlText>
        ) : match.result === "BYE" || match.result === "EXEMPT" ? (
          <MjmlText padding="6px 0 0">
            <span
              style={{
                display: "inline-block",
                backgroundColor: palette.panelMuted,
                color: palette.textMuted,
                fontFamily: fonts.mono,
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "2px 6px",
              }}
            >
              {match.result}
            </span>
          </MjmlText>
        ) : null}

        {metaLine ? (
          <MjmlText
            color={palette.textMuted}
            fontFamily={fonts.mono}
            fontSize="10px"
            letterSpacing="0.12em"
            textTransform="uppercase"
            padding="6px 0 0"
          >
            <span dangerouslySetInnerHTML={{ __html: metaLine }} />
          </MjmlText>
        ) : null}

        {match.commentary ? (
          <MjmlText
            color={palette.textBody}
            fontFamily={fonts.serif}
            fontSize="14px"
            fontStyle="italic"
            lineHeight="1.6"
            padding="12px 0 0"
          >
            {match.commentary}
          </MjmlText>
        ) : null}

        {match.highlightUrl ? (
          <MjmlText padding="10px 0 0">
            <a
              href={safeHttpUrl(match.highlightUrl)}
              style={{
                display: "inline-block",
                backgroundColor: palette.panelDark,
                color: palette.accent,
                fontFamily: fonts.mono,
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: "4px",
              }}
            >
              ▶ {highlightsLabel}
            </a>
          </MjmlText>
        ) : null}
      </MjmlColumn>
    </MjmlSection>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Font stacks like `"SF Mono", Menlo, ...` contain literal double quotes
// that explode when embedded in an HTML `style="..."` attribute string.
// Switch to single quotes — both forms are valid CSS font-family syntax.
function singleQuoteFontStack(stack: string): string {
  return stack.replace(/"/g, "'");
}
