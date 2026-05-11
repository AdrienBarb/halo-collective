import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import { updateAthleteSchema } from "@/lib/schemas/athlete";
import {
  deleteAthlete,
  getAthleteById,
  updateAthlete,
} from "@/lib/services/athlete";
import { NotFoundError } from "@/lib/errors/AppError";

type Context = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Context) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const { id } = await ctx.params;
    const before = await getAthleteById(id);
    if (!before) throw new NotFoundError("Athlete not found");

    const body = await req.json();
    const data = updateAthleteSchema.parse(body);
    const athlete = await updateAthlete(id, data);

    revalidatePath(`/${before.slug}`, "layout");
    if (athlete.slug !== before.slug) {
      revalidatePath(`/${athlete.slug}`, "layout");
    }
    return NextResponse.json(athlete);
  } catch (error) {
    return errorHandler(error);
  }
}

export async function DELETE(_req: NextRequest, ctx: Context) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const { id } = await ctx.params;
    const deleted = await deleteAthlete(id);
    revalidatePath(`/${deleted.slug}`, "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorHandler(error);
  }
}
