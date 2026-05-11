import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import { generateNewsletter } from "@/lib/anthropic/generateNewsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const generateRequestSchema = z.object({
  input: z.string().min(1).max(100_000),
});

export async function POST(req: NextRequest) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const body = await req.json();
    const { input } = generateRequestSchema.parse(body);
    const result = await generateNewsletter(input, { signal: req.signal });
    return NextResponse.json(result);
  } catch (error) {
    return errorHandler(error);
  }
}
