import type { AthleteReviewBlock } from "@/lib/schemas/newsletterSection";
import {
  getNewsletterLabels,
  type NewsletterLocale,
} from "@/lib/newsletter/labels";
import MediaBlock from "@/lib/emails/mjml/blocks/MediaBlock";
import QuoteBlock from "@/lib/emails/mjml/blocks/QuoteBlock";

interface AthleteReviewSectionProps {
  blocks: AthleteReviewBlock[];
  locale: NewsletterLocale;
}

export default function AthleteReviewSection({
  blocks,
  locale,
}: AthleteReviewSectionProps) {
  const labels = getNewsletterLabels(locale);
  const messages = {
    watchOnYoutube: labels.ctas.watchOnYoutube,
    watch: labels.ctas.highlights,
  };

  return (
    <>
      {blocks.map((block, i) =>
        block.kind === "quote" ? (
          <QuoteBlock key={i} block={block} />
        ) : (
          <MediaBlock key={i} media={block} messages={messages} />
        ),
      )}
    </>
  );
}
