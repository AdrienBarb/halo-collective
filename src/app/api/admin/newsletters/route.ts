import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import { createNewsletterSchema } from "@/lib/schemas/newsletter";
import {
  createNewsletter,
  listAllByAthleteId,
  listAllForAdmin,
} from "@/lib/services/newsletter";

export async function GET(req: NextRequest) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const athleteId = req.nextUrl.searchParams.get("athleteId");
    const newsletters = athleteId
      ? await listAllByAthleteId(athleteId)
      : await listAllForAdmin();
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
