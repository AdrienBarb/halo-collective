import { prisma } from "@/lib/db/prisma";
import type {
  CreateSponsorOutput,
  UpdateSponsorOutput,
} from "@/lib/schemas/sponsor";
import {
  BadRequestError,
  NotFoundError,
} from "@/lib/errors/AppError";

export async function listByAthleteId(athleteId: string) {
  return prisma.sponsor.findMany({
    where: { athleteId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

export async function getSponsorById(id: string) {
  return prisma.sponsor.findUnique({ where: { id } });
}

export async function createSponsor(
  athleteId: string,
  input: CreateSponsorOutput,
) {
  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    select: { id: true },
  });
  if (!athlete) {
    throw new NotFoundError("Athlete not found");
  }

  let order = input.order;
  if (order === undefined) {
    const last = await prisma.sponsor.findFirst({
      where: { athleteId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    order = (last?.order ?? -1) + 1;
  }

  return prisma.sponsor.create({
    data: {
      athleteId,
      name: input.name,
      logoUrl: input.logoUrl,
      websiteUrl: input.websiteUrl,
      order,
    },
  });
}

export async function updateSponsor(
  athleteId: string,
  id: string,
  input: UpdateSponsorOutput,
) {
  // Scoped update prevents cross-athlete IDOR.
  const { count } = await prisma.sponsor.updateMany({
    where: { id, athleteId },
    data: {
      name: input.name,
      logoUrl: input.logoUrl,
      websiteUrl: input.websiteUrl,
      order: input.order,
    },
  });
  if (count === 0) {
    throw new NotFoundError("Sponsor not found");
  }
  return prisma.sponsor.findUniqueOrThrow({ where: { id } });
}

export async function deleteSponsor(athleteId: string, id: string) {
  const { count } = await prisma.sponsor.deleteMany({
    where: { id, athleteId },
  });
  if (count === 0) {
    throw new NotFoundError("Sponsor not found");
  }
}

export async function reorderSponsors(
  athleteId: string,
  sponsorIds: string[],
) {
  const existing = await prisma.sponsor.findMany({
    where: { athleteId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((s) => s.id));
  if (sponsorIds.length !== existing.length) {
    throw new BadRequestError(
      "Reorder must include every sponsor exactly once",
    );
  }
  for (const id of sponsorIds) {
    if (!existingIds.has(id)) {
      throw new BadRequestError(
        `Sponsor ${id} does not belong to this athlete`,
      );
    }
  }

  return prisma.$transaction(async (tx) => {
    for (let i = 0; i < sponsorIds.length; i++) {
      await tx.sponsor.update({
        where: { id: sponsorIds[i] },
        data: { order: i },
      });
    }
  });
}
