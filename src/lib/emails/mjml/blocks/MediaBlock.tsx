import {
  MjmlColumn,
  MjmlImage,
  MjmlSection,
  MjmlText,
} from "@faire/mjml-react";
import type { MediaBlock as MediaBlockType } from "@/lib/schemas/newsletterSection";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import { parseYouTubeId } from "@/lib/newsletter/youtube";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { EmailParagraphs } from "@/lib/emails/mjml/_brand/atoms";
import { safeHttpUrl } from "@/lib/emails/mjml/_brand/url";
import {
  escapeHtml,
  singleQuoteFontStack,
} from "@/lib/emails/mjml/_brand/html";

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
      <MjmlSection
        backgroundColor={palette.panel}
        cssClass="force-light-bg"
        padding="0 32px 16px"
      >
        <MjmlColumn padding="0">
          <EmailParagraphs paragraphs={splitParagraphs(media.body)} />
        </MjmlColumn>
      </MjmlSection>
    );
  }

  if (media.kind === "image") {
    return (
      <MjmlSection
        backgroundColor={palette.panel}
        cssClass="force-light-bg"
        padding="0 32px 16px"
      >
        <MjmlColumn padding="0">
          <MjmlImage
            src={media.url}
            alt={media.alt ?? ""}
            width="536px"
            borderRadius="8px"
            padding="0"
          />
        </MjmlColumn>
      </MjmlSection>
    );
  }

  if (media.kind === "video") {
    const youtubeId = parseYouTubeId(media.url);
    const isYouTube = youtubeId !== null;
    // hqdefault (480x360) exists for every video and sits well in the 536px email width.
    const poster =
      media.thumbnailUrl ??
      (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null);
    const label = isYouTube ? messages.watchOnYoutube : messages.watch;
    const safeUrl = safeHttpUrl(media.url);

    return (
      <MjmlSection
        backgroundColor={palette.panel}
        cssClass="force-light-bg"
        padding="0 32px 16px"
      >
        <MjmlColumn padding="0">
          {poster ? (
            <MjmlImage
              src={poster}
              alt={label}
              href={safeUrl}
              width="536px"
              borderRadius="8px 8px 0 0"
              padding="0"
            />
          ) : null}
          <MjmlText
            backgroundColor={palette.panelDark}
            cssClass="force-dark-bg"
            color={palette.accent}
            fontFamily={fonts.mono}
            fontSize="13px"
            fontWeight="700"
            letterSpacing="0.18em"
            textTransform="uppercase"
            align="center"
            padding={poster ? "12px 16px" : "32px 16px"}
          >
            <a
              href={safeUrl}
              style={{
                color: palette.accent,
                textDecoration: "none",
              }}
            >
              ▶ {label}
            </a>
          </MjmlText>
        </MjmlColumn>
      </MjmlSection>
    );
  }

  // audio
  const monoFont = singleQuoteFontStack(fonts.mono);
  const sansFont = singleQuoteFontStack(fonts.sans);
  const meta = [media.location, media.durationLabel]
    .filter((s): s is string => Boolean(s))
    .map(escapeHtml)
    .join(" · ");
  const titleHtml = media.title ? escapeHtml(media.title) : null;
  const rowHtml = `
    <a href="${escapeHtml(safeHttpUrl(media.url))}" style="display:block;background-color:${palette.surface};border:1px solid ${palette.border};border-radius:8px;padding:12px 14px;text-decoration:none;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:44px;vertical-align:middle;">
            <div style="width:36px;height:36px;line-height:36px;border-radius:18px;background-color:${palette.panelDark};color:${palette.accent};text-align:center;font-family:${monoFont};font-size:14px;">▶</div>
          </td>
          <td style="vertical-align:middle;padding-left:12px;">
            ${
              titleHtml
                ? `<div style="margin:0;color:${palette.panelDark};font-family:${sansFont};font-size:14px;font-weight:600;">${titleHtml}</div>`
                : ""
            }
            ${
              meta
                ? `<div style="margin:4px 0 0;color:${palette.textMuted};font-family:${monoFont};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;">${meta}</div>`
                : ""
            }
          </td>
        </tr>
      </table>
    </a>
  `;

  return (
    <MjmlSection
      backgroundColor={palette.panel}
      cssClass="force-light-bg"
      padding="0 32px 16px"
    >
      <MjmlColumn padding="0">
        <MjmlText padding="0">
          <span dangerouslySetInnerHTML={{ __html: rowHtml }} />
        </MjmlText>
      </MjmlColumn>
    </MjmlSection>
  );
}
