import { Section } from "@react-email/components";
import type { DebriefContent } from "@/lib/schemas/newsletterSection";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import { EmailParagraphs } from "@/lib/emails/_brand/atoms";
import MediaBlock from "@/lib/emails/blocks/MediaBlock";
import PullQuote from "@/lib/emails/blocks/PullQuote";

interface DebriefSectionProps {
  content: DebriefContent;
}

export default function DebriefSection({ content }: DebriefSectionProps) {
  return (
    <Section>
      {content.media ? <MediaBlock media={content.media} /> : null}
      <EmailParagraphs paragraphs={splitParagraphs(content.body)} />
      {content.pullQuote ? <PullQuote quote={content.pullQuote} /> : null}
    </Section>
  );
}
