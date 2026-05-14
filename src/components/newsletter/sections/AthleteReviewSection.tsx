import type { AthleteReviewBlock } from "@/lib/schemas/newsletterSection";
import MediaBlock from "@/components/newsletter/blocks/MediaBlock";
import QuoteBlock from "@/components/newsletter/blocks/QuoteBlock";

interface AthleteReviewSectionProps {
  blocks: AthleteReviewBlock[];
}

export default function AthleteReviewSection({ blocks }: AthleteReviewSectionProps) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) =>
        block.kind === "quote" ? (
          <QuoteBlock key={i} block={block} />
        ) : (
          <MediaBlock key={i} media={block} />
        ),
      )}
    </div>
  );
}
