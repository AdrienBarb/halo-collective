"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface AvatarUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  initials?: string;
  /** Tailwind size override. Defaults to `h-[160px] w-[160px]`. */
  sizeClassName?: string;
  /** Monogram text size override. Defaults to `text-[56px]`. */
  monogramClassName?: string;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const PORTRAIT_GRADIENT = "linear-gradient(135deg,#5a6478 0%,#2c3340 100%)";

export default function AvatarUploader({
  value,
  onChange,
  initials,
  sizeClassName = "h-[160px] w-[160px]",
  monogramClassName = "text-[56px]",
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", {
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
        onChange(data.url);
        toast.success("Avatar uploaded");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setIsUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange],
  );

  const monogram = (initials ?? "").slice(0, 2).toUpperCase() || "·";

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
        aria-label={value ? "Replace avatar" : "Upload avatar"}
        className={[
          `group relative ${sizeClassName} cursor-pointer overflow-hidden rounded-full`,
          "border-[4px] border-cream-2",
          "shadow-[0_10px_28px_rgba(0,0,0,0.22)]",
          "transition-[transform,box-shadow] duration-200 ease-out",
          "hover:-translate-y-[2px] hover:shadow-[0_14px_32px_rgba(0,0,0,0.28)]",
          "focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-accent-gold",
          "disabled:cursor-not-allowed",
          isDragging
            ? "outline-2 outline-offset-[6px] outline-accent-gold -translate-y-[2px]"
            : "outline outline-transparent",
        ].join(" ")}
        style={{ background: PORTRAIT_GRADIENT }}
      >
        {value ? (
          <Image
            src={value}
            alt=""
            fill
            sizes="160px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className={`flex h-full w-full items-center justify-center font-sans ${monogramClassName} font-semibold tracking-[-0.02em] text-cream`}>
            {monogram}
          </span>
        )}

        <span
          aria-hidden
          className={[
            "pointer-events-none absolute inset-0 flex items-center justify-center",
            "bg-ink/55 backdrop-blur-[2px]",
            "opacity-0 transition-opacity duration-200",
            "group-hover:opacity-100 group-focus-visible:opacity-100",
            isDragging && "opacity-100",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <CameraIcon />
        </span>

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
