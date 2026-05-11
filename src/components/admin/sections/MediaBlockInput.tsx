"use client";

import type { MediaBlock } from "@/lib/schemas/newsletterSection";
import AudioUploader from "@/components/admin/AudioUploader";
import CompactImageField from "@/components/admin/sections/CompactImageField";
import { FieldGroup, TextField } from "@/components/admin/sections/FormAtoms";

interface MediaBlockInputProps {
  value: MediaBlock | undefined;
  onChange: (next: MediaBlock | undefined) => void;
  /** Override the group label — defaults to "Media (optional)". */
  label?: string;
}

type Kind = "none" | "video" | "voicenote";

const OPTIONS: Array<{ kind: Kind; label: string }> = [
  { kind: "none", label: "None" },
  { kind: "video", label: "Video" },
  { kind: "voicenote", label: "Voice note" },
];

export default function MediaBlockInput({
  value,
  onChange,
  label = "Media (optional)",
}: MediaBlockInputProps) {
  const kind: Kind = value?.kind ?? "none";

  function setKind(next: Kind) {
    if (next === kind) return;
    if (next === "none") {
      onChange(undefined);
      return;
    }
    if (next === "video") {
      onChange({ kind: "video", thumbnailUrl: undefined, videoUrl: "" });
      return;
    }
    onChange({
      kind: "voicenote",
      title: "Voice note",
      location: "",
      durationLabel: "",
      audioUrl: "",
    });
  }

  return (
    <FieldGroup
      label={label}
      trailing={
        <div
          role="tablist"
          aria-label={typeof label === "string" ? label : undefined}
          className="inline-flex overflow-hidden rounded-xs border border-line bg-cream"
        >
          {OPTIONS.map((opt) => {
            const active = kind === opt.kind;
            return (
              <button
                key={opt.kind}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setKind(opt.kind)}
                className={[
                  "px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors",
                  active
                    ? "bg-ink text-cream"
                    : "text-ink-3 hover:bg-cream-3 hover:text-ink",
                ].join(" ")}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      }
    >
      {kind === "video" && value?.kind === "video" ? (
        <div className="space-y-3">
          <CompactImageField
            label="Thumbnail"
            help="Optional poster image shown before the video plays. 16:9."
            value={value.thumbnailUrl ?? null}
            onChange={(url) => onChange({ ...value, thumbnailUrl: url })}
            onClear={() => onChange({ ...value, thumbnailUrl: undefined })}
            aspect="wide"
            height={88}
          />
          <TextField
            label="Video URL"
            placeholder="https://www.youtube.com/watch?v=…"
            help="YouTube, Vimeo, or any embeddable URL."
            type="url"
            value={value.videoUrl}
            onChange={(v) => onChange({ ...value, videoUrl: v })}
          />
        </div>
      ) : null}

      {kind === "voicenote" && value?.kind === "voicenote" ? (
        <div className="space-y-3">
          <AudioUploader
            url={value.audioUrl || null}
            durationSec={null}
            onChange={({ url }) => onChange({ ...value, audioUrl: url })}
            onClear={() => onChange({ ...value, audioUrl: "" })}
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <TextField
              label="Title"
              placeholder="My week, in 90 seconds"
              value={value.title}
              onChange={(v) => onChange({ ...value, title: v })}
            />
            <TextField
              label="Location"
              placeholder="Roland-Garros, Paris"
              value={value.location}
              onChange={(v) => onChange({ ...value, location: v })}
            />
            <TextField
              label="Duration"
              placeholder="1 min 30"
              value={value.durationLabel}
              onChange={(v) => onChange({ ...value, durationLabel: v })}
            />
          </div>
        </div>
      ) : null}

      {kind === "none" ? (
        <p className="text-[11px] italic leading-snug text-ink-3">
          Skip if this section is text-only.
        </p>
      ) : null}
    </FieldGroup>
  );
}
