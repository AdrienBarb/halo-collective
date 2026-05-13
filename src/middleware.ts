import { NextRequest, NextResponse } from "next/server";
import { trackingParamsSchema } from "@/lib/schemas/trackingParams";
import { isProduction } from "@/utils/environments";
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE_SECONDS,
} from "@/lib/constants/attribution";

export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  // First-touch: never overwrite an existing attribution.
  if (request.cookies.has(ATTRIBUTION_COOKIE)) {
    return response;
  }

  // Last-write-wins on duplicate keys — matches how Meta / TikTok ad platforms
  // append (rather than replace) UTM params on already-tagged destination URLs.
  const source = request.nextUrl.searchParams.getAll("halo_utm_source").at(-1);
  const campaign = request.nextUrl.searchParams
    .getAll("halo_utm_campaign")
    .at(-1);
  if (!source && !campaign) {
    return response;
  }

  const candidate = {
    ...(source ? { halo_utm_source: source } : {}),
    ...(campaign ? { halo_utm_campaign: campaign } : {}),
  };
  const parsed = trackingParamsSchema.safeParse(candidate);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return response;
  }

  response.cookies.set({
    name: ATTRIBUTION_COOKIE,
    value: JSON.stringify(parsed.data),
    maxAge: ATTRIBUTION_MAX_AGE_SECONDS,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!api/|_next/|_vercel/|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\..*).*)",
  ],
};
