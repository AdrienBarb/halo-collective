import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import { createAthleteSchema } from "@/lib/schemas/athlete";
import { createAthlete, listAllForAdmin } from "@/lib/services/athlete";

export async function GET() {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const athletes = await listAllForAdmin();
    return NextResponse.json(athletes);
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const body = await req.json();
    const data = createAthleteSchema.parse(body);
    const athlete = await createAthlete(data);
    return NextResponse.json(athlete, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
