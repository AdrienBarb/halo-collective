import { Fragment } from "react";
import { MjmlColumn, MjmlSection, MjmlText } from "@faire/mjml-react";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { EmailParagraphs } from "@/lib/emails/mjml/_brand/atoms";
import MediaBlock from "@/lib/emails/mjml/blocks/MediaBlock";
import type { MediaBlock as MediaBlockType } from "@/lib/schemas/newsletterSection";

interface TextUpdateBlockProps {
  eyebrow: string;
  body: string;
  media?: MediaBlockType;
}

// Shared shell for training_update / recovery_travel_update / throwback.
export default function TextUpdateBlock({
  eyebrow,
  body,
  media,
}: TextUpdateBlockProps) {
  return (
    <Fragment>
      <MjmlSection
        backgroundColor={palette.panel}
        cssClass="force-light-bg"
        padding="0 32px 10px"
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
            {eyebrow}
          </MjmlText>
        </MjmlColumn>
      </MjmlSection>
      {media ? <MediaBlock media={media} /> : null}
      <MjmlSection
        backgroundColor={palette.panel}
        cssClass="force-light-bg"
        padding="0 32px 16px"
      >
        <MjmlColumn padding="0">
          <EmailParagraphs paragraphs={splitParagraphs(body)} />
        </MjmlColumn>
      </MjmlSection>
    </Fragment>
  );
}
