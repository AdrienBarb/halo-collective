import { MjmlColumn, MjmlSection } from "@faire/mjml-react";
import type { CtaBlock as CtaBlockType } from "@/lib/schemas/newsletterSection";
import { palette } from "@/lib/emails/_brand/theme";
import { EmailCtaButton } from "@/lib/emails/mjml/_brand/atoms";
import { safeHttpUrl } from "@/lib/emails/mjml/_brand/url";

interface CtaBlockProps {
  block: CtaBlockType;
}

export default function CtaBlock({ block }: CtaBlockProps) {
  return (
    <MjmlSection
      backgroundColor={palette.panel}
      cssClass="force-light-bg"
      padding="16px 32px 0"
    >
      <MjmlColumn padding="0">
        <EmailCtaButton href={safeHttpUrl(block.url)}>
          {block.label}
        </EmailCtaButton>
      </MjmlColumn>
    </MjmlSection>
  );
}
