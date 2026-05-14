"use client";

import type { AthleteReviewBlock } from "@/lib/schemas/newsletterSection";
import BlockList from "@/components/admin/sections/BlockList";
import BlockPicker from "@/components/admin/sections/BlockPicker";
import MediaBlockInput from "@/components/admin/sections/MediaBlockInput";
import {
  TextareaField,
  TextField,
} from "@/components/admin/sections/FormAtoms";
import { emptyAthleteReviewBlock } from "@/components/admin/sections/blockDefaults";

interface AthleteReviewFieldsProps {
  blocks: AthleteReviewBlock[];
  onChange: (next: AthleteReviewBlock[]) => void;
}

type Kind = AthleteReviewBlock["kind"];

const KIND_LABELS: Record<Kind, string> = {
  text: "Text",
  image: "Image",
  audio: "Voice note",
  video: "Video",
  quote: "Quote",
};

const OPTIONS = (Object.keys(KIND_LABELS) as Kind[]).map((kind) => ({
  kind,
  label: KIND_LABELS[kind],
}));

export default function AthleteReviewFields({
  blocks,
  onChange,
}: AthleteReviewFieldsProps) {
  function handleAdd(kind: Kind) {
    onChange([...blocks, emptyAthleteReviewBlock(kind)]);
  }

  return (
    <div className="space-y-4">
      <BlockPicker options={OPTIONS} onAdd={handleAdd} sectionLabel="Athlete review" />
      <BlockList
        items={blocks}
        onChange={onChange}
        kindLabel={(b) => KIND_LABELS[b.kind]}
        renderItem={(block, set) => {
          if (block.kind === "quote") {
            return (
              <div className="space-y-3">
                <TextField
                  label="Context (optional)"
                  placeholder="After the match vs Alcaraz"
                  help="Shown as an uppercase label above the quote."
                  value={block.attribution ?? ""}
                  onChange={(v) => set({ ...block, attribution: v || undefined })}
                />
                <TextareaField
                  label="Quote"
                  placeholder="The line you want pulled out."
                  rows={5}
                  value={block.text}
                  onChange={(v) => set({ ...block, text: v })}
                />
              </div>
            );
          }
          return (
            <MediaBlockInput
              value={block}
              onChange={(next) => {
                if (next) set(next);
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
