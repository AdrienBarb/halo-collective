import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { uploadMedia } from "@/lib/storage/uploadMedia";
import { errorHandler } from "@/lib/errors/errorHandler";
import { BadRequestError } from "@/lib/errors/AppError";

type AllowedMime = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

const EXTENSION_BY_MIME: Record<AllowedMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function sniffImageMime(buf: Buffer): AllowedMime | null {
  if (buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }
  // WebP: "RIFF" .... "WEBP"
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  // AVIF: ISO base media — "ftyp" at offset 4, brand "avif"/"avis" at offset 8
  if (buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis") {
      return "image/avif";
    }
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
      throw new BadRequestError("File exceeds 10 MB limit");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sniffed = sniffImageMime(buffer);
    if (!sniffed) {
      throw new BadRequestError(
        "Unsupported file — only JPEG, PNG, WebP, or AVIF images are allowed",
      );
    }

    const ext = EXTENSION_BY_MIME[sniffed];
    const filename = `${randomUUID()}.${ext}`;

    const url = await uploadMedia({
      file: buffer,
      contentType: sniffed,
      pathPrefix: "admin/uploads",
      filename,
    });

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
