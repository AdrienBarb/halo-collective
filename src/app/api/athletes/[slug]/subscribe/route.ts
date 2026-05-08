import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { checkOrigin } from "@/lib/security/checkOrigin";
import { subscribeSchema } from "@/lib/schemas/subscription";
import { subscribeToAthlete } from "@/lib/services/subscription";

type Context = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const origin = checkOrigin(req);
    if (!origin.ok) return origin.response;

    const { slug: rawSlug } = await ctx.params;
    const slug = rawSlug.trim().toLowerCase();
    const body = await req.json();
    const validated = subscribeSchema.parse(body);

    const result = await subscribeToAthlete({ athleteSlug: slug, ...validated });

    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
