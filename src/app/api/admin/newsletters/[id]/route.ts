import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import { updateNewsletterSchema } from "@/lib/schemas/newsletter";
import {
  deleteNewsletter,
  getNewsletterById,
  updateNewsletter,
} from "@/lib/services/newsletter";
import { NotFoundError } from "@/lib/errors/AppError";

type Context = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Context) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const { id } = await ctx.params;
    const before = await getNewsletterById(id);
    if (!before) throw new NotFoundError("Newsletter not found");

    const body = await req.json();
    const data = updateNewsletterSchema.parse(body);
    const newsletter = await updateNewsletter(id, data);
    void before;

    revalidatePath(`/${newsletter.athlete.slug}`, "layout");
    return NextResponse.json(newsletter);
  } catch (error) {
    return errorHandler(error);
  }
}

export async function DELETE(_req: NextRequest, ctx: Context) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const { id } = await ctx.params;
    const deleted = await deleteNewsletter(id);
    revalidatePath(`/${deleted.athlete.slug}`, "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorHandler(error);
  }
}
