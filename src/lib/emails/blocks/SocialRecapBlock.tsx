import { Link, Section, Text } from "@react-email/components";
import type { SocialRecapBlock as SocialRecapBlockType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface SocialRecapBlockProps {
  block: SocialRecapBlockType;
}

export default function SocialRecapBlock({ block }: SocialRecapBlockProps) {
  return (
    <Section style={{ marginBottom: 16 }}>
      <Text
        style={{
          margin: "0 0 10px",
          color: palette.textMuted,
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        Social recap
      </Text>
      {block.posts.map((post, i) => (
        <Link
          key={i}
          href={post.url}
          style={{
            display: "block",
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
            borderRadius: 6,
            padding: "10px 12px",
            marginTop: 8,
            textDecoration: "none",
          }}
        >
          {post.caption ? (
            <Text
              style={{
                margin: 0,
                color: palette.panelDark,
                fontFamily: fonts.sans,
                fontSize: 14,
              }}
            >
              {post.caption}
            </Text>
          ) : null}
          <Text
            style={{
              margin: post.caption ? "4px 0 0" : 0,
              color: palette.accent,
              fontFamily: fonts.mono,
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {post.url} →
          </Text>
        </Link>
      ))}
    </Section>
  );
}
