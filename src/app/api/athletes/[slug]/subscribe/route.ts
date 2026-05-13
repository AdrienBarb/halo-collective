import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { checkOrigin } from "@/lib/security/checkOrigin";
import { subscribeAuthSchema } from "@/lib/schemas/subscription";
import { createSubscription } from "@/lib/services/subscription";

type Context = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const { slug: rawSlug } = await ctx.params;
    const slug = rawSlug.trim().toLowerCase();

    const origin = checkOrigin(req);
    if (!origin.ok) {
      console.warn(
        JSON.stringify({ scope: "subscribe.blocked_by_origin", slug }),
      );
      return origin.response;
    }

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: errorMessages.UNAUTHORIZED },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const validated = subscribeAuthSchema.parse(body);

    const result = await createSubscription({
      userId: session.user.id,
      athleteSlug: slug,
      partnerOffersConsent: validated.partnerOffersConsent,
      profilePatch: {
        firstName: validated.firstName,
        lastName: validated.lastName,
        countryCode: validated.countryCode,
        phone: validated.phone,
      },
    });

    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
