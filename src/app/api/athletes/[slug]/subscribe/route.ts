import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { auth } from "@/lib/better-auth/auth";
import { prisma } from "@/lib/db/prisma";
import { errorHandler } from "@/lib/errors/errorHandler";
import { EmailAlreadyExistsError } from "@/lib/errors/AppError";
import { checkOrigin } from "@/lib/security/checkOrigin";
import {
  subscribeSchema,
  subscribeAuthSchema,
} from "@/lib/schemas/subscription";
import { createSubscription } from "@/lib/services/subscription";

type Context = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const { slug: rawSlug } = await ctx.params;
    const slug = rawSlug.trim().toLowerCase();

    console.info(
      JSON.stringify({
        scope: "subscribe.request",
        slug,
        origin: req.headers.get("origin"),
        referer: req.headers.get("referer"),
        host: req.headers.get("host"),
        xForwardedHost: req.headers.get("x-forwarded-host"),
      }),
    );

    const origin = checkOrigin(req);
    if (!origin.ok) {
      console.warn(
        JSON.stringify({ scope: "subscribe.blocked_by_origin", slug }),
      );
      return origin.response;
    }

    const body = await req.json().catch(() => ({}));

    const session = await auth.api.getSession({ headers: req.headers });

    // ── Authenticated path: skip signup, just create the subscription ──
    if (session?.user) {
      const validated = subscribeAuthSchema.parse(body);
      const result = await createSubscription({
        userId: session.user.id,
        athleteSlug: slug,
        partnerOffersConsent: validated.partnerOffersConsent,
        source: validated.source,
        profilePatch: {
          firstName: validated.firstName,
          lastName: validated.lastName,
          countryCode: validated.countryCode,
          phone: validated.phone,
        },
      });
      return NextResponse.json({ ok: true, ...result }, { status: 201 });
    }

    // ── Anonymous path: signUpEmail (auto-signs in), then subscribe ──
    const validated = subscribeSchema.parse(body);

    const signUpResponse = await auth.api.signUpEmail({
      body: {
        email: validated.email,
        password: randomBytes(32).toString("hex"),
        name: `${validated.firstName} ${validated.lastName}`,
        firstName: validated.firstName,
        lastName: validated.lastName,
        countryCode: validated.countryCode,
        ...(validated.phone ? { phone: validated.phone } : {}),
      },
      asResponse: true,
    });

    if (!signUpResponse.ok) {
      const errorBody = (await signUpResponse
        .json()
        .catch(() => ({}))) as { code?: string };
      if (
        errorBody.code === "USER_ALREADY_EXISTS" ||
        errorBody.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
      ) {
        throw new EmailAlreadyExistsError();
      }
      console.error(
        JSON.stringify({
          scope: "subscribe.signup_failed",
          status: signUpResponse.status,
          code: errorBody.code,
        }),
      );
      throw new Error("Sign up failed");
    }

    const signUpData = (await signUpResponse.json()) as {
      user: { id: string };
    };

    let result;
    try {
      result = await createSubscription({
        userId: signUpData.user.id,
        athleteSlug: slug,
        partnerOffersConsent: validated.partnerOffersConsent,
        source: validated.source,
      });
    } catch (subscriptionError) {
      // Roll back the just-created Better Auth user so the visitor can retry
      // without hitting USER_ALREADY_EXISTS on a phantom orphan.
      await prisma.user
        .delete({ where: { id: signUpData.user.id } })
        .catch((cleanupError: unknown) => {
          console.error(
            JSON.stringify({
              scope: "subscribe.user_cleanup_failed",
              userId: signUpData.user.id,
              error: String(cleanupError),
            }),
          );
        });
      throw subscriptionError;
    }

    const out = NextResponse.json({ ok: true, ...result }, { status: 201 });
    for (const cookie of signUpResponse.headers.getSetCookie()) {
      out.headers.append("Set-Cookie", cookie);
    }
    return out;
  } catch (error) {
    return errorHandler(error);
  }
}
