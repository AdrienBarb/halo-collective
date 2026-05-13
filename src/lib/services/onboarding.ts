import { prisma } from "@/lib/db/prisma";
import type { OnboardingPayload } from "@/lib/schemas/onboarding";

export async function completeOnboarding({
  userId,
  data,
}: {
  userId: string;
  data: OnboardingPayload;
}) {
  // updateMany with the `onboardingCompleted: false` predicate makes this
  // atomic and idempotent — once a user has onboarded, a second POST cannot
  // wipe their consent flags (contestOptIn / personalisationOptIn) or rewrite
  // their interests. Returns count=0 silently in that case.
  await prisma.user.updateMany({
    where: { id: userId, onboardingCompleted: false },
    data: {
      interestSports: data.sports,
      interestLifestyle: data.lifestyle,
      interestBrands: data.brands,
      onboardingCompleted: true,
    },
  });
  return { id: userId, onboardingCompleted: true };
}
