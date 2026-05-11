import { Section, Text } from "@react-email/components";
import type { MediaRecapBlock as MediaRecapBlockType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import MediaLinkRow from "@/lib/emails/blocks/MediaLinkRow";

interface MediaRecapBlockProps {
  block: MediaRecapBlockType;
}

export default function MediaRecapBlock({ block }: MediaRecapBlockProps) {
  return (
    <Section style={{ marginBottom: 16 }}>
      <MediaLinkGroupHeader />
      {block.links.map((link, i) => (
        <MediaLinkRow key={i} link={link} />
      ))}
    </Section>
  );
}

export function MediaLinkGroupHeader() {
  return (
    <Text
      style={{
        margin: "0 0 4px",
        color: palette.ink3,
        fontFamily: fonts.mono,
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      What they wrote
    </Text>
  );
}
