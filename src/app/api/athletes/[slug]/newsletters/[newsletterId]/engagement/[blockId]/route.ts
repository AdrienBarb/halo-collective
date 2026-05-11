import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { engagementResponseSchema } from "@/lib/schemas/engagementResponse";
import { checkOrigin } from "@/lib/security/checkOrigin";
import { getAthleteBySlug } from "@/lib/services/athlete";
import {
  getBlockEngagement,
  submitEngagementResponse,
} from "@/lib/services/fanEngagement";
import { isSubscribedToAthlete } from "@/lib/services/subscription";

type Context = {
  params: Promise<{ slug: string; newsletterId: string; blockId: string }>;
};

async function requireSubscribedUser(
  req: NextRequest,
  slug: string,
): Promise<{ userId: string; athleteId: string } | NextResponse> {
  const [session, athlete] = await Promise.all([
    auth.api.getSession({ headers: req.headers }),
    getAthleteBySlug(slug),
  ]);

  if (!session?.user) {
    return NextResponse.json(
      { error: errorMessages.UNAUTHORIZED },
      { status: 401 },
    );
  }
  if (!athlete) {
    return NextResponse.json(
      { error: errorMessages.NOT_FOUND },
      { status: 404 },
    );
  }

  const subscribed = await isSubscribedToAthlete(session.user.id, athlete.id);
  if (!subscribed) {
    return NextResponse.json(
      { error: errorMessages.NOT_SUBSCRIBED },
      { status: 403 },
    );
  }

  return { userId: session.user.id, athleteId: athlete.id };
}

export async function GET(req: NextRequest, ctx: Context) {
  try {
    const { slug, newsletterId, blockId } = await ctx.params;
    const gate = await requireSubscribedUser(req, slug);
    if (gate instanceof NextResponse) return gate;

    const snapshot = await getBlockEngagement({
      athleteSlug: slug,
      newsletterId,
      blockId,
      userId: gate.userId,
    });

    return NextResponse.json(snapshot, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const origin = checkOrigin(req);
    if (!origin.ok) return origin.response;

    const { slug, newsletterId, blockId } = await ctx.params;
    const gate = await requireSubscribedUser(req, slug);
    if (gate instanceof NextResponse) return gate;

    const body = await req.json().catch(() => ({}));
    const payload = engagementResponseSchema.parse(body);

    const snapshot = await submitEngagementResponse({
      athleteSlug: slug,
      newsletterId,
      blockId,
      userId: gate.userId,
      payload,
    });

    return NextResponse.json(snapshot, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}
