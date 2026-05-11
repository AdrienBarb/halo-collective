"use client";

import type { FanEngagementBlock } from "@/lib/schemas/newsletterSection";
import BlockList from "@/components/admin/sections/BlockList";
import BlockPicker from "@/components/admin/sections/BlockPicker";
import MediaBlockInput from "@/components/admin/sections/MediaBlockInput";
import Repeater from "@/components/admin/sections/Repeater";
import {
  TextareaField,
  TextField,
} from "@/components/admin/sections/FormAtoms";
import { emptyFanEngagementBlock } from "@/components/admin/sections/blockDefaults";

interface FanEngagementFieldsProps {
  blocks: FanEngagementBlock[];
  onChange: (next: FanEngagementBlock[]) => void;
}

const KIND_LABELS: Record<FanEngagementBlock["kind"], string> = {
  poll: "Poll",
  prediction: "Prediction",
  quiz: "Quiz",
  prize_draw: "Prize draw",
  qa: "Ask me anything",
  survey: "Survey",
  challenge: "Challenge",
};

const OPTIONS = (
  Object.keys(KIND_LABELS) as Array<FanEngagementBlock["kind"]>
).map((kind) => ({ kind, label: KIND_LABELS[kind] }));

export default function FanEngagementFields({
  blocks,
  onChange,
}: FanEngagementFieldsProps) {
  function handleAdd(kind: FanEngagementBlock["kind"]) {
    onChange([...blocks, emptyFanEngagementBlock(kind)]);
  }

  return (
    <div className="space-y-4">
      <BlockPicker options={OPTIONS} onAdd={handleAdd} sectionLabel="Fan engagement" />
      <BlockList
        items={blocks}
        onChange={onChange}
        kindLabel={(b) => KIND_LABELS[b.kind]}
        renderItem={(block, set) => renderBlockEditor(block, set)}
      />
    </div>
  );
}

function renderBlockEditor(
  block: FanEngagementBlock,
  set: (next: FanEngagementBlock) => void,
): React.ReactNode {
  switch (block.kind) {
    case "poll":
      return (
        <div className="space-y-3">
          <TextField
            label="Question"
            placeholder="How far do you think I'll go next week?"
            value={block.question}
            onChange={(v) => set({ ...block, question: v })}
          />
          <Repeater
            label="Options"
            items={block.options}
            empty={{ label: "", emoji: undefined, isHighlighted: false }}
            onChange={(next) => set({ ...block, options: next })}
            addLabel="Option"
            render={(opt, setOpt) => (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <TextField
                  label="Label"
                  placeholder="R32"
                  value={opt.label}
                  onChange={(v) => setOpt({ ...opt, label: v })}
                />
                <TextField
                  label="Emoji (optional)"
                  placeholder="🎾"
                  value={opt.emoji ?? ""}
                  onChange={(v) => setOpt({ ...opt, emoji: v || undefined })}
                />
                <label className="flex items-end gap-2 pb-2 text-xs text-ink-2">
                  <input
                    type="checkbox"
                    checked={opt.isHighlighted}
                    onChange={(e) =>
                      setOpt({ ...opt, isHighlighted: e.target.checked })
                    }
                  />
                  Highlight
                </label>
              </div>
            )}
          />
          <TextField
            label="Closes at (optional)"
            placeholder="Sunday 8pm"
            value={block.closesAt ?? ""}
            onChange={(v) => set({ ...block, closesAt: v || undefined })}
          />
        </div>
      );

    case "prediction":
      return (
        <div className="space-y-3">
          <TextField
            label="Prompt"
            placeholder="Guess my Barcelona result"
            value={block.prompt}
            onChange={(v) => set({ ...block, prompt: v })}
          />
          <Repeater
            label="Options (optional)"
            items={block.options}
            empty={{ label: "", emoji: undefined, isHighlighted: false }}
            onChange={(next) => set({ ...block, options: next })}
            addLabel="Option"
            render={(opt, setOpt) => (
              <TextField
                label="Label"
                placeholder="QF or better"
                value={opt.label}
                onChange={(v) => setOpt({ ...opt, label: v })}
              />
            )}
          />
          <TextField
            label="Closes at (optional)"
            value={block.closesAt ?? ""}
            onChange={(v) => set({ ...block, closesAt: v || undefined })}
          />
        </div>
      );

    case "quiz":
      return (
        <div className="space-y-3">
          <TextField
            label="Question"
            placeholder="Which surface have I won the most matches on?"
            value={block.question}
            onChange={(v) => set({ ...block, question: v })}
          />
          <Repeater
            label="Options"
            items={block.options}
            empty={{ label: "", isCorrect: false }}
            onChange={(next) => set({ ...block, options: next })}
            addLabel="Option"
            render={(opt, setOpt) => (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <TextField
                  label="Label"
                  value={opt.label}
                  onChange={(v) => setOpt({ ...opt, label: v })}
                />
                <label className="flex items-end gap-2 pb-2 text-xs text-ink-2">
                  <input
                    type="checkbox"
                    checked={opt.isCorrect}
                    onChange={(e) =>
                      setOpt({ ...opt, isCorrect: e.target.checked })
                    }
                  />
                  Correct answer
                </label>
              </div>
            )}
          />
          <TextField
            label="Closes at (optional)"
            value={block.closesAt ?? ""}
            onChange={(v) => set({ ...block, closesAt: v || undefined })}
          />
        </div>
      );

    case "prize_draw":
      return (
        <div className="space-y-3">
          <TextField
            label="Title"
            placeholder="Win a signed match-worn shirt"
            value={block.title}
            onChange={(v) => set({ ...block, title: v })}
          />
          <TextareaField
            label="Body (optional)"
            rows={3}
            value={block.body ?? ""}
            onChange={(v) => set({ ...block, body: v || undefined })}
          />
          <MediaBlockInput
            value={block.prizeMedia}
            onChange={(next) => set({ ...block, prizeMedia: next })}
            label="Prize media (optional)"
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField
              label="CTA label (optional)"
              placeholder="Enter the draw"
              value={block.ctaLabel ?? ""}
              onChange={(v) => set({ ...block, ctaLabel: v || undefined })}
            />
            <TextField
              label="Closes at (optional)"
              value={block.closesAt ?? ""}
              onChange={(v) => set({ ...block, closesAt: v || undefined })}
            />
          </div>
        </div>
      );

    case "qa":
      return (
        <div className="space-y-3">
          <TextField
            label="Prompt"
            placeholder="Ask me a question for next week's issue"
            value={block.prompt}
            onChange={(v) => set({ ...block, prompt: v })}
          />
          <TextField
            label="Intro (optional)"
            placeholder="I read every one."
            value={block.intro ?? ""}
            onChange={(v) => set({ ...block, intro: v || undefined })}
          />
          <TextField
            label="Reassurance line (optional)"
            placeholder="I'll pick 3 and answer them next week."
            value={block.reassurance ?? ""}
            onChange={(v) =>
              set({ ...block, reassurance: v || undefined })
            }
          />
        </div>
      );

    case "survey":
      return (
        <div className="space-y-3">
          <TextField
            label="Title"
            value={block.title}
            onChange={(v) => set({ ...block, title: v })}
          />
          <TextareaField
            label="Body (optional)"
            rows={3}
            value={block.body ?? ""}
            onChange={(v) => set({ ...block, body: v || undefined })}
          />
          <TextField
            label="External survey URL (optional)"
            placeholder="https://forms.example.com/…"
            type="url"
            value={block.externalUrl ?? ""}
            onChange={(v) => set({ ...block, externalUrl: v || undefined })}
          />
        </div>
      );

    case "challenge":
      return (
        <div className="space-y-3">
          <TextField
            label="Title"
            placeholder="Pick the product you want me to review"
            value={block.title}
            onChange={(v) => set({ ...block, title: v })}
          />
          <TextareaField
            label="Brief"
            placeholder="What you want fans to do, in 2 sentences."
            value={block.brief}
            onChange={(v) => set({ ...block, brief: v })}
          />
          <MediaBlockInput
            value={block.media}
            onChange={(next) => set({ ...block, media: next })}
          />
        </div>
      );
  }
}
