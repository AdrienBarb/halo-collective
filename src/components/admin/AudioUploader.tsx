"use client";

import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";

interface AudioUploaderProps {
  url?: string | null;
  durationSec?: number | null;
  onChange: (next: { url: string; durationSec: number | null }) => void;
  onClear: () => void;
}

const ACCEPT = "audio/mpeg,audio/mp4,audio/wav,audio/x-wav,audio/webm,.mp3,.m4a,.wav,.webm";

function readAudioDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      audio.remove();
    };
    audio.onloadedmetadata = () => {
      const d = Number.isFinite(audio.duration) ? audio.duration : null;
      cleanup();
      resolve(d === null ? null : Math.round(d));
    };
    audio.onerror = () => {
      cleanup();
      resolve(null);
    };
    audio.src = objectUrl;
  });
}

export default function AudioUploader({
  url,
  durationSec,
  onChange,
  onClear,
}: AudioUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const duration = await readAudioDuration(file);

        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload-audio", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data.error ?? "Upload failed");
        }
        const data = (await res.json()) as { url: string };
        onChange({ url: data.url, durationSec: duration });
        toast.success("Voice note uploaded");
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
          <audio src={url} controls preload="metadata" className="w-full" />
          {durationSec ? (
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
              {formatDuration(durationSec)}
            </p>
          ) : null}
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
              ? "Replace voice note"
              : "Upload voice note"}
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

function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
