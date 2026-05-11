import type { MonetisationBlock } from "@/lib/schemas/newsletterSection";
import MonetisationItemBlock from "@/components/newsletter/blocks/MonetisationItemBlock";

interface MonetisationSectionProps {
  blocks: MonetisationBlock[];
}

export default function MonetisationSection({ blocks }: MonetisationSectionProps) {
  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <MonetisationItemBlock key={block.id} block={block} />
      ))}
    </div>
  );
}
