import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import {
  cloneFromPreviousEdition,
  getNewsletterById,
} from "@/lib/services/newsletter";
import { NotFoundError } from "@/lib/errors/AppError";

type Context = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: Context) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const { id } = await ctx.params;
    const source = await getNewsletterById(id);
    if (!source) throw new NotFoundError("Newsletter not found");

    const clone = await cloneFromPreviousEdition(source.athleteId);

    revalidatePath(`/${source.athlete.slug}`, "layout");
    return NextResponse.json(clone, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
