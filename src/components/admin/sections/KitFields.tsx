"use client";

import CompactImageField from "@/components/admin/sections/CompactImageField";
import {
  FieldGroup,
  TextField,
  TextareaField,
} from "@/components/admin/sections/FormAtoms";
import type { KitContent } from "@/lib/schemas/newsletterSection";

interface KitFieldsProps {
  content: KitContent;
  onChange: (next: KitContent) => void;
}

export default function KitFields({ content, onChange }: KitFieldsProps) {
  return (
    <div className="space-y-6">
      <CompactImageField
        label="Kit image"
        help="Editorial product shot — used as the header of this block. 16:9 reads best."
        value={content.imageUrl ?? null}
        aspect="wide"
        height={104}
        onChange={(imageUrl) => onChange({ ...content, imageUrl })}
        onClear={() => onChange({ ...content, imageUrl: undefined })}
      />

      <TextareaField
        label="Note"
        help="Why these matter this week — in the athlete's voice."
        rows={5}
        placeholder="New string tension this week. Heavier feel, more bite on the slice…"
        value={content.body ?? ""}
        onChange={(body) => onChange({ ...content, body: body || undefined })}
      />

      <FieldGroup label="Shop button (optional)">
        <TextField
          label="Label"
          placeholder="Shop my kit →"
          value={content.cta?.label ?? ""}
          onChange={(label) =>
            onChange({
              ...content,
              cta: label
                ? { label, url: content.cta?.url }
                : undefined,
            })
          }
        />
        <TextField
          label="URL"
          type="url"
          placeholder="https://…"
          value={content.cta?.url ?? ""}
          onChange={(url) =>
            onChange({
              ...content,
              cta: content.cta
                ? { ...content.cta, url: url || undefined }
                : undefined,
            })
          }
        />
      </FieldGroup>
    </div>
  );
}
