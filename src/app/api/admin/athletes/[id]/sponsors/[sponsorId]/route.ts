import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import { updateSponsorSchema } from "@/lib/schemas/sponsor";
import {
  deleteSponsor,
  updateSponsor,
} from "@/lib/services/sponsor";
import { getAthleteById } from "@/lib/services/athlete";
import { NotFoundError } from "@/lib/errors/AppError";

type Context = { params: Promise<{ id: string; sponsorId: string }> };

export async function PUT(req: NextRequest, ctx: Context) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const { id, sponsorId } = await ctx.params;
    const athlete = await getAthleteById(id);
    if (!athlete) throw new NotFoundError("Athlete not found");

    const body = await req.json();
    const data = updateSponsorSchema.parse(body);
    const sponsor = await updateSponsor(id, sponsorId, data);

    revalidatePath(`/${athlete.slug}`, "layout");
    return NextResponse.json(sponsor);
  } catch (error) {
    return errorHandler(error);
  }
}

export async function DELETE(_req: NextRequest, ctx: Context) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const { id, sponsorId } = await ctx.params;
    const athlete = await getAthleteById(id);
    if (!athlete) throw new NotFoundError("Athlete not found");

    await deleteSponsor(id, sponsorId);

    revalidatePath(`/${athlete.slug}`, "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorHandler(error);
  }
}
