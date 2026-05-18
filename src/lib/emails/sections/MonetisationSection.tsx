import { Section } from "@react-email/components";
import type { MonetisationBlock } from "@/lib/schemas/newsletterSection";
import MonetisationItemBlock from "@/lib/emails/blocks/MonetisationItemBlock";
import PhaseTimelineBlock from "@/lib/emails/blocks/PhaseTimelineBlock";

interface MonetisationSectionProps {
  blocks: MonetisationBlock[];
}

export default function MonetisationSection({ blocks }: MonetisationSectionProps) {
  return (
    <Section>
      {blocks.map((block) =>
        block.kind === "phase_timeline" ? (
          <PhaseTimelineBlock key={block.id} block={block} />
        ) : (
          <MonetisationItemBlock key={block.id} block={block} />
        ),
      )}
    </Section>
  );
}
