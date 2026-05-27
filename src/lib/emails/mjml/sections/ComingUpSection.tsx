import { Fragment } from "react";
import type { ComingUpBlock } from "@/lib/schemas/newsletterSection";
import {
  getNewsletterLabels,
  type NewsletterLocale,
} from "@/lib/newsletter/labels";
import CtaBlock from "@/lib/emails/mjml/blocks/CtaBlock";
import MediaBlock from "@/lib/emails/mjml/blocks/MediaBlock";
import ScheduleItemBlock from "@/lib/emails/mjml/blocks/ScheduleItemBlock";

interface ComingUpSectionProps {
  blocks: ComingUpBlock[];
  locale: NewsletterLocale;
}

function isSchedule(
  b: ComingUpBlock,
): b is Extract<ComingUpBlock, { kind: "schedule_item" }> {
  return b.kind === "schedule_item";
}

export default function ComingUpSection({
  blocks,
  locale,
}: ComingUpSectionProps) {
  const labels = getNewsletterLabels(locale);
  const messages = {
    watchOnYoutube: labels.ctas.watchOnYoutube,
    watch: labels.ctas.highlights,
  };
  const nodes: React.ReactNode[] = [];
  let scheduleBuffer: Array<
    Extract<ComingUpBlock, { kind: "schedule_item" }>
  > = [];

  const flushSchedule = () => {
    if (scheduleBuffer.length === 0) return;
    const buf = scheduleBuffer;
    nodes.push(
      <Fragment key={`sched-${nodes.length}`}>
        {buf.map((item, i) => (
          <ScheduleItemBlock
            key={i}
            item={item}
            isLast={i === buf.length - 1}
          />
        ))}
      </Fragment>,
    );
    scheduleBuffer = [];
  };

  for (const block of blocks) {
    if (isSchedule(block)) {
      scheduleBuffer.push(block);
      continue;
    }
    flushSchedule();
    switch (block.kind) {
      case "text":
      case "image":
      case "audio":
      case "video":
        nodes.push(
          <MediaBlock key={nodes.length} media={block} messages={messages} />,
        );
        break;
      case "cta":
        nodes.push(<CtaBlock key={nodes.length} block={block} />);
        break;
    }
  }
  flushSchedule();

  return <>{nodes}</>;
}
