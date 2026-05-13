import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { onboardingPayloadSchema } from "@/lib/schemas/onboarding";
import { completeOnboarding } from "@/lib/services/onboarding";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { error: errorMessages.UNAUTHORIZED },
        { status: 401 },
      );
    }
    const data = onboardingPayloadSchema.parse(await req.json());
    const result = await completeOnboarding({
      userId: session.user.id,
      data,
    });
    return NextResponse.json(result);
  } catch (error) {
    return errorHandler(error);
  }
}
