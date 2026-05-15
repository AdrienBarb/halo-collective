import { after } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ensureAthleteList } from "@/lib/brevo/lists";
import { upsertContact } from "@/lib/brevo/contacts";
import { getAthleteBySlug } from "@/lib/services/athlete";
import { listRecentPublishedEditionsByAthleteId } from "@/lib/services/newsletter";
import { sendWelcomeEmail } from "@/lib/resend/sendWelcomeEmail";
import { NotFoundError } from "@/lib/errors/AppError";
import { updateContactByEmail } from "@/lib/hubspot/contacts";
import { HALO_GDPR_VERSION } from "@/lib/constants/gdpr";

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
  consentIp?: string | null;
  profilePatch?: ProfilePatch;
}

interface CreateSubscriptionResult {
  subscriptionId: string;
  userId: string;
}

// Derives the HubSpot consent property name from the athlete's first name —
// e.g. "Arthur Rinderknech" → `halo_opt_in_arthur`. Sanitised to a-z0-9 so
// HubSpot accepts it as an internal property name. One property per athlete is
// intentional: GDPR requires consent be tied to a named recipient/list, so we
// can't roll all subscriptions into a single boolean.
function getAthleteConsentProperty(firstName: string): string {
  const slug = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `halo_opt_in_${slug}`;
}

interface SyncConsentInput {
  email: string;
  consentPropertyName: string;
  consentIp: string | null;
  athleteSlug: string;
}

// Identity fields (firstname/lastname/country) are pushed once at signup under
// legitimate-interest — see better-auth/auth.ts. This call only writes the
// consent record itself plus the marketable-status flip.
async function syncConsentToHubspot(input: SyncConsentInput): Promise<void> {
  const { email, consentPropertyName, consentIp, athleteSlug } = input;

  const properties: Record<string, string> = {
    [consentPropertyName]: "true",
    halo_opt_in_date: new Date().toISOString(),
    halo_gdpr_version: HALO_GDPR_VERSION,
    // Consent landed — this contact is now marketable. The signup hook set
    // it to NO; we flip to YES here. Idempotent on re-consent.
    hs_marketable_status: "YES",
    ...(consentIp ? { halo_opt_in_ip: consentIp } : {}),
  };

  try {
    await updateContactByEmail({ email, properties });
  } catch (error: unknown) {
    const errInfo =
      error instanceof Error
        ? { name: error.name, message: error.message }
        : { message: String(error) };
    console.error(
      JSON.stringify({
        scope: "subscribe.hubspot_consent_failed",
        athleteSlug,
        ...errInfo,
      }),
    );
  }
}

export async function createSubscription(
  args: CreateSubscriptionArgs,
): Promise<CreateSubscriptionResult> {
  const {
    userId,
    athleteSlug,
    partnerOffersConsent,
    consentIp,
    profilePatch,
  } = args;

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
        partnerOffersConsent,
        brevoContactId: String(brevoContactId),
      },
      select: { id: true },
    });
    subscriptionId = created.id;
    isNewSubscriber = true;
  }

  if (isNewSubscriber) {
    // Surface the most recent published editions so new fans can read the
    // back-catalogue from the welcome email. Failure here must not block the
    // welcome — fall back to an empty list.
    const recentEditions = await listRecentPublishedEditionsByAthleteId(
      athlete.id,
      3,
    ).catch(() => []);

    // Fire-and-forget: a Resend hiccup must not 502 the subscribe.
    sendWelcomeEmail({
      email: user.email,
      firstName: user.firstName ?? "",
      athleteFirstName: athlete.firstName,
      athleteLastName: athlete.lastName,
      athleteSlug: athlete.slug,
      coverImageUrl: athlete.coverImageUrl,
      socialLinks: athlete.socialLinks,
      welcomeMessage: athlete.welcomeMessage,
      sponsors: athlete.sponsors.map((s) => ({
        id: s.id,
        name: s.name,
        logoUrl: s.logoUrl,
        websiteUrl: s.websiteUrl,
      })),
      recentEditions: recentEditions.map((e) => ({
        slug: e.slug,
        title: e.title,
        editionNumber: e.editionNumber,
        editionDate: e.publishedAt,
      })),
      locale: user.locale,
    }).catch((error: unknown) => {
      // Allowlist the error fields we log — never spread `error` or the
      // welcomeMessage body, since either could leak athlete content or fan
      // email into stdout/PostHog.
      const errInfo =
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : { message: String(error) };
      console.error(
        JSON.stringify({
          scope: "subscribe.welcome_email_failed",
          athleteSlug: athlete.slug,
          userId,
          subscriptionId,
          ...errInfo,
        }),
      );
    });
  }

  // Stamp the HubSpot contact with the consent record — date + IP + GDPR
  // version are the GDPR-required audit trail. Always run (not just for new
  // subscribers) so re-consent after an unsubscribe gets a fresh timestamp.
  // after() keeps the serverless function alive until HubSpot returns.
  after(() =>
    syncConsentToHubspot({
      email: user.email,
      consentPropertyName: getAthleteConsentProperty(athlete.firstName),
      consentIp: consentIp ?? null,
      athleteSlug: athlete.slug,
    }),
  );

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
