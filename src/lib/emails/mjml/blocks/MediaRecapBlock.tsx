import { Fragment } from "react";
import { MjmlColumn, MjmlSection, MjmlText } from "@faire/mjml-react";
import type { MediaRecapBlock as MediaRecapBlockType } from "@/lib/schemas/newsletterSection";
import {
  getNewsletterLabels,
  type NewsletterLocale,
} from "@/lib/newsletter/labels";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import MediaLinkRow from "@/lib/emails/mjml/blocks/MediaLinkRow";

interface MediaRecapBlockProps {
  block: MediaRecapBlockType;
  locale: NewsletterLocale;
}

export default function MediaRecapBlock({
  block,
  locale,
}: MediaRecapBlockProps) {
  if (block.links.length === 0) return null;
  return (
    <Fragment>
      <MediaLinkGroupHeader locale={locale} />
      {block.links.map((link, i) => (
        <MediaLinkRow key={i} link={link} />
      ))}
    </Fragment>
  );
}

export function MediaLinkGroupHeader({ locale }: { locale: NewsletterLocale }) {
  const labels = getNewsletterLabels(locale);

  return (
    <MjmlSection
      backgroundColor={palette.panel}
      cssClass="force-light-bg"
      padding="0 32px 4px"
    >
      <MjmlColumn padding="0">
        <MjmlText
          color={palette.textMuted}
          fontFamily={fonts.mono}
          fontSize="10px"
          letterSpacing="0.18em"
          textTransform="uppercase"
          padding="0"
        >
          {labels.mediaRecap.header}
        </MjmlText>
      </MjmlColumn>
    </MjmlSection>
  );
}
