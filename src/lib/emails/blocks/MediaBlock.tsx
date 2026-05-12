import { Img, Link, Section, Text } from "@react-email/components";
import type { MediaBlock as MediaBlockType } from "@/lib/schemas/newsletterSection";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import { parseYouTubeId } from "@/lib/newsletter/youtube";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { EmailParagraphs } from "@/lib/emails/_brand/atoms";

export interface MediaBlockEmailMessages {
  watchOnYoutube: string;
  watch: string;
}

const DEFAULT_MESSAGES: MediaBlockEmailMessages = {
  watchOnYoutube: "Watch on YouTube",
  watch: "Watch",
};

interface MediaBlockProps {
  media: MediaBlockType;
  messages?: MediaBlockEmailMessages;
}

export default function MediaBlock({
  media,
  messages = DEFAULT_MESSAGES,
}: MediaBlockProps) {
  if (media.kind === "text") {
    return (
      <Section style={{ marginBottom: 16 }}>
        <EmailParagraphs paragraphs={splitParagraphs(media.body)} />
      </Section>
    );
  }

  if (media.kind === "image") {
    return (
      <Section style={{ marginBottom: 16 }}>
        <Img
          src={media.url}
          alt={media.alt ?? ""}
          width="536"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            borderRadius: 8,
          }}
        />
      </Section>
    );
  }

  if (media.kind === "video") {
    const youtubeId = parseYouTubeId(media.url);
    const isYouTube = youtubeId !== null;
    // Derive a YouTube poster when the editor didn't set one explicitly.
    // hqdefault (480x360) is the safest size — exists for every video and
    // sits well in the 536px email width.
    const poster =
      media.thumbnailUrl ??
      (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null);
    return (
      <Section style={{ marginBottom: 16 }}>
        <Link
          href={media.url}
          className="force-dark-bg"
          style={{
            display: "block",
            backgroundColor: palette.panelDark,
            borderRadius: 8,
            overflow: "hidden",
            textDecoration: "none",
            padding: poster ? 0 : "32px 16px",
            textAlign: "center",
          }}
        >
          {poster ? (
            <Img
              src={poster}
              alt={isYouTube ? messages.watchOnYoutube : messages.watch}
              width="536"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
              }}
            />
          ) : null}
          <Text
            style={{
              margin: poster ? "12px 0 0" : 0,
              color: palette.accent,
              fontFamily: fonts.mono,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            ▶ {isYouTube ? messages.watchOnYoutube : messages.watch}
          </Text>
        </Link>
      </Section>
    );
  }

  // audio
  const meta = [media.location, media.durationLabel].filter(Boolean).join(" · ");
  return (
    <Section style={{ marginBottom: 16 }}>
      <Link
        href={media.url}
        className="force-light-bg force-light-fg"
        style={{
          display: "block",
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 8,
          padding: "12px 14px",
          textDecoration: "none",
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
              <td style={{ width: 44, verticalAlign: "middle" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: palette.panelDark,
                    color: palette.accent,
                    textAlign: "center",
                    lineHeight: "36px",
                    fontSize: 14,
                    fontFamily: fonts.mono,
                  }}
                >
                  ▶
                </div>
              </td>
              <td style={{ verticalAlign: "middle", paddingLeft: 12 }}>
                {media.title ? (
                  <Text
                    style={{
                      margin: 0,
                      color: palette.panelDark,
                      fontFamily: fonts.sans,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {media.title}
                  </Text>
                ) : null}
                {meta ? (
                  <Text
                    style={{
                      margin: "4px 0 0",
                      color: palette.textMuted,
                      fontFamily: fonts.mono,
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                    }}
                  >
                    {meta}
                  </Text>
                ) : null}
              </td>
            </tr>
          </tbody>
        </table>
      </Link>
    </Section>
  );
}
