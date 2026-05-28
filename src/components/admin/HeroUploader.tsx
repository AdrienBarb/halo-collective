"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useDirectUpload } from "@/lib/hooks/useDirectUpload";

interface HeroUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  /** Top line of the placeholder. Defaults to "Issue cover image". */
  emptyTitle?: string;
  /** Helper line shown below. Defaults to a click-or-drop hint. */
  emptyHelp?: string;
  /** Tailwind aspect-ratio override. Defaults to `aspect-[16/9]`. */
  aspectClassName?: string;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const HERO_GRADIENT = "linear-gradient(135deg,#5a6478 0%,#2c3340 100%)";

export default function HeroUploader({
  value,
  onChange,
  emptyTitle = "Issue cover image",
  emptyHelp = "Click or drop · 16:9 · used on web + email",
  aspectClassName = "aspect-[16/9]",
}: HeroUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useDirectUpload();
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      try {
        const { url: uploadedUrl } = await upload(file, {
          kind: "image",
          signEndpoint: "/api/admin/upload",
        });
        onChange(uploadedUrl);
        toast.success("Cover uploaded");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange, upload],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isUploading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (isUploading) return;
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        disabled={isUploading}
        aria-label={value ? "Replace cover" : "Upload cover"}
        className={[
          `group relative ${aspectClassName} w-full cursor-pointer overflow-hidden rounded-2xl`,
          "border border-line",
          "transition-[transform,box-shadow] duration-200 ease-out",
          "hover:[box-shadow:0_10px_28px_rgba(0,0,0,0.10)]",
          "focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-accent-gold",
          "disabled:cursor-not-allowed",
          isDragging
            ? "outline-2 outline-offset-[6px] outline-accent-gold -translate-y-[2px]"
            : "outline outline-transparent",
        ].join(" ")}
        style={{ background: value ? undefined : HERO_GRADIENT }}
      >
        {value ? (
          <Image
            src={value}
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, 760px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-cream">
            <CameraIcon />
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em]">
              {emptyTitle}
            </span>
            <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-cream/70">
              {emptyHelp}
            </span>
          </span>
        )}

        {value ? (
          <span
            aria-hidden
            className={[
              "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2",
              "bg-ink/55 backdrop-blur-[2px]",
              "opacity-0 transition-opacity duration-200",
              "group-hover:opacity-100 group-focus-visible:opacity-100",
              isDragging && "opacity-100",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <CameraIcon />
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-cream">
              {isDragging ? "Drop to upload" : "Replace"}
            </span>
          </span>
        ) : null}

        {isUploading ? (
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center bg-ink/65 backdrop-blur-[2px]"
          >
            <span className="h-9 w-9 animate-spin rounded-full border-2 border-cream/30 border-t-cream" />
          </span>
        ) : null}
      </button>

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
    </>
  );
}

function CameraIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-cream"
      aria-hidden
    >
      <path d="M14.5 4h-5l-1.7 2.2H4a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.2a2 2 0 0 0-2-2h-3.8L14.5 4Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
