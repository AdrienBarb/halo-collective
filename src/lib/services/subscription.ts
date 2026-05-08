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

function composePhone(
  dialCode: string | undefined,
  number: string | undefined,
): string | null {
  if (!dialCode || !number) return null;
  let digits = number.replace(/\s+/g, "");
  // National trunk prefix "0" is dropped when going international (e.g. BE
  // "0470…" → "+32470…"). Don't strip "00" — that's an old intl prefix.
  if (digits.startsWith("0") && !digits.startsWith("00")) {
    digits = digits.slice(1);
  }
  return `${dialCode}${digits}`;
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
    phoneCountryCode,
    phoneNumber,
    partnerOffersConsent,
    source,
  } = args;

  const athlete = await getAthleteBySlug(athleteSlug);
  if (!athlete) {
    throw new NotFoundError("Athlete not found");
  }

  const brevoListId = await ensureAthleteList(athlete);
  const phone = composePhone(phoneCountryCode, phoneNumber);
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
        phone,
        emailVerified: false,
      },
      update: {
        name: fullName,
        firstName,
        lastName,
        countryCode,
        phone,
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
