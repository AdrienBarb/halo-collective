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
  const origin =
    req.headers.get("origin") ??
    (req.headers.get("referer")
      ? new URL(req.headers.get("referer")!).origin
      : null);

  if (!origin || !allowedOrigins().includes(origin)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true };
}
