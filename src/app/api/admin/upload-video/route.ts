import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { uploadMedia } from "@/lib/storage/uploadMedia";
import { errorHandler } from "@/lib/errors/errorHandler";
import { BadRequestError } from "@/lib/errors/AppError";

type AllowedMime = "video/mp4" | "video/webm" | "video/quicktime";

const MAX_SIZE_BYTES = 50 * 1024 * 1024;

const EXTENSION_BY_MIME: Record<AllowedMime, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

// Core ISO-BMFF brands used by mainstream MP4 video encoders. Excludes
// marginal/ambiguous brands (M4V, MSNV, dash, f4v) to narrow the surface for
// audio-as-video and HEIF content-confusion. M4A/M4B and image brands (heic,
// heix, mif1) are never on this list and therefore rejected.
const MP4_BRANDS = new Set([
  "isom",
  "iso2",
  "iso4",
  "iso5",
  "mp41",
  "mp42",
  "avc1",
]);

function sniffVideoMime(buf: Buffer): AllowedMime | null {
  if (buf.length < 12) return null;

  // WebM / Matroska share the same EBML signature for audio.webm and
  // video.webm — at this route's boundary we accept it as video/webm.
  if (
    buf[0] === 0x1a &&
    buf[1] === 0x45 &&
    buf[2] === 0xdf &&
    buf[3] === 0xa3
  ) {
    return "video/webm";
  }

  if (buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (brand === "qt  ") return "video/quicktime";
    if (MP4_BRANDS.has(brand)) return "video/mp4";
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new BadRequestError("No file provided");
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestError("File exceeds 50 MB limit");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sniffed = sniffVideoMime(buffer);
    if (!sniffed) {
      throw new BadRequestError(
        "Unsupported file — only MP4, WebM, or MOV video is allowed",
      );
    }

    const ext = EXTENSION_BY_MIME[sniffed];
    const filename = `${randomUUID()}.${ext}`;

    const url = await uploadMedia({
      file: buffer,
      contentType: sniffed,
      pathPrefix: "admin/video",
      filename,
    });

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
