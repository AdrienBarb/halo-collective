"use client";

import type {
  AthleteReviewBlock,
  MediaBlock,
} from "@/lib/schemas/newsletterSection";
import BlockList from "@/components/admin/sections/BlockList";
import BlockPicker from "@/components/admin/sections/BlockPicker";
import MediaBlockInput from "@/components/admin/sections/MediaBlockInput";
import { emptyAthleteReviewBlock } from "@/components/admin/sections/blockDefaults";

interface AthleteReviewFieldsProps {
  blocks: AthleteReviewBlock[];
  onChange: (next: AthleteReviewBlock[]) => void;
}

const KIND_LABELS: Record<MediaBlock["kind"], string> = {
  text: "Text",
  image: "Image",
  audio: "Voice note",
  video: "Video",
};

const OPTIONS = (Object.keys(KIND_LABELS) as Array<MediaBlock["kind"]>).map(
  (kind) => ({ kind, label: KIND_LABELS[kind] }),
);

export default function AthleteReviewFields({
  blocks,
  onChange,
}: AthleteReviewFieldsProps) {
  function handleAdd(kind: MediaBlock["kind"]) {
    onChange([...blocks, emptyAthleteReviewBlock(kind)]);
  }

  return (
    <div className="space-y-4">
      <BlockPicker options={OPTIONS} onAdd={handleAdd} sectionLabel="Athlete review" />
      <BlockList
        items={blocks}
        onChange={onChange}
        kindLabel={(b) => KIND_LABELS[b.kind]}
        renderItem={(block, set) => (
          <MediaBlockInput
            value={block}
            onChange={(next) => {
              if (next) set(next as AthleteReviewBlock);
            }}
            required
            label="Content"
          />
        )}
      />
    </div>
  );
}
