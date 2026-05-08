import { cache } from "react";
import { NewsletterStatus, Prisma } from "@prisma/client";
import type { Athlete, Newsletter } from "@prisma/client";
import { render } from "@react-email/render";
import { prisma } from "@/lib/db/prisma";
import type {
  CreateNewsletterOutput,
  UpdateNewsletterOutput,
} from "@/lib/schemas/newsletter";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/lib/errors/AppError";
import { NewsletterEmail } from "@/lib/emails/NewsletterEmail";
import { upsertContact } from "@/lib/brevo/contacts";
import { createCampaign, sendCampaignNow } from "@/lib/brevo/campaigns";
import { getRequiredEnv, getRequiredEnvInt } from "@/lib/utils/env";

const MAX_CREATE_ATTEMPTS = 50;

export const listPublishedByAthleteId = cache(async (athleteId: string) => {
  return prisma.newsletter.findMany({
    where: {
      athleteId,
      status: NewsletterStatus.PUBLISHED,
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: { sort: "desc", nulls: "last" } },
  });
});

export const getPublishedNewsletterBySlugs = cache(
  async (athleteSlug: string, editionSlug: string) => {
    return prisma.newsletter.findFirst({
      where: {
        slug: editionSlug,
        status: NewsletterStatus.PUBLISHED,
        athlete: { slug: athleteSlug },
      },
      include: { athlete: true },
    });
  },
);

export async function listAllByAthleteId(athleteId: string) {
  return prisma.newsletter.findMany({
    where: { athleteId },
    orderBy: [{ editionNumber: "desc" }],
  });
}

export async function getNewsletterById(id: string) {
  return prisma.newsletter.findUnique({
    where: { id },
    include: { athlete: { select: { slug: true } } },
  });
}

export async function createNewsletter(input: CreateNewsletterOutput) {
  const { athleteId, title, slug: baseSlug, body, heroImageUrl } = input;

  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    select: { id: true },
  });
  if (!athlete) {
    throw new NotFoundError("Athlete not found");
  }

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    try {
      return await prisma.$transaction(async (tx) => {
        const last = await tx.newsletter.findFirst({
          where: { athleteId },
          orderBy: { editionNumber: "desc" },
          select: { editionNumber: true },
        });
        const editionNumber = (last?.editionNumber ?? 0) + 1;

        return tx.newsletter.create({
          data: {
            athleteId,
            title,
            slug,
            body,
            heroImageUrl,
            editionNumber,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = (error.meta?.target as string[] | undefined) ?? [];
        if (target.includes("slug") || target.includes("editionNumber")) {
          continue;
        }
      }
      throw error;
    }
  }
  throw new ConflictError("Could not create newsletter — please retry");
}

export async function updateNewsletter(
  id: string,
  input: UpdateNewsletterOutput,
) {
  try {
    return await prisma.newsletter.update({
      where: { id },
      data: {
        title: input.title,
        slug: input.slug,
        heroImageUrl: input.heroImageUrl,
        body: input.body,
      },
      include: { athlete: { select: { slug: true } } },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictError(
          "A newsletter with this slug already exists for this athlete",
        );
      }
      if (error.code === "P2025") {
        throw new NotFoundError("Newsletter not found");
      }
    }
    throw error;
  }
}

type NewsletterWithAthlete = Newsletter & { athlete: Athlete };

interface BrevoConfig {
  senderEmail: string;
  testEmail: string;
  testListId: number;
}

function logBrevo(event: string, data: Record<string, unknown>) {
  console.log(JSON.stringify({ scope: "brevo.publish", event, ...data }));
}

function loadBrevoConfig(): BrevoConfig {
  return {
    senderEmail: getRequiredEnv("BREVO_SENDER_EMAIL"),
    testEmail: getRequiredEnv("BREVO_TEST_EMAIL"),
    testListId: getRequiredEnvInt("BREVO_TEST_LIST_ID"),
  };
}

async function loadNewsletterWithAthlete(
  id: string,
): Promise<NewsletterWithAthlete> {
  const newsletter = await prisma.newsletter.findUnique({
    where: { id },
    include: { athlete: true },
  });
  if (!newsletter) {
    throw new NotFoundError("Newsletter not found");
  }
  return newsletter;
}

async function renderNewsletterEmail(
  newsletter: NewsletterWithAthlete,
): Promise<string> {
  try {
    return await render(
      NewsletterEmail({
        title: newsletter.title,
        body: newsletter.body,
        heroImageUrl: newsletter.heroImageUrl,
        editionNumber: newsletter.editionNumber,
        athleteName: `${newsletter.athlete.firstName} ${newsletter.athlete.lastName}`,
      }),
    );
  } catch (error) {
    throw new BadRequestError(
      `Newsletter content failed to render: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }
}

export async function renderNewsletterHtml(id: string): Promise<string> {
  const newsletter = await loadNewsletterWithAthlete(id);
  return renderNewsletterEmail(newsletter);
}

/**
 * Atomic claim: only succeeds if row is still DRAFT with no prior brevoCampaignId.
 * Locks the row out of concurrent publish attempts by transitioning to SENDING.
 */
async function claimForSending(
  id: string,
  renderedHtml: string,
): Promise<void> {
  const { count } = await prisma.newsletter.updateMany({
    where: {
      id,
      status: NewsletterStatus.DRAFT,
      brevoCampaignId: null,
    },
    data: {
      status: NewsletterStatus.SENDING,
      renderedHtml,
    },
  });
  if (count !== 1) {
    throw new ConflictError(
      "Newsletter is not in a publishable state (already sending or published)",
    );
  }
}

async function markPublished(
  id: string,
  campaignId: number,
): Promise<NewsletterWithAthlete> {
  const now = new Date();
  return prisma.newsletter.update({
    where: { id },
    data: {
      status: NewsletterStatus.PUBLISHED,
      publishedAt: now,
      brevoSentAt: now,
      brevoCampaignId: String(campaignId),
    },
    include: { athlete: true },
  });
}

async function republishWithoutResending(
  id: string,
  previouslyPublishedAt: Date | null,
) {
  return prisma.newsletter.update({
    where: { id },
    data: {
      status: NewsletterStatus.PUBLISHED,
      publishedAt: previouslyPublishedAt ?? new Date(),
    },
    include: { athlete: { select: { slug: true } } },
  });
}

export async function publishNewsletter(id: string) {
  const newsletter = await loadNewsletterWithAthlete(id);

  if (newsletter.status === NewsletterStatus.PUBLISHED) {
    throw new ConflictError("Newsletter is already published");
  }
  if (newsletter.status === NewsletterStatus.SENDING) {
    throw new ConflictError(
      "Publish in progress or stuck — check Brevo and reset the row manually",
    );
  }

  // Re-publishing a previously-sent edition: never re-send to subscribers.
  if (newsletter.brevoCampaignId) {
    return republishWithoutResending(id, newsletter.publishedAt);
  }

  const config = loadBrevoConfig();
  const athleteName = `${newsletter.athlete.firstName} ${newsletter.athlete.lastName}`;
  const renderedHtml = await renderNewsletterEmail(newsletter);

  await claimForSending(id, renderedHtml);
  logBrevo("claimed", { newsletterId: id });

  // Fire-and-forget — the contact id isn't on the publish critical path.
  upsertContact({ email: config.testEmail, listIds: [config.testListId] }).catch(
    (error: unknown) =>
      logBrevo("upsert_contact_failed", { newsletterId: id, error: String(error) }),
  );

  const campaignId = await createCampaign({
    name: `${athleteName} — Edition #${newsletter.editionNumber} (${newsletter.slug})`,
    subject: newsletter.title,
    htmlContent: renderedHtml,
    sender: { name: athleteName, email: config.senderEmail },
    listIds: [config.testListId],
    replyTo: config.senderEmail,
  });
  logBrevo("campaign_created", { newsletterId: id, campaignId });

  // Persist campaign id BEFORE sendNow — if sendNow times out we know the id
  // and can recover without creating a duplicate campaign.
  await prisma.newsletter.update({
    where: { id },
    data: { brevoCampaignId: String(campaignId) },
  });

  await sendCampaignNow(campaignId);
  logBrevo("campaign_sent", { newsletterId: id, campaignId });

  try {
    return await markPublished(id, campaignId);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Newsletter not found");
    }
    throw error;
  }
}

export async function unpublishNewsletter(id: string) {
  // Only PUBLISHED rows may be unpublished — SENDING is locked.
  const { count } = await prisma.newsletter.updateMany({
    where: { id, status: NewsletterStatus.PUBLISHED },
    data: {
      status: NewsletterStatus.DRAFT,
      publishedAt: null,
    },
  });
  if (count !== 1) {
    const existing = await prisma.newsletter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Newsletter not found");
    throw new ConflictError(
      "Newsletter is not currently published (cannot unpublish)",
    );
  }
  return prisma.newsletter.findUniqueOrThrow({
    where: { id },
    include: { athlete: { select: { slug: true } } },
  });
}

export async function deleteNewsletter(id: string) {
  try {
    return await prisma.newsletter.delete({
      where: { id },
      include: { athlete: { select: { slug: true } } },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Newsletter not found");
    }
    throw error;
  }
}
