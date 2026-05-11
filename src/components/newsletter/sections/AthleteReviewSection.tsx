import type { AthleteReviewBlock } from "@/lib/schemas/newsletterSection";
import MediaBlock from "@/components/newsletter/blocks/MediaBlock";

interface AthleteReviewSectionProps {
  blocks: AthleteReviewBlock[];
}

export default function AthleteReviewSection({ blocks }: AthleteReviewSectionProps) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => (
        <MediaBlock key={i} media={block} />
      ))}
    </div>
  );
}
