"use client";

import MediaBlockInput from "@/components/admin/sections/MediaBlockInput";
import {
  FieldGroup,
  TextField,
  TextareaField,
} from "@/components/admin/sections/FormAtoms";
import type { DebriefContent } from "@/lib/schemas/newsletterSection";

interface DebriefFieldsProps {
  content: DebriefContent;
  onChange: (next: DebriefContent) => void;
}

export default function DebriefFields({
  content,
  onChange,
}: DebriefFieldsProps) {
  return (
    <div className="space-y-6">
      <MediaBlockInput
        value={content.media}
        onChange={(media) => onChange({ ...content, media })}
      />

      <TextareaField
        label="Story"
        help="The athlete's own words. Use blank lines to start a new paragraph."
        rows={8}
        placeholder="Walked off court with mixed feelings tonight…"
        value={content.body ?? ""}
        onChange={(body) => onChange({ ...content, body: body || undefined })}
      />

      <FieldGroup label="Pull quote (optional)">
        <TextField
          label="Context"
          placeholder="After R2 vs Atmane"
          value={content.pullQuote?.contextLabel ?? ""}
          onChange={(contextLabel) =>
            onChange({
              ...content,
              pullQuote: {
                contextLabel: contextLabel || undefined,
                text: content.pullQuote?.text ?? "",
              },
            })
          }
        />
        <TextareaField
          label="Quote"
          placeholder="One line you want fans to remember."
          rows={2}
          value={content.pullQuote?.text ?? ""}
          onChange={(text) =>
            onChange({
              ...content,
              pullQuote: text
                ? {
                    contextLabel: content.pullQuote?.contextLabel,
                    text,
                  }
                : undefined,
            })
          }
        />
      </FieldGroup>
    </div>
  );
}
