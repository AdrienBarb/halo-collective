import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors/errorHandler";
import { renderNewsletterHtml } from "@/lib/services/newsletter";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Context) {
  try {
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
