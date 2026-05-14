"use client";

import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";

interface VideoUploaderProps {
  url?: string | null;
  onChange: (next: { url: string }) => void;
  onClear: () => void;
}

const ACCEPT = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";

export default function VideoUploader({
  url,
  onChange,
  onClear,
}: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload-video", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data.error ?? "Upload failed");
        }
        const data = (await res.json().catch(() => ({}))) as {
          url?: unknown;
        };
        if (typeof data.url !== "string" || data.url.length === 0) {
          throw new Error("Upload failed");
        }
        onChange({ url: data.url });
        toast.success("Video uploaded");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setIsUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange],
  );

  return (
    <div className="space-y-3">
      {url ? (
        <div className="rounded-lg border border-line bg-cream-2 p-3">
          <video
            src={url}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full overflow-hidden rounded-md bg-ink"
          />
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-cream px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink hover:bg-cream-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading
            ? "Uploading…"
            : url
              ? "Replace video"
              : "Upload video"}
        </button>
        {url ? (
          <button
            type="button"
            onClick={onClear}
            disabled={isUploading}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3 hover:text-ink disabled:opacity-60"
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}
