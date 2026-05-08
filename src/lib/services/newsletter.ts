import { cache } from "react";
import { NewsletterStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  CreateNewsletterOutput,
  UpdateNewsletterOutput,
} from "@/lib/schemas/newsletter";
import { ConflictError, NotFoundError } from "@/lib/errors/AppError";

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

export async function publishNewsletter(id: string) {
  try {
    return await prisma.newsletter.update({
      where: { id },
      data: {
        status: NewsletterStatus.PUBLISHED,
        publishedAt: new Date(),
      },
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

export async function unpublishNewsletter(id: string) {
  try {
    return await prisma.newsletter.update({
      where: { id },
      data: {
        status: NewsletterStatus.DRAFT,
        publishedAt: null,
      },
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
