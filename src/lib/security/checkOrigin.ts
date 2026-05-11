import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function allowedOrigins(): string[] {
  const list = [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NODE_ENV === "production" ? null : "http://localhost:3000",
  ].filter((v): v is string => !!v);
  return list.map((u) => new URL(u).origin);
}

// Lightweight CSRF defense for state-changing public POSTs.
// Browsers always send Origin on cross-origin POSTs; same-origin form fetches
// match. Old browsers/non-browser clients without Origin/Referer are rejected.
export function checkOrigin(req: NextRequest):
  | { ok: true }
  | { ok: false; response: NextResponse } {
  const rawOrigin = req.headers.get("origin");
  const rawReferer = req.headers.get("referer");
  const origin =
    rawOrigin ??
    (rawReferer ? new URL(rawReferer).origin : null);

  const allowed = allowedOrigins();

  if (!origin || !allowed.includes(origin)) {
    console.warn(
      JSON.stringify({
        scope: "checkOrigin.rejected",
        url: req.url,
        method: req.method,
        rawOrigin,
        rawReferer,
        resolvedOrigin: origin,
        allowed,
        envBetterAuthUrl: process.env.BETTER_AUTH_URL ?? null,
        envPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? null,
        host: req.headers.get("host"),
        xForwardedHost: req.headers.get("x-forwarded-host"),
        xForwardedProto: req.headers.get("x-forwarded-proto"),
      }),
    );
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  console.info(
    JSON.stringify({
      scope: "checkOrigin.accepted",
      url: req.url,
      resolvedOrigin: origin,
    }),
  );

  return { ok: true };
}
