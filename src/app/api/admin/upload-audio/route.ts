import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import { BadRequestError } from "@/lib/errors/AppError";
import { createSignedMediaUpload } from "@/lib/storage/signedUpload";
import {
  AUDIO_MIME_ALLOWLIST,
  EXTENSION_BY_MIME,
} from "@/lib/storage/mimeSniff";

const bodySchema = z.object({
  contentType: z.enum(AUDIO_MIME_ALLOWLIST),
});

export async function POST(req: NextRequest) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new BadRequestError(
        "Unsupported file — only MP3, M4A, WAV, or WebM audio is allowed",
      );
    }

    const { contentType } = parsed.data;
    const ext = EXTENSION_BY_MIME[contentType];
    const filename = `${randomUUID()}.${ext}`;

    const signed = await createSignedMediaUpload({
      pathPrefix: "admin/audio",
      filename,
    });

    return NextResponse.json(signed, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
