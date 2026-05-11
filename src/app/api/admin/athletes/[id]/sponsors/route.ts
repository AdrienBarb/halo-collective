import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import { createSponsorSchema } from "@/lib/schemas/sponsor";
import {
  createSponsor,
  listByAthleteId,
} from "@/lib/services/sponsor";
import { getAthleteById } from "@/lib/services/athlete";
import { NotFoundError } from "@/lib/errors/AppError";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Context) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const { id } = await ctx.params;
    const sponsors = await listByAthleteId(id);
    return NextResponse.json(sponsors);
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const { id } = await ctx.params;
    const athlete = await getAthleteById(id);
    if (!athlete) throw new NotFoundError("Athlete not found");

    const body = await req.json();
    const data = createSponsorSchema.parse(body);
    const sponsor = await createSponsor(id, data);

    revalidatePath(`/${athlete.slug}`, "layout");
    return NextResponse.json(sponsor, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
