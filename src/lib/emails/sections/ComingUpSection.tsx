import { Section } from "@react-email/components";
import type { ComingUpBlock } from "@/lib/schemas/newsletterSection";
import CtaBlock from "@/lib/emails/blocks/CtaBlock";
import MediaBlock from "@/lib/emails/blocks/MediaBlock";
import ScheduleItemBlock from "@/lib/emails/blocks/ScheduleItemBlock";

interface ComingUpSectionProps {
  blocks: ComingUpBlock[];
}

// Group adjacent schedule items so they stack with shared borders.
function isSchedule(b: ComingUpBlock): b is Extract<ComingUpBlock, { kind: "schedule_item" }> {
  return b.kind === "schedule_item";
}

export default function ComingUpSection({ blocks }: ComingUpSectionProps) {
  const nodes: React.ReactNode[] = [];
  let scheduleBuffer: Array<Extract<ComingUpBlock, { kind: "schedule_item" }>> = [];

  const flushSchedule = () => {
    if (scheduleBuffer.length === 0) return;
    const buf = scheduleBuffer;
    nodes.push(
      <Section key={`sched-${nodes.length}`}>
        {buf.map((item, i) => (
          <ScheduleItemBlock
            key={i}
            item={item}
            isLast={i === buf.length - 1}
          />
        ))}
      </Section>,
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
        nodes.push(<MediaBlock key={nodes.length} media={block} />);
        break;
      case "cta":
        nodes.push(<CtaBlock key={nodes.length} block={block} />);
        break;
    }
  }
  flushSchedule();

  return <Section>{nodes}</Section>;
}
