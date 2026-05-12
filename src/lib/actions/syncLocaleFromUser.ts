"use server";

import { cookies, headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { LOCALE_COOKIE, isLocale } from "@/i18n/locales";

export async function syncLocaleFromUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userLocale = (session?.user as { locale?: string } | undefined)?.locale;
  if (!isLocale(userLocale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, userLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
