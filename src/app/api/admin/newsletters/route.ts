import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import { createNewsletterSchema } from "@/lib/schemas/newsletter";
import {
  createNewsletter,
  listAllByAthleteId,
} from "@/lib/services/newsletter";

export async function GET(req: NextRequest) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const athleteId = req.nextUrl.searchParams.get("athleteId");
    if (!athleteId) {
      return NextResponse.json(
        { error: "athleteId is required" },
        { status: 400 },
      );
    }
    const newsletters = await listAllByAthleteId(athleteId);
    return NextResponse.json(newsletters);
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const body = await req.json();
    const data = createNewsletterSchema.parse(body);
    const newsletter = await createNewsletter(data);
    return NextResponse.json(newsletter, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
