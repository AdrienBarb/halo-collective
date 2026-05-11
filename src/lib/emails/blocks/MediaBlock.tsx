import { Img, Link, Section, Text } from "@react-email/components";
import type { MediaBlock as MediaBlockType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface MediaBlockProps {
  media: MediaBlockType;
}

export default function MediaBlock({ media }: MediaBlockProps) {
  if (media.kind === "video") {
    return (
      <Section style={{ marginBottom: 16 }}>
        <Link
          href={media.videoUrl}
          style={{
            display: "block",
            backgroundColor: palette.ink,
            borderRadius: 8,
            overflow: "hidden",
            textDecoration: "none",
            padding: media.thumbnailUrl ? 0 : "32px 16px",
            textAlign: "center",
          }}
        >
          {media.thumbnailUrl ? (
            <Img
              src={media.thumbnailUrl}
              alt=""
              width="536"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                objectFit: "cover",
              }}
            />
          ) : null}
          <Text
            style={{
              margin: media.thumbnailUrl ? "12px 0 0" : 0,
              color: palette.accentWarm,
              fontFamily: fonts.mono,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            ▶ Watch
          </Text>
        </Link>
      </Section>
    );
  }

  return (
    <Section style={{ marginBottom: 16 }}>
      <Link
        href={media.audioUrl}
        style={{
          display: "block",
          backgroundColor: palette.cream,
          border: `1px solid ${palette.line}`,
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
                    backgroundColor: palette.ink,
                    color: palette.accentWarm,
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
                <Text
                  style={{
                    margin: 0,
                    color: palette.ink,
                    fontFamily: fonts.sans,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {media.title}
                </Text>
                <Text
                  style={{
                    margin: "4px 0 0",
                    color: palette.ink3,
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  {media.location} · {media.durationLabel}
                </Text>
              </td>
            </tr>
          </tbody>
        </table>
      </Link>
    </Section>
  );
}
