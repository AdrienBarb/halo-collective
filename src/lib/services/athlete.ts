import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  CreateAthleteOutput,
  UpdateAthleteOutput,
} from "@/lib/schemas/athlete";
import { COUNTRIES } from "@/lib/data/countries";
import { ensureAthleteList } from "@/lib/brevo/lists";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/lib/errors/AppError";

const MAX_SLUG_ATTEMPTS = 50;

function resolveCountryName(code: string): string {
  const country = COUNTRIES.find((c) => c.code === code);
  if (!country) {
    throw new BadRequestError("Unknown country code");
  }
  return country.name;
}

export const getAthleteBySlug = cache(async (slug: string) => {
  return prisma.athlete.findUnique({ where: { slug } });
});

export const listAllAthletes = cache(async () => {
  return prisma.athlete.findMany({
    orderBy: [{ worldRank: "asc" }, { createdAt: "asc" }],
  });
});

export async function listAllForAdmin() {
  return prisma.athlete.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getAthleteById(id: string) {
  return prisma.athlete.findUnique({ where: { id } });
}

export async function createAthlete(input: CreateAthleteOutput) {
  const {
    slug: baseSlug,
    firstName,
    lastName,
    sport,
    tour,
    countryCode,
    bio,
    avatarUrl,
    worldRank,
    countryRank,
    titlesCount,
    socialLinks,
    sponsors,
  } = input;
  const countryName = resolveCountryName(countryCode);

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    try {
      const athlete = await prisma.athlete.create({
        data: {
          slug,
          firstName,
          lastName,
          sport,
          tour,
          countryCode,
          countryName,
          bio,
          avatarUrl,
          worldRank,
          countryRank,
          titlesCount,
          socialLinks: socialLinks as Prisma.InputJsonValue | undefined,
          sponsors: sponsors?.length
            ? {
                create: sponsors.map((s, i) => ({
                  name: s.name,
                  logoUrl: s.logoUrl,
                  websiteUrl: s.websiteUrl,
                  order: i,
                })),
              }
            : undefined,
        },
      });

      const brevoListId = await ensureAthleteList(athlete);
      return { ...athlete, brevoListId };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        (error.meta?.target as string[] | undefined)?.includes("slug")
      ) {
        continue;
      }
      throw error;
    }
  }
  throw new ConflictError("Could not generate a unique slug");
}

export async function updateAthlete(id: string, input: UpdateAthleteOutput) {
  const data: Prisma.AthleteUpdateInput = {
    firstName: input.firstName,
    lastName: input.lastName,
    sport: input.sport,
    tour: input.tour,
    bio: input.bio,
    avatarUrl: input.avatarUrl,
    worldRank: input.worldRank,
    countryRank: input.countryRank,
    titlesCount: input.titlesCount,
  };
  if (input.countryCode) {
    data.countryCode = input.countryCode;
    data.countryName = resolveCountryName(input.countryCode);
  }
  if (input.socialLinks !== undefined) {
    data.socialLinks = input.socialLinks as Prisma.InputJsonValue;
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const athlete = await tx.athlete.update({ where: { id }, data });

      if (input.sponsors !== undefined) {
        await syncSponsors(tx, id, input.sponsors);
      }

      return athlete;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Athlete not found");
    }
    throw error;
  }
}

/**
 * Full-sync sponsors for an athlete: delete missing, update existing,
 * create new — order follows array index. Called inside a transaction
 * so the athlete row and its sponsors save atomically.
 */
async function syncSponsors(
  tx: Prisma.TransactionClient,
  athleteId: string,
  sponsors: NonNullable<UpdateAthleteOutput["sponsors"]>,
) {
  const existing = await tx.sponsor.findMany({
    where: { athleteId },
    select: { id: true },
  });
  const incomingIds = new Set(
    sponsors.map((s) => s.id).filter((id): id is string => Boolean(id)),
  );
  const toDelete = existing
    .filter((e) => !incomingIds.has(e.id))
    .map((e) => e.id);

  if (toDelete.length > 0) {
    await tx.sponsor.deleteMany({
      where: { athleteId, id: { in: toDelete } },
    });
  }

  for (let i = 0; i < sponsors.length; i++) {
    const s = sponsors[i];
    if (s.id) {
      const { count } = await tx.sponsor.updateMany({
        where: { id: s.id, athleteId },
        data: {
          name: s.name,
          logoUrl: s.logoUrl,
          websiteUrl: s.websiteUrl,
          order: i,
        },
      });
      // Refuse to silently no-op when a sponsor id doesn't belong to this
      // athlete (or no longer exists) — that path was previously a data-loss bug.
      if (count === 0) {
        throw new NotFoundError(
          `Sponsor ${s.id} not found for this athlete`,
        );
      }
    } else {
      await tx.sponsor.create({
        data: {
          athleteId,
          name: s.name,
          logoUrl: s.logoUrl,
          websiteUrl: s.websiteUrl,
          order: i,
        },
      });
    }
  }
}

export async function deleteAthlete(id: string) {
  try {
    return await prisma.athlete.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Athlete not found");
    }
    throw error;
  }
}
