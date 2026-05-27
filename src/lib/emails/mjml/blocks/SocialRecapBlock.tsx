import { MjmlColumn, MjmlSection, MjmlText } from "@faire/mjml-react";
import type { SocialRecapBlock as SocialRecapBlockType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { safeHttpUrl } from "@/lib/emails/mjml/_brand/url";
import {
  escapeHtml,
  singleQuoteFontStack,
} from "@/lib/emails/mjml/_brand/html";

interface SocialRecapBlockProps {
  block: SocialRecapBlockType;
}

export default function SocialRecapBlock({ block }: SocialRecapBlockProps) {
  if (block.posts.length === 0) return null;
  const sansFont = singleQuoteFontStack(fonts.sans);
  const monoFont = singleQuoteFontStack(fonts.mono);

  const postsHtml = block.posts
    .map((post) => {
      const safeUrl = escapeHtml(safeHttpUrl(post.url));
      const caption = post.caption ? escapeHtml(post.caption) : null;
      const urlText = escapeHtml(post.url);
      return `
        <a href="${safeUrl}" style="display:block;background-color:${palette.surface};border:1px solid ${palette.border};border-radius:6px;padding:10px 12px;margin-top:8px;text-decoration:none;">
          ${
            caption
              ? `<div style="margin:0;color:${palette.panelDark};font-family:${sansFont};font-size:14px;">${caption}</div>`
              : ""
          }
          <div style="margin:${caption ? "4px 0 0" : "0"};color:${palette.accent};font-family:${monoFont};font-size:10px;letter-spacing:0.12em;text-transform:uppercase;">${urlText} →</div>
        </a>
      `;
    })
    .join("");

  return (
    <MjmlSection
      backgroundColor={palette.panel}
      cssClass="force-light-bg"
      padding="0 32px 16px"
    >
      <MjmlColumn padding="0">
        <MjmlText
          color={palette.textMuted}
          fontFamily={fonts.mono}
          fontSize="10px"
          letterSpacing="0.18em"
          textTransform="uppercase"
          padding="0 0 10px"
        >
          Social recap
        </MjmlText>
        <MjmlText padding="0">
          <span dangerouslySetInnerHTML={{ __html: postsHtml }} />
        </MjmlText>
      </MjmlColumn>
    </MjmlSection>
  );
}
