import { Link, Section, Text } from "@react-email/components";
import type { DebriefSection } from "@prisma/client";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface EmailDebriefProps {
  section: DebriefSection;
  editionUrl: string;
}

function splitParagraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function EmailDebrief({ section, editionUrl }: EmailDebriefProps) {
  const paragraphs = splitParagraphs(section.body);
  const hasVoiceNote = !!section.voiceNoteUrl;

  return (
    <>
      {hasVoiceNote ? (
        <Section
          style={{
            marginTop: 24,
            padding: 20,
            borderRadius: 12,
            backgroundColor: palette.cream2,
            border: `1px solid ${palette.line}`,
          }}
        >
          {section.voiceNoteLabel ? (
            <Text
              style={{
                margin: 0,
                color: palette.ink3,
                fontFamily: fonts.mono,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              {section.voiceNoteLabel}
            </Text>
          ) : null}
          <Text
            style={{
              margin: section.voiceNoteLabel ? "12px 0 0" : 0,
              color: palette.ink2,
              fontFamily: fonts.sans,
              fontSize: 15,
              lineHeight: 1.6,
            }}
          >
            🎙{" "}
            <Link
              href={editionUrl}
              style={{ color: palette.ink, textDecoration: "underline" }}
            >
              Listen on the web
            </Link>
            {section.voiceNoteDurationSec
              ? ` · ${formatDuration(section.voiceNoteDurationSec)}`
              : ""}
          </Text>
          {section.voiceNoteLocation ? (
            <Text
              style={{
                margin: "8px 0 0",
                color: palette.ink3,
                fontFamily: fonts.mono,
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              {section.voiceNoteLocation}
            </Text>
          ) : null}
        </Section>
      ) : null}

      <Section style={{ marginTop: 24 }}>
        {paragraphs.map((p, i) => (
          <Text
            key={i}
            style={{
              margin: i === 0 ? 0 : "16px 0 0",
              color: palette.ink2,
              fontFamily: fonts.sans,
              fontSize: 16,
              lineHeight: 1.65,
            }}
          >
            {p}
          </Text>
        ))}
      </Section>

      {section.pullQuote ? (
        <Section
          style={{
            marginTop: 28,
            paddingLeft: 20,
            borderLeft: `2px solid ${palette.accentGold}`,
          }}
        >
          <Text
            style={{
              margin: 0,
              color: palette.ink,
              fontFamily: fonts.serif,
              fontSize: 22,
              fontStyle: "italic",
              lineHeight: 1.35,
            }}
          >
            “{section.pullQuote}”
          </Text>
          {section.pullQuoteContext ? (
            <Text
              style={{
                margin: "12px 0 0",
                color: palette.ink3,
                fontFamily: fonts.mono,
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              {section.pullQuoteContext}
            </Text>
          ) : null}
        </Section>
      ) : null}
    </>
  );
}
