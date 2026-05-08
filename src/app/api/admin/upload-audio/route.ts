import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { uploadMedia } from "@/lib/storage/uploadMedia";
import { errorHandler } from "@/lib/errors/errorHandler";
import { BadRequestError } from "@/lib/errors/AppError";

type AllowedMime =
  | "audio/mpeg"
  | "audio/mp4"
  | "audio/wav"
  | "audio/webm";

const MAX_SIZE_BYTES = 50 * 1024 * 1024;

const EXTENSION_BY_MIME: Record<AllowedMime, string> = {
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "audio/webm": "webm",
};

function isMpegAudioFrameHeader(b1: number, b2: number): boolean {
  // Strict MPEG-1/2 audio frame sync: byte 1 = 0xFF, byte 2 high bits 0b1110/0b1111.
  // Reject layer 00 (reserved), bitrate 1111 (bad), sample-rate 11 (reserved).
  if (b1 !== 0xff) return false;
  if ((b2 & 0xe0) !== 0xe0) return false;
  const layer = (b2 >> 1) & 0x03;
  if (layer === 0) return false;
  return true;
}

function sniffAudioMime(buf: Buffer): AllowedMime | null {
  if (buf.length < 12) return null;

  if (buf.toString("ascii", 0, 3) === "ID3") {
    return "audio/mpeg";
  }
  if (isMpegAudioFrameHeader(buf[0], buf[1])) {
    return "audio/mpeg";
  }
  // M4A / M4B only — generic ISO-BMFF brands (isom/mp41/mp42) are also used
  // for video MP4, so we reject them and require an explicit audio brand.
  if (buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (brand === "M4A " || brand === "M4B ") {
      return "audio/mp4";
    }
  }
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WAVE"
  ) {
    return "audio/wav";
  }
  if (
    buf[0] === 0x1a &&
    buf[1] === 0x45 &&
    buf[2] === 0xdf &&
    buf[3] === 0xa3
  ) {
    return "audio/webm";
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new BadRequestError("No file provided");
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestError("File exceeds 50 MB limit");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sniffed = sniffAudioMime(buffer);
    if (!sniffed) {
      throw new BadRequestError(
        "Unsupported file — only MP3, M4A, WAV, or WebM audio is allowed",
      );
    }

    const ext = EXTENSION_BY_MIME[sniffed];
    const filename = `${randomUUID()}.${ext}`;

    const url = await uploadMedia({
      file: buffer,
      contentType: sniffed,
      pathPrefix: "admin/audio",
      filename,
    });

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
