import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { renderNewsletterHtml } from "@/lib/services/newsletter";
import { checkRateLimit } from "@/lib/ratelimit/checkRateLimit";
import { publicLimiter } from "@/lib/ratelimit/client";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Context) {
  try {
    const rateLimit = await checkRateLimit(req, publicLimiter);
    if (!rateLimit.success) return rateLimit.response;

    const { id } = await ctx.params;
    const html = await renderNewsletterHtml(id);
    return new NextResponse(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        // Defense-in-depth: this endpoint serves admin-only newsletter HTML.
        "content-security-policy": "sandbox",
        "x-frame-options": "DENY",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    return errorHandler(error);
  }
}
