"use client";

import { useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { useDirectUpload } from "@/lib/hooks/useDirectUpload";

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
  const { upload, isUploading } = useDirectUpload();

  const handleFile = useCallback(
    async (file: File) => {
      try {
        const { url: uploadedUrl } = await upload(file, {
          kind: "video",
          signEndpoint: "/api/admin/upload-video",
        });
        onChange({ url: uploadedUrl });
        toast.success("Video uploaded");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange, upload],
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
          className="inline-flex items-center gap-2 rounded-md border border-line bg-cream px-3 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-ink hover:bg-cream-2 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="font-sans text-[11px] uppercase tracking-[0.18em] text-ink-3 hover:text-ink disabled:opacity-60"
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}
