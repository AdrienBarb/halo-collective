import type { MonetisationBlock } from "@/lib/schemas/newsletterSection";
import type { NewsletterLocale } from "@/lib/newsletter/labels";
import MonetisationItemBlock from "@/lib/emails/mjml/blocks/MonetisationItemBlock";
import PhaseTimelineBlock from "@/lib/emails/mjml/blocks/PhaseTimelineBlock";

interface MonetisationSectionProps {
  blocks: MonetisationBlock[];
  locale: NewsletterLocale;
}

export default function MonetisationSection({
  blocks,
  locale,
}: MonetisationSectionProps) {
  return (
    <>
      {blocks.map((block) =>
        block.kind === "phase_timeline" ? (
          <PhaseTimelineBlock key={block.id} block={block} />
        ) : (
          <MonetisationItemBlock
            key={block.id}
            block={block}
            locale={locale}
          />
        ),
      )}
    </>
  );
}
