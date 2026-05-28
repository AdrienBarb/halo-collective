import { Img, Link, Section, Text } from "@react-email/components";
import { palette, fonts } from "@/lib/emails/_brand/theme";
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
  /** Newsletter title used as the small subtitle above the athlete name. */
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

// Pinning the timezone defends against the formatter rendering an
// off-by-one day when the server runs in a non-UTC zone (Vercel
// functions default to UTC, but local dev may not).
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

// Defense in depth — the publish-time Zod schema already clamps these,
// but a stale snapshot or migrated row shouldn't ship a `#0` rank.
function isValidRank(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 1 && n <= 10000;
}
function isValidTitles(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 1 && n <= 999;
}

// ── Sub-components ─────────────────────────────────────────────────

function IssueLine({
  issueLine,
  memberLabel,
}: {
  issueLine: string;
  memberLabel: string;
}) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ borderCollapse: "collapse" }}
    >
      <tbody>
        <tr>
          <td
            style={{
              fontFamily: fonts.sans,
              fontSize: 9,
              color: palette.textMuted,
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              padding: "16px 0 14px",
              borderBottom: `1px solid ${palette.border}`,
            }}
          >
            {issueLine}
          </td>
          <td
            align="right"
            style={{
              padding: "16px 0 14px",
              borderBottom: `1px solid ${palette.border}`,
              verticalAlign: "middle",
            }}
          >
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: 8,
                color: palette.textOnDark,
                backgroundColor: palette.panelDark,
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontWeight: 700,
                padding: "5px 11px",
                display: "inline-block",
              }}
            >
              {memberLabel}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function TournamentHeader({
  tournamentName,
  tournamentLogoUrl,
  subtitle,
}: {
  tournamentName?: string | null;
  tournamentLogoUrl?: string | null;
  subtitle: string;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ paddingTop: 18, marginBottom: 6 }}
    >
      <tbody>
        <tr>
          {tournamentLogoUrl ? (
            <td style={{ paddingRight: 10, verticalAlign: "middle" }}>
              <Img
                src={tournamentLogoUrl}
                alt={tournamentName ?? ""}
                width="36"
                height="36"
                style={{ width: 36, height: 36, display: "block" }}
              />
            </td>
          ) : null}
          <td style={{ verticalAlign: "middle" }}>
            <Text
              style={{
                margin: 0,
                fontFamily: fonts.sans,
                fontSize: 10,
                color: palette.textMuted,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              {subtitle}
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function AthleteName({
  athleteName,
  subLine,
}: {
  athleteName: string;
  subLine: string;
}) {
  return (
    <>
      <Text
        className="hero-name"
        style={{
          margin: "0 0 6px",
          fontFamily: fonts.display,
          fontSize: 38,
          fontWeight: 800,
          fontStyle: "italic",
          color: palette.textPrimary,
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
        }}
      >
        {athleteName}
      </Text>
      {subLine ? (
        <Text
          style={{
            margin: "0 0 16px",
            fontFamily: fonts.sans,
            fontSize: 9,
            color: palette.accent,
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          {subLine}
        </Text>
      ) : null}
    </>
  );
}

function RankTiles({
  worldRank,
  titlesCount,
  messages,
}: {
  worldRank: number | null | undefined;
  titlesCount: number | null | undefined;
  messages: Pick<IdentityBlockMessages, "worldAtp" | "careerTitles">;
}) {
  const showLeft = isValidRank(worldRank);
  const showRight = isValidTitles(titlesCount);
  if (!showLeft && !showRight) return null;

  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ marginBottom: 16, borderCollapse: "collapse" }}
    >
      <tbody>
        <tr>
          {showLeft ? (
            <td
              width={showRight ? "49%" : "100%"}
              className="force-dark-bg"
              style={{
                backgroundColor: palette.panelDark,
                padding: "12px 0",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontFamily: fonts.display,
                  fontSize: 20,
                  fontWeight: 800,
                  fontStyle: "italic",
                  color: palette.textOnDark,
                }}
              >
                #{worldRank}
              </span>
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 9,
                  color: palette.textOnDarkMuted,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginLeft: 8,
                }}
              >
                {messages.worldAtp}
              </span>
            </td>
          ) : null}
          {showLeft && showRight ? (
            <td
              width="2%"
              style={{ fontSize: 0, backgroundColor: palette.panel }}
            >
              &nbsp;
            </td>
          ) : null}
          {showRight ? (
            <td
              width={showLeft ? "49%" : "100%"}
              style={{
                backgroundColor: palette.accent,
                padding: "12px 0",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontFamily: fonts.display,
                  fontSize: 20,
                  fontWeight: 800,
                  fontStyle: "italic",
                  color: palette.textOnAccent,
                }}
              >
                {titlesCount}
              </span>
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 9,
                  // Navy on teal = 6.4:1 (AA) — the muted-on-teal pair we tried
                  // earlier was 1.9:1 and unreadable for low-vision readers
                  // and deuteranopes.
                  color: palette.textPrimary,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginLeft: 8,
                }}
              >
                {messages.careerTitles}
              </span>
            </td>
          ) : null}
        </tr>
      </tbody>
    </table>
  );
}

function SponsorCell({ sponsor }: { sponsor: IdentityBlockSponsor }) {
  // Defense in depth — the publish-time Zod schema already rejects
  // non-https, but a stale row shouldn't ship `javascript:` either.
  const safeHref = /^https?:\/\//i.test(sponsor.websiteUrl)
    ? sponsor.websiteUrl
    : "#";
  return (
    <td
      className="sponsor-cell"
      align="center"
      valign="middle"
      style={{ padding: "0 12px" }}
    >
      <Link
        href={safeHref}
        target="_blank"
        style={{
          display: "block",
          padding: "8px 4px",
          textDecoration: "none",
        }}
      >
        <Img
          src={sponsor.logoUrl}
          alt={sponsor.name}
          width="84"
          height="44"
          // No objectFit — Outlook desktop ignores it and stretches images.
          // Logos must be normalized to a consistent aspect ratio at upload
          // time (or padded as transparent PNGs).
          style={{
            maxWidth: 84,
            height: 44,
            display: "block",
            margin: "0 auto",
          }}
        />
      </Link>
    </td>
  );
}

function SponsorDivider() {
  return (
    <td
      width="1"
      style={{
        fontSize: 0,
        backgroundColor: palette.border,
      }}
    >
      &nbsp;
    </td>
  );
}

function SponsorsStrip({
  sponsors,
  label,
}: {
  sponsors: IdentityBlockSponsor[];
  label: string;
}) {
  if (sponsors.length === 0) return null;
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{
        marginBottom: 24,
        borderTop: `1px solid ${palette.border}`,
        borderBottom: `1px solid ${palette.border}`,
        borderCollapse: "collapse",
      }}
    >
      <tbody>
        <tr>
          <td
            align="left"
            colSpan={Math.max(1, sponsors.length * 2 - 1)}
            style={{
              fontFamily: fonts.sans,
              fontSize: 7,
              color: palette.textMuted,
              letterSpacing: "2px",
              textTransform: "uppercase",
              paddingTop: 16,
              paddingBottom: 14,
            }}
          >
            {label}
          </td>
        </tr>
        <tr>
          {sponsors.flatMap((s, i) =>
            i === 0
              ? [<SponsorCell key={`s-${i}`} sponsor={s} />]
              : [
                  <SponsorDivider key={`d-${i}`} />,
                  <SponsorCell key={`s-${i}`} sponsor={s} />,
                ],
          )}
        </tr>
      </tbody>
    </table>
  );
}

// ── Main ──────────────────────────────────────────────────────────

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

  return (
    <Section
      className="force-light-bg force-light-fg"
      style={{ backgroundColor: palette.panel, padding: "0 32px" }}
    >
      <IssueLine issueLine={issueLine} memberLabel={messages.member} />
      {subtitle ? (
        <TournamentHeader
          tournamentName={tournamentName}
          tournamentLogoUrl={tournamentLogoUrl}
          subtitle={subtitle}
        />
      ) : null}
      <AthleteName athleteName={athleteName} subLine={subLine} />
      <RankTiles
        worldRank={worldRank}
        titlesCount={titlesCount}
        messages={messages}
      />
      <SponsorsStrip sponsors={sponsors} label={messages.myPartners} />
    </Section>
  );
}
