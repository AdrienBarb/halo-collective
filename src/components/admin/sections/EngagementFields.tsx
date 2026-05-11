"use client";

import Repeater from "@/components/admin/sections/Repeater";
import { TextField } from "@/components/admin/sections/FormAtoms";
import type { EngagementContent } from "@/lib/schemas/newsletterSection";

interface EngagementFieldsProps {
  content: EngagementContent;
  onChange: (next: EngagementContent) => void;
}

export default function EngagementFields({
  content,
  onChange,
}: EngagementFieldsProps) {
  return (
    <div className="space-y-6">
      <TextField
        label="Poll question"
        placeholder="What should I work on next?"
        value={content.question ?? ""}
        onChange={(question) =>
          onChange({ ...content, question: question || undefined })
        }
      />

      <Repeater
        label="Answers"
        help="Need at least two for a working poll. Star one to mark it as the highlighted answer."
        addLabel="Add answer"
        emptyState="No answers yet"
        items={content.pollOptions}
        empty={{ label: "", emoji: undefined, isHighlighted: false }}
        onChange={(pollOptions) => onChange({ ...content, pollOptions })}
        render={(item, set) => (
          <div className="grid grid-cols-[1fr_88px_auto] items-end gap-3">
            <TextField
              label="Label"
              placeholder="Serve under pressure"
              value={item.label}
              onChange={(label) => set({ ...item, label })}
            />
            <TextField
              label="Emoji"
              placeholder="🎯"
              value={item.emoji ?? ""}
              onChange={(v) => set({ ...item, emoji: v || undefined })}
            />
            <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xs border border-line bg-cream-2 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-2">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 accent-accent-gold"
                checked={item.isHighlighted}
                onChange={(e) =>
                  set({ ...item, isHighlighted: e.target.checked })
                }
              />
              Star
            </label>
          </div>
        )}
      />

      <TextField
        label="Vote link"
        type="url"
        help="Where the Vote → button sends fans."
        placeholder="https://…"
        value={content.pollUrl ?? ""}
        onChange={(v) => onChange({ ...content, pollUrl: v || undefined })}
      />
    </div>
  );
}
