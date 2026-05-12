import { prisma } from "@/lib/db/prisma";
import { ensureAthleteList } from "@/lib/brevo/lists";
import { upsertContact } from "@/lib/brevo/contacts";
import { getAthleteBySlug } from "@/lib/services/athlete";
import { sendWelcomeEmail } from "@/lib/resend/sendWelcomeEmail";
import { NotFoundError } from "@/lib/errors/AppError";

interface ProfilePatch {
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  phone?: string;
}

interface CreateSubscriptionArgs {
  userId: string;
  athleteSlug: string;
  partnerOffersConsent: boolean;
  source?: string;
  profilePatch?: ProfilePatch;
}

interface CreateSubscriptionResult {
  subscriptionId: string;
  userId: string;
}

export async function createSubscription(
  args: CreateSubscriptionArgs,
): Promise<CreateSubscriptionResult> {
  const { userId, athleteSlug, partnerOffersConsent, source, profilePatch } =
    args;

  const athlete = await getAthleteBySlug(athleteSlug);
  if (!athlete) {
    throw new NotFoundError("Athlete not found");
  }

  // Patch profile fields if provided (used after OTP-based sign-in to backfill
  // form values onto a previously-created user).
  const user = await prisma.user.update({
    where: { id: userId },
    data: profilePatch
      ? {
          ...(profilePatch.firstName ? { firstName: profilePatch.firstName } : {}),
          ...(profilePatch.lastName ? { lastName: profilePatch.lastName } : {}),
          ...(profilePatch.countryCode
            ? { countryCode: profilePatch.countryCode }
            : {}),
          ...(profilePatch.phone ? { phone: profilePatch.phone } : {}),
          ...(profilePatch.firstName && profilePatch.lastName
            ? { name: `${profilePatch.firstName} ${profilePatch.lastName}` }
            : {}),
        }
      : {},
    select: {
      email: true,
      firstName: true,
      lastName: true,
      countryCode: true,
      locale: true,
    },
  });

  const brevoListId = await ensureAthleteList(athlete);
  const brevoContactId = await upsertContact({
    email: user.email,
    listIds: [brevoListId],
    attributes: {
      FIRSTNAME: user.firstName ?? "",
      LASTNAME: user.lastName ?? "",
      COUNTRY: user.countryCode ?? "",
    },
  });

  // findUnique → create or update — so we can detect new vs returning and
  // only send the welcome email on first subscribe.
  const existing = await prisma.newsletterSubscription.findUnique({
    where: { userId_athleteId: { userId, athleteId: athlete.id } },
    select: { id: true, unsubscribedAt: true },
  });

  let subscriptionId: string;
  let isNewSubscriber: boolean;

  if (existing) {
    await prisma.newsletterSubscription.update({
      where: { id: existing.id },
      data: {
        partnerOffersConsent,
        unsubscribedAt: null,
        brevoContactId: String(brevoContactId),
      },
    });
    subscriptionId = existing.id;
    isNewSubscriber = existing.unsubscribedAt !== null;
  } else {
    const created = await prisma.newsletterSubscription.create({
      data: {
        userId,
        athleteId: athlete.id,
        source,
        partnerOffersConsent,
        brevoContactId: String(brevoContactId),
      },
      select: { id: true },
    });
    subscriptionId = created.id;
    isNewSubscriber = true;
  }

  if (isNewSubscriber) {
    // Fire-and-forget: a Resend hiccup must not 502 the subscribe.
    sendWelcomeEmail({
      email: user.email,
      firstName: user.firstName ?? "",
      athleteFirstName: athlete.firstName,
      athleteLastName: athlete.lastName,
      athleteSlug: athlete.slug,
      locale: user.locale,
    }).catch((error: unknown) => {
      console.error(
        JSON.stringify({
          scope: "subscribe.welcome_email_failed",
          error: String(error),
        }),
      );
    });
  }

  return { subscriptionId, userId };
}

export async function isSubscribedToAthlete(
  userId: string,
  athleteId: string,
): Promise<boolean> {
  const sub = await prisma.newsletterSubscription.findUnique({
    where: { userId_athleteId: { userId, athleteId } },
    select: { unsubscribedAt: true },
  });
  return Boolean(sub && sub.unsubscribedAt === null);
}

export interface UserSubscriptionListItem {
  id: string;
  subscribedAt: Date;
  athlete: {
    slug: string;
    firstName: string;
    lastName: string;
    tour: string | null;
    worldRank: number | null;
    countryCode: string;
    avatarUrl: string | null;
  };
}

const SUBSCRIPTION_LIST_LIMIT = 100;

export async function listSubscriptionsByUser(
  userId: string,
): Promise<UserSubscriptionListItem[]> {
  const startedAt = Date.now();
  const subscriptions = await prisma.newsletterSubscription.findMany({
    where: { userId, unsubscribedAt: null },
    select: {
      id: true,
      subscribedAt: true,
      athlete: {
        select: {
          slug: true,
          firstName: true,
          lastName: true,
          tour: true,
          worldRank: true,
          countryCode: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { subscribedAt: "desc" },
    take: SUBSCRIPTION_LIST_LIMIT,
  });

  console.info(
    JSON.stringify({
      scope: "subscription.list",
      userId,
      count: subscriptions.length,
      durationMs: Date.now() - startedAt,
    }),
  );

  return subscriptions;
}
