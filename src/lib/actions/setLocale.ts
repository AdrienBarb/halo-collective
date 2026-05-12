"use server";

import { cookies, headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { prisma } from "@/lib/db/prisma";
import { LOCALE_COOKIE, isLocale, type Locale } from "@/i18n/locales";

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return;
  const existing = (session.user as { locale?: string }).locale;
  if (existing === locale) return;
  await prisma.user.update({
    where: { id: session.user.id },
    data: { locale },
  });
}
