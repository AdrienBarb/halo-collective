import { cache } from "react";
import { NewsletterStatus, Prisma } from "@prisma/client";
import type { Athlete, DebriefSection, Newsletter } from "@prisma/client";
import { render } from "@react-email/render";
import { prisma } from "@/lib/db/prisma";
import type {
  CreateNewsletterOutput,
  DebriefOutput,
  UpdateNewsletterOutput,
} from "@/lib/schemas/newsletter";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/lib/errors/AppError";
import { NewsletterEmail } from "@/lib/emails/NewsletterEmail";
import { createCampaign, sendCampaignNow } from "@/lib/brevo/campaigns";
import { getRequiredEnv } from "@/lib/utils/env";
import config from "@/lib/config";

const MAX_CREATE_ATTEMPTS = 50;

function debriefCreateData(
  input: DebriefOutput,
): Prisma.DebriefSectionCreateWithoutNewsletterInput {
  return {
    body: input.body,
    pullQuote: input.pullQuote,
    pullQuoteContext: input.pullQuoteContext,
    voiceNoteUrl: input.voiceNoteUrl,
    voiceNoteDurationSec: input.voiceNoteDurationSec,
    voiceNoteLabel: input.voiceNoteLabel,
    voiceNoteLocation: input.voiceNoteLocation,
  };
}

export const listPublishedByAthleteId = cache(async (athleteId: string) => {
  return prisma.newsletter.findMany({
    where: {
      athleteId,
      status: NewsletterStatus.PUBLISHED,
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: { sort: "desc", nulls: "last" } },
    include: { debriefSection: true },
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
      include: { athlete: true, debriefSection: true },
    });
  },
);

export async function listAllByAthleteId(athleteId: string) {
  return prisma.newsletter.findMany({
    where: { athleteId },
    orderBy: [{ editionNumber: "desc" }],
    include: { debriefSection: true },
  });
}

export async function getNewsletterById(id: string) {
  return prisma.newsletter.findUnique({
    where: { id },
    include: {
      athlete: { select: { slug: true } },
      debriefSection: true,
    },
  });
}

export async function createNewsletter(input: CreateNewsletterOutput) {
  const { athleteId, title, slug: baseSlug, debrief, heroImageUrl } = input;

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
            heroImageUrl,
            editionNumber,
            debriefSection: { create: debriefCreateData(debrief) },
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
        debriefSection: input.debrief
          ? {
              upsert: {
                create: debriefCreateData(input.debrief),
                update: debriefCreateData(input.debrief),
              },
            }
          : undefined,
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

type NewsletterWithAthlete = Newsletter & {
  athlete: Athlete;
  debriefSection: DebriefSection | null;
};

interface BrevoConfig {
  senderEmail: string;
  replyToEmail: string;
}

function logBrevo(event: string, data: Record<string, unknown>) {
  console.log(JSON.stringify({ scope: "brevo.publish", event, ...data }));
}

function loadBrevoConfig(): BrevoConfig {
  return {
    senderEmail: getRequiredEnv("BREVO_SENDER_EMAIL"),
    replyToEmail: getRequiredEnv("BREVO_REPLY_TO_EMAIL"),
  };
}

async function loadNewsletterWithAthlete(
  id: string,
): Promise<NewsletterWithAthlete> {
  const newsletter = await prisma.newsletter.findUnique({
    where: { id },
    include: { athlete: true, debriefSection: true },
  });
  if (!newsletter) {
    throw new NotFoundError("Newsletter not found");
  }
  return newsletter;
}

const SLUG_PATTERN = /^[a-z0-9-]+$/;

function buildEditionUrl(athleteSlug: string, editionSlug: string): string {
  if (!SLUG_PATTERN.test(athleteSlug) || !SLUG_PATTERN.test(editionSlug)) {
    throw new BadRequestError("Invalid athlete or edition slug");
  }
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BETTER_AUTH_URL ||
    config.project.url;
  const url = new URL(`/${athleteSlug}`, base);
  url.searchParams.set("edition", editionSlug);
  return url.toString();
}

async function renderNewsletterEmail(
  newsletter: NewsletterWithAthlete,
): Promise<string> {
  if (!newsletter.debriefSection) {
    throw new BadRequestError(
      "Newsletter has no debrief section — add one before publishing",
    );
  }
  try {
    return await render(
      NewsletterEmail({
        title: newsletter.title,
        debrief: newsletter.debriefSection,
        heroImageUrl: newsletter.heroImageUrl,
        editionNumber: newsletter.editionNumber,
        athleteName: `${newsletter.athlete.firstName} ${newsletter.athlete.lastName}`,
        editionUrl: buildEditionUrl(newsletter.athlete.slug, newsletter.slug),
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
    include: { athlete: true, debriefSection: true },
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
  if (!newsletter.debriefSection) {
    throw new BadRequestError(
      "Newsletter has no debrief section — add one before publishing",
    );
  }

  // Re-publishing a previously-sent edition: never re-send to subscribers.
  if (newsletter.brevoCampaignId) {
    return republishWithoutResending(id, newsletter.publishedAt);
  }

  if (newsletter.athlete.brevoListId === null) {
    throw new BadRequestError(
      "Athlete has no Brevo list — recreate athlete or set brevoListId manually.",
    );
  }

  const config = loadBrevoConfig();
  const athleteName = `${newsletter.athlete.firstName} ${newsletter.athlete.lastName}`;
  const renderedHtml = await renderNewsletterEmail(newsletter);

  await claimForSending(id, renderedHtml);
  logBrevo("claimed", { newsletterId: id });

  const campaignId = await createCampaign({
    name: `${athleteName} — Edition #${newsletter.editionNumber} (${newsletter.slug})`,
    subject: newsletter.title,
    htmlContent: renderedHtml,
    sender: { name: athleteName, email: config.senderEmail },
    listIds: [newsletter.athlete.brevoListId],
    replyTo: config.replyToEmail,
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
