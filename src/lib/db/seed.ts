import "dotenv/config";
import { Sport } from "@prisma/client";
import { prisma } from "./prisma";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — refusing to seed");
}

type AthleteSeed = {
  slug: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  sport: Sport;
  worldRank: number;
  bio: string;
};

const athletes: AthleteSeed[] = [
  {
    slug: "iga-swiatek",
    firstName: "Iga",
    lastName: "Świątek",
    countryCode: "POL",
    sport: Sport.TENNIS,
    worldRank: 4,
    bio: "Polish tennis player and former world No. 1, multi-Slam champion.",
  },
  {
    slug: "alexander-bublik",
    firstName: "Alexander",
    lastName: "Bublik",
    countryCode: "KAZ",
    sport: Sport.TENNIS,
    worldRank: 11,
    bio: "Kazakh tennis player known for his creative, unpredictable game.",
  },
  {
    slug: "flavio-cobolli",
    firstName: "Flavio",
    lastName: "Cobolli",
    countryCode: "ITA",
    sport: Sport.TENNIS,
    worldRank: 13,
    bio: "Italian tennis player on the ATP tour, breakthrough season in 2025.",
  },
];

async function main() {
  for (const a of athletes) {
    const data = { ...a, heroImageUrl: `/brand/heroes/${a.slug}.jpg` };
    const result = await prisma.athlete.upsert({
      where: { slug: a.slug },
      update: data,
      create: data,
    });
    console.log(`✓ ${result.slug}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
