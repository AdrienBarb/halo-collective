"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useDirectUpload } from "@/lib/hooks/useDirectUpload";

interface LogoUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  size?: number;
  endpoint?: string;
  accept?: string;
}

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const DEFAULT_ENDPOINT = "/api/admin/upload";
const VECTORIZE_ENDPOINT = "/api/admin/vectorize-logo";

export default function LogoUploader({
  value,
  onChange,
  size = 56,
  endpoint = DEFAULT_ENDPOINT,
  accept = DEFAULT_ACCEPT,
}: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useDirectUpload();

  const handleFile = useCallback(
    async (file: File) => {
      try {
        if (endpoint === VECTORIZE_ENDPOINT) {
          const { path } = await upload(file, {
            kind: "image",
            signEndpoint: "/api/admin/vectorize-logo/sign",
          });
          const res = await fetch(VECTORIZE_ENDPOINT, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ sourcePath: path }),
          });
          if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as {
              error?: string;
            };
            throw new Error(data.error ?? "Vectorization failed");
          }
          const data = (await res.json()) as { url: string };
          onChange(data.url);
        } else {
          const { url: uploadedUrl } = await upload(file, {
            kind: "image",
            signEndpoint: endpoint,
          });
          onChange(uploadedUrl);
        }
        toast.success("Logo uploaded");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange, endpoint, upload],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        aria-label={value ? "Replace logo" : "Upload logo"}
        className="group relative shrink-0 overflow-hidden rounded border border-line bg-cream-3 transition-colors hover:border-accent-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold disabled:cursor-not-allowed"
        style={{ width: size, height: size }}
      >
        {value ? (
          <Image
            src={value}
            alt=""
            fill
            sizes={`${size}px`}
            className="object-contain"
            unoptimized
          />
        ) : (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-3">
            Upload<br />logo
          </span>
        )}

        {value ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/55 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-cream opacity-0 transition-opacity duration-150 group-hover:opacity-100"
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

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </>
  );
}
