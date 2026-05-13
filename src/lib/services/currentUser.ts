import { cache } from "react";
import { headers } from "next/headers";
import { UserRole } from "@prisma/client";
import { auth } from "@/lib/better-auth/auth";
import { prisma } from "@/lib/db/prisma";
import { getCountryFromHeaders } from "@/lib/utils/getCountryFromHeaders";

export type CurrentUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  onboardingCompleted: boolean;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      countryCode: true,
      role: true,
      onboardingCompleted: true,
    },
  });
  if (!user) return null;

  // Fire-and-forget: backfill countryCode for users that didn't supply it at
  // signup (Google OAuth, mostly). We never block the render on this write.
  if (!user.countryCode) {
    const ipCountry = getCountryFromHeaders(h);
    if (ipCountry) {
      void prisma.user
        .update({ where: { id: user.id }, data: { countryCode: ipCountry } })
        .catch((error: unknown) => {
          console.error(
            JSON.stringify({
              scope: "currentUser.country_backfill_failed",
              userId: user.id,
              error: String(error),
            }),
          );
        });
    }
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    onboardingCompleted: user.onboardingCompleted,
  };
});

export async function getAdminUser(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  return user?.role === UserRole.ADMIN ? user : null;
}
