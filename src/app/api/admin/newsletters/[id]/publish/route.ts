import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { errorHandler } from "@/lib/errors/errorHandler";
import { publishNewsletter } from "@/lib/services/newsletter";
import { checkRateLimit } from "@/lib/ratelimit/checkRateLimit";
import { emailLimiter } from "@/lib/ratelimit/client";

type Context = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Context) {
  try {
    // Pre-admin-auth belt-and-suspenders: this endpoint triggers paid Brevo sends.
    const rateLimit = await checkRateLimit(req, emailLimiter);
    if (!rateLimit.success) return rateLimit.response;

    const { id } = await ctx.params;
    const newsletter = await publishNewsletter(id);
    revalidatePath(`/${newsletter.athlete.slug}`, "layout");
    revalidatePath(`/${newsletter.athlete.slug}/${newsletter.slug}`);
    return NextResponse.json(newsletter);
  } catch (error) {
    return errorHandler(error);
  }
}
