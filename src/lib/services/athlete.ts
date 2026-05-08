import { cache } from "react";
import { NewsletterStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export const getAthleteBySlug = cache(async (slug: string) => {
  return prisma.athlete.findUnique({ where: { slug } });
});

export const listAllAthletes = cache(async () => {
  return prisma.athlete.findMany({
    orderBy: [{ worldRank: "asc" }, { createdAt: "asc" }],
  });
});

export const getLatestPublishedNewsletter = cache(async (athleteId: string) => {
  return prisma.newsletter.findFirst({
    where: {
      athleteId,
      status: NewsletterStatus.PUBLISHED,
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: "desc" },
  });
});
