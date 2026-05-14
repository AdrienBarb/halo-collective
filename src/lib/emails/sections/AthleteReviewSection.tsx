import { Section } from "@react-email/components";
import type { AthleteReviewBlock } from "@/lib/schemas/newsletterSection";
import MediaBlock from "@/lib/emails/blocks/MediaBlock";
import QuoteBlock from "@/lib/emails/blocks/QuoteBlock";

interface AthleteReviewSectionProps {
  blocks: AthleteReviewBlock[];
}

export default function AthleteReviewSection({ blocks }: AthleteReviewSectionProps) {
  return (
    <Section>
      {blocks.map((block, i) =>
        block.kind === "quote" ? (
          <QuoteBlock key={i} block={block} />
        ) : (
          <MediaBlock key={i} media={block} />
        ),
      )}
    </Section>
  );
}
