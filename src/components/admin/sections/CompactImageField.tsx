"use client";

import { useCallback, useId, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { FieldLabel, FieldHelp } from "@/components/admin/sections/FormAtoms";
import { useDirectUpload } from "@/lib/hooks/useDirectUpload";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/svg+xml";

interface CompactImageFieldProps {
  label?: React.ReactNode;
  help?: React.ReactNode;
  value?: string | null;
  onChange: (url: string) => void;
  onClear?: () => void;
  /** Aspect of the preview thumbnail. */
  aspect?: "square" | "wide";
  /** Preview height in px; width is derived from aspect. */
  height?: number;
  className?: string;
}

export default function CompactImageField({
  label,
  help,
  value,
  onChange,
  onClear,
  aspect = "wide",
  height = 88,
  className,
}: CompactImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useDirectUpload();
  const id = useId();
  const width = aspect === "square" ? height : Math.round(height * (16 / 9));

  const handleFile = useCallback(
    async (file: File) => {
      try {
        const { url: uploadedUrl } = await upload(file, {
          kind: "image",
          signEndpoint: "/api/admin/upload",
        });
        onChange(uploadedUrl);
        toast.success("Uploaded");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange, upload],
  );

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? <FieldLabel htmlFor={id}>{label}</FieldLabel> : null}
      <div className="flex items-center gap-4">
        <button
          id={id}
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          aria-label={value ? "Replace image" : "Upload image"}
          className={cn(
            "group relative shrink-0 overflow-hidden rounded-sm border border-line bg-cream-3 transition-colors",
            "hover:border-line-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold",
            "disabled:cursor-not-allowed",
          )}
          style={{ width, height }}
        >
          {value ? (
            <Image
              src={value}
              alt=""
              fill
              sizes={`${width}px`}
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-sans text-[9px] font-medium uppercase tracking-[0.18em] text-ink-3">
              {aspect === "square" ? "No image" : "No image"}
            </span>
          )}
          {value ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/55 font-sans text-[9px] font-medium uppercase tracking-[0.18em] text-cream opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            >
              Replace
            </span>
          ) : null}
          {isUploading ? (
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center bg-ink/65"
            >
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream/30 border-t-cream" />
            </span>
          ) : null}
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="rounded-xs border border-line bg-cream px-3 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {value ? "Replace" : "Upload"}
            </button>
            {value && onClear ? (
              <button
                type="button"
                onClick={onClear}
                disabled={isUploading}
                className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-ink-3 underline-offset-4 transition-colors hover:text-ink hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            ) : null}
          </div>
          {help ? <FieldHelp>{help}</FieldHelp> : null}
        </div>
      </div>

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
    </div>
  );
}
