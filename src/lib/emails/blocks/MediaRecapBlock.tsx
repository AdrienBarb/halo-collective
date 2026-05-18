import { Section, Text } from "@react-email/components";
import type { MediaRecapBlock as MediaRecapBlockType } from "@/lib/schemas/newsletterSection";
import {
  getNewsletterLabels,
  type NewsletterLocale,
} from "@/lib/newsletter/labels";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import MediaLinkRow from "@/lib/emails/blocks/MediaLinkRow";

interface MediaRecapBlockProps {
  block: MediaRecapBlockType;
  locale: NewsletterLocale;
}

export default function MediaRecapBlock({
  block,
  locale,
}: MediaRecapBlockProps) {
  return (
    <Section style={{ marginBottom: 16 }}>
      <MediaLinkGroupHeader locale={locale} />
      {block.links.map((link, i) => (
        <MediaLinkRow key={i} link={link} />
      ))}
    </Section>
  );
}

export function MediaLinkGroupHeader({ locale }: { locale: NewsletterLocale }) {
  const labels = getNewsletterLabels(locale);

  return (
    <Text
      style={{
        margin: "0 0 4px",
        color: palette.textMuted,
        fontFamily: fonts.mono,
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      {labels.mediaRecap.header}
    </Text>
  );
}
