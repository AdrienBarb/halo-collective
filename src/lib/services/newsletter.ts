import { cache } from "react";
import { NewsletterStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

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
