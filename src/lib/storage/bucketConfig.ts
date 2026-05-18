import {
  AUDIO_MIME_ALLOWLIST,
  IMAGE_MIME_ALLOWLIST,
  VIDEO_MIME_ALLOWLIST,
} from "./mimeSniff";

export const MEDIA_BUCKET = "media";

export const MEDIA_BUCKET_FILE_SIZE_LIMIT = 50 * 1024 * 1024;

export const MEDIA_BUCKET_ALLOWED_MIME_TYPES: string[] = [
  ...IMAGE_MIME_ALLOWLIST,
  "image/svg+xml",
  ...VIDEO_MIME_ALLOWLIST,
  ...AUDIO_MIME_ALLOWLIST,
];

export function getMediaBucketConfig() {
  return {
    public: true,
    fileSizeLimit: MEDIA_BUCKET_FILE_SIZE_LIMIT,
    allowedMimeTypes: [...MEDIA_BUCKET_ALLOWED_MIME_TYPES],
  };
}
