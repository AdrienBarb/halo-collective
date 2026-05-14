"use client";

import { useCallback, useState } from "react";
import { supabaseBrowser } from "@/lib/storage/browserClient";
import {
  sniffAudioMime,
  sniffImageMime,
  sniffVideoMime,
  type AllowedMediaMime,
} from "@/lib/storage/mimeSniff";
import { MEDIA_BUCKET } from "@/lib/storage/bucketConfig";

export type UploadKind = "image" | "video" | "audio";

const SIZE_LIMIT_BY_KIND: Record<UploadKind, number> = {
  image: 10 * 1024 * 1024,
  audio: 50 * 1024 * 1024,
  video: 50 * 1024 * 1024,
};

const SIZE_LIMIT_LABEL: Record<UploadKind, string> = {
  image: "10 MB",
  audio: "50 MB",
  video: "50 MB",
};

const UNSUPPORTED_MESSAGE: Record<UploadKind, string> = {
  image: "Unsupported file — only JPEG, PNG, WebP, or AVIF images are allowed",
  video: "Unsupported file — only MP4, WebM, or MOV video is allowed",
  audio: "Unsupported file — only MP3, M4A, WAV, or WebM audio is allowed",
};

function detectMime(kind: UploadKind, bytes: Uint8Array): AllowedMediaMime | null {
  if (kind === "image") return sniffImageMime(bytes);
  if (kind === "video") return sniffVideoMime(bytes);
  return sniffAudioMime(bytes);
}

type SignedUploadResponse = {
  path: string;
  token: string;
  publicUrl: string;
};

export type UseDirectUploadResult = { url: string; path: string };

export type UseDirectUploadOptions = {
  kind: UploadKind;
  signEndpoint: string;
};

export function useDirectUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (
      file: File,
      { kind, signEndpoint }: UseDirectUploadOptions,
    ): Promise<UseDirectUploadResult> => {
      setIsUploading(true);
      try {
        if (file.size === 0) {
          throw new Error("File is empty");
        }
        if (file.size > SIZE_LIMIT_BY_KIND[kind]) {
          throw new Error(`File exceeds ${SIZE_LIMIT_LABEL[kind]} limit`);
        }

        const head = new Uint8Array(await file.slice(0, 32).arrayBuffer());
        const sniffed = detectMime(kind, head);
        if (!sniffed) {
          throw new Error(UNSUPPORTED_MESSAGE[kind]);
        }

        const signRes = await fetch(signEndpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ contentType: sniffed }),
        });
        if (!signRes.ok) {
          const errBody = (await signRes
            .json()
            .catch(() => ({}))) as { error?: string };
          throw new Error(errBody.error ?? "Failed to authorize upload");
        }
        const signed = (await signRes.json()) as SignedUploadResponse;
        if (!signed.path || !signed.token || !signed.publicUrl) {
          throw new Error("Invalid signed upload response");
        }

        const { error: uploadError } = await supabaseBrowser.storage
          .from(MEDIA_BUCKET)
          .uploadToSignedUrl(signed.path, signed.token, file, {
            contentType: sniffed,
            upsert: false,
          });
        if (uploadError) {
          throw new Error(uploadError.message || "Upload failed");
        }

        return { url: signed.publicUrl, path: signed.path };
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return { upload, isUploading };
}
