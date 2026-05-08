import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { errorHandler } from "@/lib/errors/errorHandler";
import { unpublishNewsletter } from "@/lib/services/newsletter";

type Context = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: Context) {
  try {
    const { id } = await ctx.params;
    const newsletter = await unpublishNewsletter(id);
    revalidatePath(`/${newsletter.athlete.slug}`, "layout");
    revalidatePath(`/${newsletter.athlete.slug}/${newsletter.slug}`);
    return NextResponse.json(newsletter);
  } catch (error) {
    return errorHandler(error);
  }
}
