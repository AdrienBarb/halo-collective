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
  countryName: string;
  tour: "ATP" | "WTA";
  sport: Sport;
  worldRank: number;
  countryRank: number;
  titlesCount: number;
  bio: string;
  avatarUrl: string | null;
};

const athletes: AthleteSeed[] = [
  {
    slug: "iga-swiatek",
    firstName: "Iga",
    lastName: "Świątek",
    countryCode: "POL",
    countryName: "Poland",
    tour: "WTA",
    sport: Sport.TENNIS,
    worldRank: 4,
    countryRank: 1,
    titlesCount: 22,
    bio: "Polish tennis player and former world No. 1, multi-Slam champion.",
    avatarUrl: "/brand/heroes/iga-swiatek.jpg",
  },
  {
    slug: "alexander-bublik",
    firstName: "Alexander",
    lastName: "Bublik",
    countryCode: "KAZ",
    countryName: "Kazakhstan",
    tour: "ATP",
    sport: Sport.TENNIS,
    worldRank: 11,
    countryRank: 1,
    titlesCount: 9,
    bio: "Kazakh tennis player known for his creative, unpredictable game.",
    avatarUrl: "/brand/heroes/alexander-bublik.jpg",
  },
  {
    slug: "flavio-cobolli",
    firstName: "Flavio",
    lastName: "Cobolli",
    countryCode: "ITA",
    countryName: "Italy",
    tour: "ATP",
    sport: Sport.TENNIS,
    worldRank: 13,
    countryRank: 4,
    titlesCount: 1,
    bio: "Italian tennis player on the ATP tour, breakthrough season in 2025.",
    avatarUrl: "/brand/portraits/flavio-cobolli.jpg",
  },
];

async function main() {
  for (const a of athletes) {
    const result = await prisma.athlete.upsert({
      where: { slug: a.slug },
      update: a,
      create: a,
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
