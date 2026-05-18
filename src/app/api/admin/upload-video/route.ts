import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import { BadRequestError } from "@/lib/errors/AppError";
import { createSignedMediaUpload } from "@/lib/storage/signedUpload";
import {
  EXTENSION_BY_MIME,
  VIDEO_MIME_ALLOWLIST,
} from "@/lib/storage/mimeSniff";

const bodySchema = z.object({
  contentType: z.enum(VIDEO_MIME_ALLOWLIST),
});

export async function POST(req: NextRequest) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new BadRequestError(
        "Unsupported file — only MP4, WebM, or MOV video is allowed",
      );
    }

    const { contentType } = parsed.data;
    const ext = EXTENSION_BY_MIME[contentType];
    const filename = `${randomUUID()}.${ext}`;

    const signed = await createSignedMediaUpload({
      pathPrefix: "admin/video",
      filename,
    });

    return NextResponse.json(signed, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
