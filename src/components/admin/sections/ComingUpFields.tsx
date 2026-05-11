"use client";

import type { ComingUpBlock } from "@/lib/schemas/newsletterSection";
import BlockList from "@/components/admin/sections/BlockList";
import BlockPicker from "@/components/admin/sections/BlockPicker";
import MediaBlockInput from "@/components/admin/sections/MediaBlockInput";
import { TextField } from "@/components/admin/sections/FormAtoms";
import { emptyComingUpBlock } from "@/components/admin/sections/blockDefaults";

interface ComingUpFieldsProps {
  blocks: ComingUpBlock[];
  onChange: (next: ComingUpBlock[]) => void;
}

const KIND_LABELS: Record<ComingUpBlock["kind"], string> = {
  text: "Text",
  image: "Image",
  audio: "Voice note",
  video: "Video",
  schedule_item: "Schedule item",
  cta: "CTA button",
};

const OPTIONS = (Object.keys(KIND_LABELS) as Array<ComingUpBlock["kind"]>).map(
  (kind) => ({ kind, label: KIND_LABELS[kind] }),
);

export default function ComingUpFields({
  blocks,
  onChange,
}: ComingUpFieldsProps) {
  function handleAdd(kind: ComingUpBlock["kind"]) {
    onChange([...blocks, emptyComingUpBlock(kind)]);
  }

  return (
    <div className="space-y-4">
      <BlockPicker options={OPTIONS} onAdd={handleAdd} sectionLabel="Coming up" />
      <BlockList
        items={blocks}
        onChange={onChange}
        kindLabel={(b) => KIND_LABELS[b.kind]}
        renderItem={(block, set) => {
          if (block.kind === "schedule_item") {
            return (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <TextField
                  label="Date range"
                  placeholder="Apr 15–22"
                  value={block.dateRange}
                  onChange={(v) => set({ ...block, dateRange: v })}
                />
                <TextField
                  label="Title"
                  placeholder="Barcelona Open"
                  value={block.title}
                  onChange={(v) => set({ ...block, title: v })}
                />
                <TextField
                  label="Description"
                  placeholder="Main draw, R1 Tuesday"
                  value={block.description}
                  onChange={(v) => set({ ...block, description: v })}
                />
              </div>
            );
          }
          if (block.kind === "cta") {
            return (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <TextField
                  label="Label"
                  placeholder="Get the draw"
                  value={block.label}
                  onChange={(v) => set({ ...block, label: v })}
                />
                <TextField
                  label="URL"
                  placeholder="https://…"
                  type="url"
                  value={block.url}
                  onChange={(v) => set({ ...block, url: v })}
                />
              </div>
            );
          }
          return (
            <MediaBlockInput
              value={block}
              onChange={(next) => {
                if (next) set(next as ComingUpBlock);
              }}
              required
              label="Content"
            />
          );
        }}
      />
    </div>
  );
}
