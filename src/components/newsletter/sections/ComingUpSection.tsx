import type { ComingUpBlock } from "@/lib/schemas/newsletterSection";
import CtaBlock from "@/components/newsletter/blocks/CtaBlock";
import MediaBlock from "@/components/newsletter/blocks/MediaBlock";
import ScheduleItemBlock from "@/components/newsletter/blocks/ScheduleItemBlock";

interface ComingUpSectionProps {
  blocks: ComingUpBlock[];
}

function renderBlock(block: ComingUpBlock, key: number): React.ReactNode {
  switch (block.kind) {
    case "text":
    case "image":
    case "audio":
    case "video":
      return <MediaBlock key={key} media={block} />;
    case "schedule_item":
      return <ScheduleItemBlock key={key} item={block} />;
    case "cta":
      return <CtaBlock key={key} block={block} />;
  }
}

export default function ComingUpSection({ blocks }: ComingUpSectionProps) {
  // Schedule items collapse together with borders between rows; other
  // block kinds render with vertical spacing.
  const elements: React.ReactNode[] = [];
  let scheduleBuffer: typeof blocks = [];

  const flushSchedule = () => {
    if (scheduleBuffer.length === 0) return;
    const buf = scheduleBuffer;
    elements.push(
      <div key={`sched-${elements.length}`}>
        {buf.map((b, i) => (
          <ScheduleItemBlock
            key={i}
            item={b as Extract<ComingUpBlock, { kind: "schedule_item" }>}
          />
        ))}
      </div>,
    );
    scheduleBuffer = [];
  };

  for (const block of blocks) {
    if (block.kind === "schedule_item") {
      scheduleBuffer.push(block);
    } else {
      flushSchedule();
      elements.push(renderBlock(block, elements.length));
    }
  }
  flushSchedule();

  return <div className="space-y-5">{elements}</div>;
}
