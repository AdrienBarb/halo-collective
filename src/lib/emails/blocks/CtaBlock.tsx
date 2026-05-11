import { Section } from "@react-email/components";
import type { CtaBlock as CtaBlockType } from "@/lib/schemas/newsletterSection";
import { EmailCtaButton } from "@/lib/emails/_brand/atoms";

interface CtaBlockProps {
  block: CtaBlockType;
}

export default function CtaBlock({ block }: CtaBlockProps) {
  return (
    <Section style={{ marginTop: 16 }}>
      <EmailCtaButton href={block.url}>{block.label}</EmailCtaButton>
    </Section>
  );
}
