import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 200;
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { supabaseStorage } from "@/lib/storage/client";
import { MEDIA_BUCKET } from "@/lib/storage/bucketConfig";
import { uploadMedia } from "@/lib/storage/uploadMedia";
import { assertSafeSegment } from "@/lib/storage/signedUpload";
import { sanitizeSvgString } from "@/lib/storage/sanitizeSvg";
import { sniffImageMime } from "@/lib/storage/mimeSniff";
import { errorHandler } from "@/lib/errors/errorHandler";
import { AppError, BadRequestError, NotFoundError } from "@/lib/errors/AppError";
import { getRequiredEnv } from "@/lib/utils/env";

type VectorizerSourceMime = "image/jpeg" | "image/png" | "image/webp";
type VectorizerMode = "production" | "preview" | "test" | "test_preview";

const VECTORIZER_ENDPOINT = "https://api.vectorizer.ai/api/v1/vectorize";
const VECTORIZER_TIMEOUT_MS = 180_000;
const TEMP_PREFIX_SEGMENTS = ["admin", "sponsors", "_temp"] as const;
const ALLOWED_MODES: readonly VectorizerMode[] = [
  "production",
  "preview",
  "test",
  "test_preview",
];

const bodySchema = z.object({
  sourcePath: z.string().min(1),
});

function assertValidTempSourcePath(sourcePath: string): void {
  const segments = sourcePath.split("/");
  if (segments.length !== TEMP_PREFIX_SEGMENTS.length + 1) {
    throw new BadRequestError("Invalid sourcePath");
  }
  for (let i = 0; i < TEMP_PREFIX_SEGMENTS.length; i++) {
    if (segments[i] !== TEMP_PREFIX_SEGMENTS[i]) {
      throw new BadRequestError("Invalid sourcePath");
    }
  }
  try {
    assertSafeSegment(segments[segments.length - 1], "sourcePath filename");
  } catch {
    throw new BadRequestError("Invalid sourcePath");
  }
}

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

async function vectorize(
  bytes: Uint8Array,
  contentType: VectorizerSourceMime,
): Promise<string> {
  const apiId = getRequiredEnv("VECTORIZER_API_ID");
  const apiSecret = getRequiredEnv("VECTORIZER_API_SECRET");
  const auth = Buffer.from(`${apiId}:${apiSecret}`).toString("base64");

  const form = new FormData();
  form.append("image", new Blob([new Uint8Array(bytes)], { type: contentType }));
  form.append("mode", resolveMode());
  form.append("output.file_format", "svg");
  form.append("output.svg.version", "svg_1_1");
  form.append("output.svg.fixed_size", "false");
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

async function removeTempSource(sourcePath: string): Promise<void> {
  const { error } = await supabaseStorage.storage
    .from(MEDIA_BUCKET)
    .remove([sourcePath]);
  if (error) {
    console.warn(
      `[vectorize-logo] failed to remove temp source ${sourcePath}: ${error.message}`,
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new BadRequestError("Missing sourcePath");
    }
    const { sourcePath } = parsed.data;
    assertValidTempSourcePath(sourcePath);

    try {
      const { data: blob, error: downloadError } = await supabaseStorage.storage
        .from(MEDIA_BUCKET)
        .download(sourcePath);
      if (downloadError || !blob) {
        throw new NotFoundError("Source file not found");
      }

      const bytes = new Uint8Array(await blob.arrayBuffer());
      const sniffed = sniffImageMime(bytes);
      if (!sniffed || sniffed === "image/avif") {
        throw new BadRequestError(
          "Unsupported file — only JPEG, PNG, or WebP images are allowed",
        );
      }

      const rawSvg = await vectorize(bytes, sniffed as VectorizerSourceMime);

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
    } finally {
      await removeTempSource(sourcePath);
    }
  } catch (error) {
    return errorHandler(error);
  }
}
