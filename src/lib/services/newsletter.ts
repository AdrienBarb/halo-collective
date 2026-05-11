import { cache } from "react";
import { NewsletterStatus, Prisma } from "@prisma/client";
import type { Athlete, Newsletter, NewsletterSection } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  CreateNewsletterOutput,
  UpdateNewsletterOutput,
} from "@/lib/schemas/newsletter";
import type { SectionTypeValue } from "@/lib/schemas/newsletterSection";
import { validateSectionContent } from "@/lib/schemas/newsletterSection";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/lib/errors/AppError";
import { createCampaign, sendCampaignNow } from "@/lib/brevo/campaigns";
import { getRequiredEnv } from "@/lib/utils/env";
import config from "@/lib/config";
import { render } from "@react-email/render";
import { NewsletterEmail } from "@/lib/emails/NewsletterEmail";

const MAX_CREATE_ATTEMPTS = 50;

/**
 * Maps validated input to Prisma update data, preserving the difference between
 * "field absent" (undefined → skip column) and "field cleared" (null → set null).
 * This is what lets users blank a previously-set optional header field.
 */
interface HeaderFields {
  title?: string;
  heroImageUrl?: string | null;
  editionDate?: Date | null;
  tournamentName?: string | null;
  tournamentLogoUrl?: string | null;
  tournamentContext?: string | null;
  worldRankSnapshot?: number | null;
  countryRankSnapshot?: number | null;
}

function buildHeaderData(
  input:
    | Omit<CreateNewsletterOutput, "athleteId" | "sections" | "slug" | "editionNumber">
    | UpdateNewsletterOutput,
): HeaderFields {
  return {
    title: input.title,
    heroImageUrl: input.heroImageUrl,
    editionDate: input.editionDate,
    tournamentName: input.tournamentName,
    tournamentLogoUrl: input.tournamentLogoUrl,
    tournamentContext: input.tournamentContext,
    worldRankSnapshot: input.worldRankSnapshot,
    countryRankSnapshot: input.countryRankSnapshot,
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
    include: { sections: { orderBy: { order: "asc" } } },
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
      include: {
        athlete: true,
        sections: { orderBy: { order: "asc" } },
      },
    });
  },
);

export async function listAllByAthleteId(athleteId: string) {
  return prisma.newsletter.findMany({
    where: { athleteId },
    orderBy: [{ editionNumber: "desc" }],
  });
}

export async function listAllForAdmin() {
  return prisma.newsletter.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      athlete: {
        select: { id: true, firstName: true, lastName: true, slug: true },
      },
    },
  });
}

export async function getNewsletterById(id: string) {
  return prisma.newsletter.findUnique({
    where: { id },
    include: {
      athlete: {
        select: { id: true, firstName: true, lastName: true, slug: true },
      },
      sections: { orderBy: { order: "asc" } },
    },
  });
}

export async function createNewsletter(input: CreateNewsletterOutput) {
  const { athleteId, slug: baseSlug, editionNumber, sections, title } = input;

  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    select: { id: true },
  });
  if (!athlete) {
    throw new NotFoundError("Athlete not found");
  }

  const sectionsToCreate = (sections ?? []).map((s, index) => ({
    type: s.type,
    order: index,
    content: validateSectionContent(s.type, s.content) as Prisma.InputJsonValue,
  }));

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    try {
      return await prisma.newsletter.create({
        data: {
          athleteId,
          slug,
          editionNumber,
          title,
          heroImageUrl: input.heroImageUrl,
          editionDate: input.editionDate,
          tournamentName: input.tournamentName,
          tournamentLogoUrl: input.tournamentLogoUrl,
          tournamentContext: input.tournamentContext,
          worldRankSnapshot: input.worldRankSnapshot,
          countryRankSnapshot: input.countryRankSnapshot,
          sections: sectionsToCreate.length
            ? { create: sectionsToCreate }
            : undefined,
        },
        include: { sections: { orderBy: { order: "asc" } } },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        // `meta.target` can be an array of column names, a constraint
        // name string, or — with the pg driver adapter — `undefined`
        // entirely. Fall back to the error message which always names
        // the offending fields, e.g.
        //   "Unique constraint failed on the fields: (`athleteId`, `editionNumber`)"
        const rawTarget = error.meta?.target;
        const probe = [
          Array.isArray(rawTarget) ? rawTarget.join(",") : String(rawTarget ?? ""),
          error.message,
        ].join(" ");
        if (probe.includes("editionNumber")) {
          throw new ConflictError(
            `Edition number ${editionNumber} already exists for this athlete`,
          );
        }
        if (probe.includes("slug")) {
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
  // Validate every section before opening the transaction — invalid blocks
  // must fail before any rows are touched.
  const sectionsToReplace = input.sections?.map((s, index) => ({
    type: s.type,
    order: index,
    content: validateSectionContent(s.type, s.content) as Prisma.InputJsonValue,
  }));

  try {
    return await prisma.$transaction(async (tx) => {
      if (sectionsToReplace) {
        await tx.newsletterSection.deleteMany({ where: { newsletterId: id } });
        if (sectionsToReplace.length > 0) {
          await tx.newsletterSection.createMany({
            data: sectionsToReplace.map((s) => ({ ...s, newsletterId: id })),
          });
        }
      }
      return tx.newsletter.update({
        where: { id },
        data: {
          slug: input.slug,
          editionNumber: input.editionNumber,
          ...buildHeaderData(input),
        },
        include: {
          athlete: { select: { slug: true } },
          sections: { orderBy: { order: "asc" } },
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictError(
          "A newsletter with this slug or edition number already exists for this athlete",
        );
      }
      if (error.code === "P2025") {
        throw new NotFoundError("Newsletter not found");
      }
    }
    throw error;
  }
}

export async function cloneFromPreviousEdition(athleteId: string) {
  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
    // Re-read each attempt so we pick up any concurrently-created edition.
    const previous = await prisma.newsletter.findFirst({
      where: { athleteId },
      orderBy: { editionNumber: "desc" },
      include: { sections: { orderBy: { order: "asc" } } },
    });
    if (!previous) {
      throw new NotFoundError("No previous newsletter to clone from");
    }

    const nextEditionNumber = previous.editionNumber + 1;
    const baseSlug = `edition-${nextEditionNumber}`;
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;

    // Re-validate each section's content to prevent legacy bad JSON from
    // propagating untouched into the new edition.
    const sectionsToCreate = previous.sections.map((s) => ({
      type: s.type,
      order: s.order,
      content: validateSectionContent(
        s.type as SectionTypeValue,
        s.content,
      ) as Prisma.InputJsonValue,
    }));

    try {
      return await prisma.newsletter.create({
        data: {
          athleteId,
          slug,
          editionNumber: nextEditionNumber,
          title: previous.title,
          heroImageUrl: previous.heroImageUrl,
          editionDate: null,
          tournamentName: previous.tournamentName,
          tournamentLogoUrl: previous.tournamentLogoUrl,
          tournamentContext: previous.tournamentContext,
          worldRankSnapshot: previous.worldRankSnapshot,
          countryRankSnapshot: previous.countryRankSnapshot,
          sections: { create: sectionsToCreate },
        },
        include: { sections: { orderBy: { order: "asc" } } },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = (error.meta?.target as string[] | undefined) ?? [];
        // Either slug collision or editionNumber collision — both are retryable
        // because we re-read `previous` each iteration and rebuild slug+number.
        if (target.includes("slug") || target.includes("editionNumber")) {
          continue;
        }
      }
      throw error;
    }
  }
  throw new ConflictError("Could not clone newsletter — please retry");
}

// ── Brevo publish ─────────────────────────────────────────────────────

type NewsletterWithAthlete = Newsletter & {
  athlete: Athlete;
  sections: NewsletterSection[];
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
    include: {
      athlete: true,
      sections: { orderBy: { order: "asc" } },
    },
  });
  if (!newsletter) {
    throw new NotFoundError("Newsletter not found");
  }
  return newsletter;
}

const SLUG_PATTERN = /^[a-z0-9-]+$/;

function resolveAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BETTER_AUTH_URL ||
    config.project.url
  );
}

function buildEditionUrl(athleteSlug: string, editionSlug: string): string {
  if (!SLUG_PATTERN.test(athleteSlug) || !SLUG_PATTERN.test(editionSlug)) {
    throw new BadRequestError("Invalid athlete or edition slug");
  }
  const url = new URL(`/${athleteSlug}`, resolveAppBaseUrl());
  url.searchParams.set("edition", editionSlug);
  return url.toString();
}

function buildAskQuestionUrl(athleteSlug: string): string {
  if (!SLUG_PATTERN.test(athleteSlug)) {
    throw new BadRequestError("Invalid athlete slug");
  }
  return new URL(
    `/athletes/${athleteSlug}/feedback`,
    resolveAppBaseUrl(),
  ).toString();
}

async function renderNewsletterEmail(
  newsletter: NewsletterWithAthlete,
): Promise<string> {
  const editionUrl = buildEditionUrl(newsletter.athlete.slug, newsletter.slug);
  const askQuestionUrl = buildAskQuestionUrl(newsletter.athlete.slug);
  const athleteName = `${newsletter.athlete.firstName} ${newsletter.athlete.lastName}`;
  return render(
    NewsletterEmail({
      title: newsletter.title,
      heroImageUrl: newsletter.heroImageUrl,
      editionNumber: newsletter.editionNumber,
      athleteName,
      editionUrl,
      askQuestionUrl,
      tournamentName: newsletter.tournamentName,
      tournamentContext: newsletter.tournamentContext,
      sections: newsletter.sections.map((s) => ({
        id: s.id,
        type: s.type as SectionTypeValue,
        order: s.order,
        content: s.content,
      })),
    }),
  );
}

export async function renderNewsletterHtml(id: string): Promise<string> {
  const newsletter = await loadNewsletterWithAthlete(id);
  return renderNewsletterEmail(newsletter);
}

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
    include: {
      athlete: true,
      sections: { orderBy: { order: "asc" } },
    },
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
  if (newsletter.sections.length === 0) {
    throw new BadRequestError(
      "Newsletter has no sections — add at least one before publishing",
    );
  }

  if (newsletter.brevoCampaignId) {
    return republishWithoutResending(id, newsletter.publishedAt);
  }

  if (newsletter.athlete.brevoListId === null) {
    throw new BadRequestError(
      "Athlete has no Brevo list — recreate athlete or set brevoListId manually.",
    );
  }

  const brevoConfig = loadBrevoConfig();
  const athleteName = `${newsletter.athlete.firstName} ${newsletter.athlete.lastName}`;
  const renderedHtml = await renderNewsletterEmail(newsletter);

  await claimForSending(id, renderedHtml);
  logBrevo("claimed", { newsletterId: id });

  const campaignId = await createCampaign({
    name: `${athleteName} — Edition #${newsletter.editionNumber} (${newsletter.slug})`,
    subject: newsletter.title,
    htmlContent: renderedHtml,
    sender: { name: athleteName, email: brevoConfig.senderEmail },
    listIds: [newsletter.athlete.brevoListId],
    replyTo: brevoConfig.replyToEmail,
  });
  logBrevo("campaign_created", { newsletterId: id, campaignId });

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
