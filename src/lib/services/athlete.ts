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

  try {
    return await prisma.athlete.update({ where: { id }, data });
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
