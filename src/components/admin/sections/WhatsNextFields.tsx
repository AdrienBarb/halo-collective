"use client";

import MediaBlockInput from "@/components/admin/sections/MediaBlockInput";
import Repeater from "@/components/admin/sections/Repeater";
import {
  TextField,
  TextareaField,
} from "@/components/admin/sections/FormAtoms";
import type { WhatsNextContent } from "@/lib/schemas/newsletterSection";

interface WhatsNextFieldsProps {
  content: WhatsNextContent;
  onChange: (next: WhatsNextContent) => void;
}

export default function WhatsNextFields({
  content,
  onChange,
}: WhatsNextFieldsProps) {
  return (
    <div className="space-y-6">
      <MediaBlockInput
        value={content.media}
        onChange={(media) => onChange({ ...content, media })}
      />

      <TextField
        label="Next tournament line"
        help={
          <>
            One short line above the body. Like{" "}
            <span className="font-mono">BMW Open · 14-20 Apr · 🟤 Clay</span>.
          </>
        }
        placeholder="BMW Open · 14-20 Apr · 🟤 Clay"
        value={content.tournamentMeta ?? ""}
        onChange={(v) =>
          onChange({ ...content, tournamentMeta: v || undefined })
        }
      />

      <TextareaField
        label="Note"
        help="A few sentences on what's ahead and how the athlete is feeling about it."
        rows={6}
        placeholder="Back on clay for the first time since Rome…"
        value={content.body ?? ""}
        onChange={(body) =>
          onChange({ ...content, body: body || undefined })
        }
      />

      <Repeater
        label="Schedule"
        help="Upcoming tournaments or training blocks. Optional."
        addLabel="Add row"
        emptyState="No schedule rows yet"
        items={content.schedule}
        empty={{ dateRange: "", title: "", description: "" }}
        onChange={(schedule) => onChange({ ...content, schedule })}
        render={(item, set) => (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <TextField
                label="Date range"
                placeholder="14-20 Apr"
                value={item.dateRange}
                onChange={(dateRange) => set({ ...item, dateRange })}
              />
              <TextField
                label="Title"
                placeholder="BMW Open"
                value={item.title}
                onChange={(title) => set({ ...item, title })}
              />
            </div>
            <TextareaField
              label="Note"
              rows={2}
              placeholder="One sentence — surface, draw, anything fans should know."
              value={item.description}
              onChange={(description) => set({ ...item, description })}
            />
          </div>
        )}
      />
    </div>
  );
}
