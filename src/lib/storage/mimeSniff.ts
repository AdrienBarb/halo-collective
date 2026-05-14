export const IMAGE_MIME_ALLOWLIST = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const VIDEO_MIME_ALLOWLIST = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const AUDIO_MIME_ALLOWLIST = [
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/webm",
] as const;

export type AllowedImageMime = (typeof IMAGE_MIME_ALLOWLIST)[number];
export type AllowedVideoMime = (typeof VIDEO_MIME_ALLOWLIST)[number];
export type AllowedAudioMime = (typeof AUDIO_MIME_ALLOWLIST)[number];
export type AllowedMediaMime =
  | AllowedImageMime
  | AllowedVideoMime
  | AllowedAudioMime;

export const EXTENSION_BY_MIME: Record<AllowedMediaMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "audio/webm": "webm",
};

const MP4_BRANDS = new Set([
  "isom",
  "iso2",
  "iso4",
  "iso5",
  "mp41",
  "mp42",
  "avc1",
]);

function asciiAt(bytes: Uint8Array, start: number, end: number): string {
  const stop = Math.min(end, bytes.length);
  let out = "";
  for (let i = start; i < stop; i++) out += String.fromCharCode(bytes[i]);
  return out;
}

export function sniffImageMime(bytes: Uint8Array): AllowedImageMime | null {
  if (bytes.length < 12) return null;

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (asciiAt(bytes, 0, 4) === "RIFF" && asciiAt(bytes, 8, 12) === "WEBP") {
    return "image/webp";
  }
  if (asciiAt(bytes, 4, 8) === "ftyp") {
    const brand = asciiAt(bytes, 8, 12);
    if (brand === "avif" || brand === "avis") return "image/avif";
  }
  return null;
}

export function sniffVideoMime(bytes: Uint8Array): AllowedVideoMime | null {
  if (bytes.length < 12) return null;

  if (
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return "video/webm";
  }

  if (asciiAt(bytes, 4, 8) === "ftyp") {
    const brand = asciiAt(bytes, 8, 12);
    if (brand === "qt  ") return "video/quicktime";
    if (MP4_BRANDS.has(brand)) return "video/mp4";
  }

  return null;
}

function isMpegAudioFrameHeader(b1: number, b2: number): boolean {
  if (b1 !== 0xff) return false;
  if ((b2 & 0xe0) !== 0xe0) return false;
  const layer = (b2 >> 1) & 0x03;
  if (layer === 0) return false;
  return true;
}

export function sniffAudioMime(bytes: Uint8Array): AllowedAudioMime | null {
  if (bytes.length < 12) return null;

  if (asciiAt(bytes, 0, 3) === "ID3") return "audio/mpeg";
  if (isMpegAudioFrameHeader(bytes[0], bytes[1])) return "audio/mpeg";

  if (asciiAt(bytes, 4, 8) === "ftyp") {
    const brand = asciiAt(bytes, 8, 12);
    if (brand === "M4A " || brand === "M4B ") return "audio/mp4";
  }

  if (asciiAt(bytes, 0, 4) === "RIFF" && asciiAt(bytes, 8, 12) === "WAVE") {
    return "audio/wav";
  }

  if (
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return "audio/webm";
  }

  return null;
}

