import { Section } from "@react-email/components";
import type { MonetisationBlock } from "@/lib/schemas/newsletterSection";
import MonetisationItemBlock from "@/lib/emails/blocks/MonetisationItemBlock";

interface MonetisationSectionProps {
  blocks: MonetisationBlock[];
}

export default function MonetisationSection({ blocks }: MonetisationSectionProps) {
  return (
    <Section>
      {blocks.map((block) => (
        <MonetisationItemBlock key={block.id} block={block} />
      ))}
    </Section>
  );
}
