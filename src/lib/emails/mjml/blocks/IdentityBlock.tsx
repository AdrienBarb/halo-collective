import {
  MjmlColumn,
  MjmlGroup,
  MjmlImage,
  MjmlSection,
  MjmlText,
} from "@faire/mjml-react";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { safeHttpUrl } from "@/lib/emails/mjml/_brand/url";
import type { Locale } from "@/i18n/locales";

export interface IdentityBlockSponsor {
  name: string;
  logoUrl: string;
  websiteUrl: string;
}

interface IdentityBlockMessages {
  worldAtp: string;
  careerTitles: string;
  myPartners: string;
  member: string;
}

interface IdentityBlockProps {
  editionNumber: number;
  editionDate?: Date | string | null;
  subtitle?: string | null;
  tournamentName?: string | null;
  tournamentLogoUrl?: string | null;
  athleteName: string;
  countryName?: string | null;
  worldRank?: number | null;
  titlesCount?: number | null;
  sponsors?: IdentityBlockSponsor[];
  locale: Locale;
  messages: IdentityBlockMessages;
}

// UTC pin defends against off-by-one days when the server's timezone
// differs from local dev (Vercel functions default to UTC).
function formatIssueDate(
  d: Date | string | null | undefined,
  locale: Locale,
): string | null {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return date
    .toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}

function isValidRank(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 1 && n <= 10000;
}
function isValidTitles(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 1 && n <= 999;
}

export default function IdentityBlock({
  editionNumber,
  editionDate,
  subtitle,
  tournamentName,
  tournamentLogoUrl,
  athleteName,
  countryName,
  worldRank,
  titlesCount,
  sponsors = [],
  locale,
  messages,
}: IdentityBlockProps) {
  const issueNumber = `#${editionNumber.toString().padStart(2, "0")}`;
  const issueDate = formatIssueDate(editionDate, locale);
  const issueLine = issueDate ? `${issueNumber} · ${issueDate}` : issueNumber;

  const subLineParts: string[] = [];
  if (isValidRank(worldRank)) {
    subLineParts.push(`${messages.worldAtp} No. ${worldRank}`);
  }
  if (countryName) subLineParts.push(countryName);
  const subLine = subLineParts.join(" · ").toUpperCase();

  const showRankLeft = isValidRank(worldRank);
  const showRankRight = isValidTitles(titlesCount);
  const showRankRow = showRankLeft || showRankRight;

  return (
    <>
      <MjmlSection
        backgroundColor={palette.panel}
        cssClass="force-light-bg"
        padding="0 32px"
        borderBottom={`1px solid ${palette.border}`}
      >
        <MjmlColumn verticalAlign="middle" padding="0">
          <MjmlText
            color={palette.textMuted}
            fontFamily={fonts.sans}
            fontSize="9px"
            letterSpacing="2.5px"
            textTransform="uppercase"
            padding="16px 0 14px"
          >
            {issueLine}
          </MjmlText>
        </MjmlColumn>
        <MjmlColumn verticalAlign="middle" padding="0">
          <MjmlText align="right" padding="16px 0 14px">
            <span
              style={{
                display: "inline-block",
                fontFamily: fonts.sans,
                fontSize: "8px",
                color: palette.textOnDark,
                backgroundColor: palette.panelDark,
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontWeight: 700,
                padding: "5px 11px",
              }}
            >
              {messages.member}
            </span>
          </MjmlText>
        </MjmlColumn>
      </MjmlSection>

      {subtitle ? (
        <MjmlSection
          backgroundColor={palette.panel}
          cssClass="force-light-bg"
          padding="18px 32px 6px"
        >
          {tournamentLogoUrl ? (
            <MjmlColumn width="46px" verticalAlign="middle" padding="0">
              <MjmlImage
                src={safeHttpUrl(tournamentLogoUrl)}
                alt={tournamentName ?? ""}
                width="36px"
                height="36px"
                padding="0 10px 0 0"
                align="left"
              />
            </MjmlColumn>
          ) : null}
          <MjmlColumn verticalAlign="middle" padding="0">
            <MjmlText
              color={palette.textMuted}
              fontFamily={fonts.sans}
              fontSize="10px"
              letterSpacing="3px"
              textTransform="uppercase"
              padding="0"
            >
              {subtitle}
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
      ) : null}

      <MjmlSection
        backgroundColor={palette.panel}
        cssClass="force-light-bg"
        padding="0 32px"
      >
        <MjmlColumn padding="0">
          <MjmlText
            cssClass="hero-name"
            color={palette.textPrimary}
            fontFamily={fonts.display}
            fontSize="36px"
            fontWeight="900"
            lineHeight="1.1"
            letterSpacing="-1px"
            textTransform="uppercase"
            padding="0 0 6px"
          >
            {athleteName}
          </MjmlText>
          {subLine ? (
            <MjmlText
              color={palette.accent}
              fontFamily={fonts.sans}
              fontSize="9px"
              letterSpacing="3px"
              textTransform="uppercase"
              padding="0 0 16px"
            >
              {subLine}
            </MjmlText>
          ) : null}
        </MjmlColumn>
      </MjmlSection>

      {showRankRow ? (
        <MjmlSection
          backgroundColor={palette.panel}
          cssClass="force-light-bg"
          padding="0 32px 16px"
        >
          <MjmlGroup>
            {showRankLeft ? (
              <MjmlColumn
                backgroundColor={palette.panelDark}
                cssClass="force-dark-bg"
                width={showRankRight ? "49%" : "100%"}
                padding="0"
              >
                <MjmlText align="center" padding="12px 0">
                  <span
                    style={{
                      fontFamily: fonts.display,
                      fontSize: "18px",
                      fontWeight: 900,
                      color: palette.textOnDark,
                    }}
                  >
                    #{worldRank}
                  </span>
                  <span
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: "9px",
                      color: palette.textOnDarkMuted,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      marginLeft: "8px",
                    }}
                  >
                    {messages.worldAtp}
                  </span>
                </MjmlText>
              </MjmlColumn>
            ) : null}
            {showRankLeft && showRankRight ? (
              <MjmlColumn
                width="2%"
                backgroundColor={palette.panel}
                padding="0"
              />
            ) : null}
            {showRankRight ? (
              <MjmlColumn
                backgroundColor={palette.accent}
                width={showRankLeft ? "49%" : "100%"}
                padding="0"
              >
                <MjmlText align="center" padding="12px 0">
                  <span
                    style={{
                      fontFamily: fonts.display,
                      fontSize: "18px",
                      fontWeight: 900,
                      color: palette.textOnAccent,
                    }}
                  >
                    {titlesCount}
                  </span>
                  <span
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: "9px",
                      color: palette.textPrimary,
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      marginLeft: "8px",
                    }}
                  >
                    {messages.careerTitles}
                  </span>
                </MjmlText>
              </MjmlColumn>
            ) : null}
          </MjmlGroup>
        </MjmlSection>
      ) : null}

      {sponsors.length > 0 ? (
        <>
          <MjmlSection
            backgroundColor={palette.panel}
            cssClass="force-light-bg"
            padding="16px 32px 14px"
            borderTop={`1px solid ${palette.border}`}
          >
            <MjmlColumn padding="0">
              <MjmlText
                color={palette.textMuted}
                fontFamily={fonts.sans}
                fontSize="7px"
                letterSpacing="2px"
                textTransform="uppercase"
                padding="0"
              >
                {messages.myPartners}
              </MjmlText>
            </MjmlColumn>
          </MjmlSection>

          <MjmlSection
            backgroundColor={palette.panel}
            cssClass="force-light-bg"
            padding="0 32px 24px"
            borderBottom={`1px solid ${palette.border}`}
          >
            <MjmlGroup>
              {sponsors.map((sponsor) => (
                <MjmlColumn
                  key={sponsor.name}
                  width={`${100 / sponsors.length}%`}
                  cssClass="sponsor-cell"
                  verticalAlign="middle"
                  padding="0"
                >
                  <MjmlImage
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    href={safeHttpUrl(sponsor.websiteUrl)}
                    target="_blank"
                    width="84px"
                    height="44px"
                    padding="8px 4px"
                    align="center"
                  />
                </MjmlColumn>
              ))}
            </MjmlGroup>
          </MjmlSection>
        </>
      ) : null}
    </>
  );
}
