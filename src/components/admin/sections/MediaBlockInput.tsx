"use client";

import { useState } from "react";
import type { MediaBlock } from "@/lib/schemas/newsletterSection";
import AudioUploader from "@/components/admin/AudioUploader";
import VideoUploader from "@/components/admin/VideoUploader";
import CompactImageField from "@/components/admin/sections/CompactImageField";
import {
  FieldGroup,
  TextareaField,
  TextField,
} from "@/components/admin/sections/FormAtoms";
import { emptyMediaBlock } from "@/components/admin/sections/blockDefaults";

type VideoMode = "upload" | "url";

function initialVideoMode(value: MediaBlock | undefined): VideoMode {
  if (value?.kind !== "video" || !value.url) return "upload";
  // Supabase public storage URLs include this path segment — treat them as
  // uploads. External URLs (YouTube, Vimeo, etc.) land on the URL tab.
  return value.url.includes("/storage/v1/object/public/") ? "upload" : "url";
}

interface MediaBlockInputProps {
  value: MediaBlock | undefined;
  onChange: (next: MediaBlock | undefined) => void;
  /** Override the group label — defaults to "Media (optional)". */
  label?: string;
  /** When true, hides the "None" tab — useful for required-media slots. */
  required?: boolean;
}

type Kind = "none" | MediaBlock["kind"];

const OPTIONS: Array<{ kind: Kind; label: string }> = [
  { kind: "none", label: "None" },
  { kind: "text", label: "Text" },
  { kind: "image", label: "Image" },
  { kind: "audio", label: "Audio" },
  { kind: "video", label: "Video" },
];

export default function MediaBlockInput({
  value,
  onChange,
  label = "Media (optional)",
  required = false,
}: MediaBlockInputProps) {
  const kind: Kind = value?.kind ?? "none";
  const visibleOptions = required
    ? OPTIONS.filter((opt) => opt.kind !== "none")
    : OPTIONS;
  const [videoMode, setVideoMode] = useState<VideoMode>(() =>
    initialVideoMode(value),
  );
  // Re-derive the sub-toggle when the parent swaps the media kind so an editor
  // toggling video → image → video doesn't carry a stale Upload/URL choice.
  const [prevKind, setPrevKind] = useState(value?.kind);
  if (value?.kind !== prevKind) {
    setPrevKind(value?.kind);
    if (value?.kind === "video") setVideoMode(initialVideoMode(value));
  }

  function setKind(next: Kind) {
    if (next === kind) return;
    if (next === "none") {
      onChange(undefined);
      return;
    }
    onChange(emptyMediaBlock(next));
  }

  return (
    <FieldGroup
      label={label}
      trailing={
        <div
          role="radiogroup"
          aria-label={typeof label === "string" ? `${label}: kind` : "Media kind"}
          className="inline-flex overflow-hidden rounded-xs border border-line bg-cream"
        >
          {visibleOptions.map((opt) => {
            const active = kind === opt.kind;
            return (
              <button
                key={opt.kind}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setKind(opt.kind)}
                className={[
                  "min-h-11 px-3 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.18em] transition-colors",
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
      {value?.kind === "text" ? (
        <TextareaField
          label="Body"
          placeholder="Write a few short paragraphs…"
          rows={5}
          value={value.body}
          onChange={(v) => onChange({ ...value, body: v })}
        />
      ) : null}

      {value?.kind === "image" ? (
        <div className="space-y-3">
          <CompactImageField
            label="Image"
            value={value.url || null}
            onChange={(url) => onChange({ ...value, url: url ?? "" })}
            onClear={() => onChange({ ...value, url: "" })}
            aspect="wide"
            height={120}
          />
          <TextField
            label="Alt text"
            placeholder="Describe the image for screen readers"
            help="Required for accessibility. Leave empty only if the image is purely decorative."
            value={value.alt ?? ""}
            onChange={(v) => onChange({ ...value, alt: v })}
          />
        </div>
      ) : null}

      {value?.kind === "audio" ? (
        <div className="space-y-3">
          <AudioUploader
            url={value.url || null}
            durationSec={null}
            onChange={({ url }) => onChange({ ...value, url })}
            onClear={() => onChange({ ...value, url: "" })}
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <TextField
              label="Title"
              placeholder="My week, in 90 seconds"
              value={value.title ?? ""}
              onChange={(v) => onChange({ ...value, title: v || undefined })}
            />
            <TextField
              label="Location"
              placeholder="Roland-Garros, Paris"
              value={value.location ?? ""}
              onChange={(v) => onChange({ ...value, location: v || undefined })}
            />
            <TextField
              label="Duration"
              placeholder="1 min 30"
              value={value.durationLabel ?? ""}
              onChange={(v) =>
                onChange({ ...value, durationLabel: v || undefined })
              }
            />
          </div>
        </div>
      ) : null}

      {value?.kind === "video" ? (
        <div className="space-y-3">
          <CompactImageField
            label="Thumbnail"
            help="Optional poster image shown before the video plays. 16:9."
            value={value.thumbnailUrl ?? null}
            onChange={(url) => onChange({ ...value, thumbnailUrl: url ?? undefined })}
            onClear={() => onChange({ ...value, thumbnailUrl: undefined })}
            aspect="wide"
            height={88}
          />

          <div
            role="radiogroup"
            aria-label="Video source"
            className="inline-flex overflow-hidden rounded-xs border border-line bg-cream"
          >
            {(["upload", "url"] as const).map((mode) => {
              const active = videoMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setVideoMode(mode)}
                  className={[
                    "min-h-9 px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-[0.18em] transition-colors",
                    active
                      ? "bg-ink text-cream"
                      : "text-ink-3 hover:bg-cream-3 hover:text-ink",
                  ].join(" ")}
                >
                  {mode === "upload" ? "Upload" : "URL"}
                </button>
              );
            })}
          </div>

          {videoMode === "upload" ? (
            <VideoUploader
              url={value.url || null}
              onChange={({ url }) => onChange({ ...value, url })}
              onClear={() => onChange({ ...value, url: "" })}
            />
          ) : (
            <TextField
              label="Video URL"
              placeholder="https://www.youtube.com/watch?v=…"
              help="YouTube, Vimeo, or any embeddable URL."
              type="url"
              value={value.url}
              onChange={(v) => onChange({ ...value, url: v })}
            />
          )}
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
