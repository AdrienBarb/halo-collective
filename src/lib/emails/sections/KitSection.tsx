import { Img, Section } from "@react-email/components";
import type { KitContent } from "@/lib/schemas/newsletterSection";
import { EmailCtaButton, EmailParagraphs } from "@/lib/emails/_brand/atoms";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";

interface KitSectionProps {
  content: KitContent;
}

export default function KitSection({ content }: KitSectionProps) {
  return (
    <Section>
      {content.imageUrl ? (
        <Img
          src={content.imageUrl}
          alt=""
          width="536"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            borderRadius: 6,
            marginBottom: 16,
          }}
        />
      ) : null}

      <EmailParagraphs paragraphs={splitParagraphs(content.body)} />

      {content.cta && content.cta.url ? (
        <Section style={{ marginTop: 20 }}>
          <EmailCtaButton href={content.cta.url}>
            {content.cta.label} →
          </EmailCtaButton>
        </Section>
      ) : null}
    </Section>
  );
}
