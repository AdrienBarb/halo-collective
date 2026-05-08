import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { ensureAthleteList } from "@/lib/brevo/lists";
import { upsertContact } from "@/lib/brevo/contacts";
import { getAthleteBySlug } from "@/lib/services/athlete";
import { sendWelcomeEmail } from "@/lib/resend/sendWelcomeEmail";
import { NotFoundError } from "@/lib/errors/AppError";
import type { SubscribeOutput } from "@/lib/schemas/subscription";

interface SubscribeArgs extends SubscribeOutput {
  athleteSlug: string;
}

interface SubscribeResult {
  subscriptionId: string;
  userId: string;
}

export async function subscribeToAthlete(
  args: SubscribeArgs,
): Promise<SubscribeResult> {
  const {
    athleteSlug,
    firstName,
    lastName,
    email,
    countryCode,
    phone,
    partnerOffersConsent,
    source,
  } = args;

  const athlete = await getAthleteBySlug(athleteSlug);
  if (!athlete) {
    throw new NotFoundError("Athlete not found");
  }

  const brevoListId = await ensureAthleteList(athlete);
  const fullName = `${firstName} ${lastName}`;

  // DB writes first, in a single transaction. If Brevo later fails, our
  // consent record is still durable — we reconcile contact ids on retry.
  const { userId, subscriptionId } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email },
      create: {
        id: randomUUID(),
        email,
        name: fullName,
        firstName,
        lastName,
        countryCode,
        phone: phone ?? null,
        emailVerified: false,
      },
      update: {
        name: fullName,
        firstName,
        lastName,
        countryCode,
        // Only overwrite phone when the user actually provided one.
        // Preserves any number captured in a prior subscribe.
        ...(phone !== undefined && { phone }),
      },
      select: { id: true },
    });

    const subscription = await tx.newsletterSubscription.upsert({
      where: { userId_athleteId: { userId: user.id, athleteId: athlete.id } },
      create: {
        userId: user.id,
        athleteId: athlete.id,
        source,
        partnerOffersConsent,
      },
      update: {
        partnerOffersConsent,
        unsubscribedAt: null,
      },
      select: { id: true },
    });

    return { userId: user.id, subscriptionId: subscription.id };
  });

  const brevoContactId = await upsertContact({
    email,
    listIds: [brevoListId],
    attributes: {
      FIRSTNAME: firstName,
      LASTNAME: lastName,
      COUNTRY: countryCode,
    },
  });

  await prisma.newsletterSubscription.update({
    where: { id: subscriptionId },
    data: { brevoContactId: String(brevoContactId) },
  });

  // Fire-and-forget: a Resend hiccup must not 502 the subscribe.
  sendWelcomeEmail({
    email,
    firstName,
    athleteFirstName: athlete.firstName,
    athleteLastName: athlete.lastName,
    athleteSlug: athlete.slug,
  }).catch((error: unknown) => {
    console.error(
      JSON.stringify({
        scope: "subscribe.welcome_email_failed",
        email,
        error: String(error),
      }),
    );
  });

  return { subscriptionId, userId };
}
