import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import {
  buildDraftPreview,
  draftPayloadSchema,
} from "@/lib/services/newsletterDraftPreview";

export async function POST(req: NextRequest) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const body = await req.json();
    const parsed = draftPayloadSchema.parse(body);
    const { athlete, newsletter, emailHtml } = await buildDraftPreview(parsed);

    return NextResponse.json({ athlete, newsletter, emailHtml });
  } catch (error) {
    return errorHandler(error);
  }
}
