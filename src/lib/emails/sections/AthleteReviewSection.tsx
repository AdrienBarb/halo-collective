import { Section } from "@react-email/components";
import type { AthleteReviewBlock } from "@/lib/schemas/newsletterSection";
import MediaBlock from "@/lib/emails/blocks/MediaBlock";

interface AthleteReviewSectionProps {
  blocks: AthleteReviewBlock[];
}

export default function AthleteReviewSection({ blocks }: AthleteReviewSectionProps) {
  return (
    <Section>
      {blocks.map((block, i) => (
        <MediaBlock key={i} media={block} />
      ))}
    </Section>
  );
}
