import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { uploadMedia } from "@/lib/storage/uploadMedia";
import { sanitizeSvgString } from "@/lib/storage/sanitizeSvg";
import { errorHandler } from "@/lib/errors/errorHandler";
import { AppError, BadRequestError } from "@/lib/errors/AppError";
import { getRequiredEnv } from "@/lib/utils/env";

type AllowedMime = "image/jpeg" | "image/png" | "image/webp";
type VectorizerMode = "production" | "preview" | "test" | "test_preview";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const VECTORIZER_ENDPOINT = "https://api.vectorizer.ai/api/v1/vectorize";
const VECTORIZER_TIMEOUT_MS = 180_000;
const ALLOWED_MODES: readonly VectorizerMode[] = [
  "production",
  "preview",
  "test",
  "test_preview",
];

function resolveMode(): VectorizerMode {
  const raw = process.env.VECTORIZER_MODE?.trim();
  if (!raw) return "production";
  if ((ALLOWED_MODES as readonly string[]).includes(raw)) {
    return raw as VectorizerMode;
  }
  throw new AppError(
    `VECTORIZER_MODE must be one of: ${ALLOWED_MODES.join(", ")}`,
    500,
  );
}

function sniffImageMime(buf: Buffer): AllowedMime | null {
  if (buf.length < 12) return null;

  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
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
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

async function vectorize(buffer: Buffer, contentType: AllowedMime): Promise<string> {
  const apiId = getRequiredEnv("VECTORIZER_API_ID");
  const apiSecret = getRequiredEnv("VECTORIZER_API_SECRET");
  const auth = Buffer.from(`${apiId}:${apiSecret}`).toString("base64");

  const form = new FormData();
  form.append("image", new Blob([new Uint8Array(buffer)], { type: contentType }));
  form.append("mode", resolveMode());
  form.append("output.file_format", "svg");
  form.append("output.svg.version", "svg_1_1");
  form.append("output.svg.fixed_size", "false");
  // Strip white (and near-white) background by remapping it to transparent.
  // Vectorizer.AI omits fully-transparent colors from the result.
  form.append("processing.palette", "#FFFFFF -> #00000000 ~ 0.12;");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VECTORIZER_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(VECTORIZER_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` },
      body: form,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new AppError("Vectorization timed out", 504);
    }
    throw new AppError("Vectorization request failed", 502);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const status = res.status >= 400 && res.status < 500 ? 400 : 502;
    throw new AppError(
      `Vectorization failed${body ? `: ${body.slice(0, 200)}` : ""}`,
      status,
    );
  }

  return await res.text();
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
    if (file.size === 0) {
      throw new BadRequestError("File is empty");
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestError("File exceeds 10 MB limit");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sniffed = sniffImageMime(buffer);
    if (!sniffed) {
      throw new BadRequestError(
        "Unsupported file — only JPEG, PNG, or WebP images are allowed",
      );
    }

    const rawSvg = await vectorize(buffer, sniffed);

    let cleaned: string;
    try {
      cleaned = sanitizeSvgString(rawSvg);
    } catch {
      throw new AppError("Vectorizer returned an invalid SVG", 502);
    }

    const filename = `${randomUUID()}.svg`;
    const url = await uploadMedia({
      file: Buffer.from(cleaned, "utf-8"),
      contentType: "image/svg+xml",
      pathPrefix: "admin/sponsors",
      filename,
    });

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
