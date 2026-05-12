import "dotenv/config";
import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { NewsletterStatus, Sport, type Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { supabaseStorage } from "@/lib/storage/client";
import { ensureAthleteList } from "@/lib/brevo/lists";
import type {
  EditionModeValue,
  SectionTypeValue,
} from "@/lib/schemas/newsletterSection";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — refusing to seed");
}

// ── Supabase asset uploader ──────────────────────────────────────────

const MEDIA_BUCKET = "media";
const SEED_PREFIX = "seed";
const assetUrlCache = new Map<string, string>();
let bucketEnsured = false;

async function ensureMediaBucket(): Promise<void> {
  if (bucketEnsured) return;
  const { data } = await supabaseStorage.storage.getBucket(MEDIA_BUCKET);
  if (!data) {
    const { error } = await supabaseStorage.storage.createBucket(MEDIA_BUCKET, {
      public: true,
    });
    if (error && !/already exists/i.test(error.message)) throw error;
    console.log(`  ↑ created bucket ${MEDIA_BUCKET} (public)`);
  }
  bucketEnsured = true;
}

const LOCAL_CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

async function loadSeedAssetBytes(
  source: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  // Local path under public/ — kept for first-party brand assets shipped in the repo.
  if (source.startsWith("/")) {
    const fullPath = join(process.cwd(), "public", source);
    const buffer = await readFile(fullPath);
    const ext = extname(source).slice(1).toLowerCase();
    const contentType =
      LOCAL_CONTENT_TYPES[ext] ?? "application/octet-stream";
    return { buffer, contentType };
  }

  const res = await fetch(source);
  if (!res.ok) {
    throw new Error(`Failed to fetch asset ${source}: ${res.status}`);
  }
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    contentType: res.headers.get("content-type") ?? "application/octet-stream",
  };
}

async function ensureSeedAsset(
  filename: string,
  source: string,
): Promise<string> {
  const cached = assetUrlCache.get(filename);
  if (cached) return cached;

  await ensureMediaBucket();

  const objectPath = `${SEED_PREFIX}/${filename}`;
  const bucket = supabaseStorage.storage.from(MEDIA_BUCKET);
  const publicUrl = bucket.getPublicUrl(objectPath).data.publicUrl;

  const { data: existing } = await bucket.list(SEED_PREFIX, {
    search: filename,
    limit: 1,
  });
  if (existing?.some((entry) => entry.name === filename)) {
    assetUrlCache.set(filename, publicUrl);
    return publicUrl;
  }

  const { buffer, contentType } = await loadSeedAssetBytes(source);

  const { error } = await bucket.upload(objectPath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw error;

  console.log(`  ↑ uploaded ${objectPath}`);
  assetUrlCache.set(filename, publicUrl);
  return publicUrl;
}

// ── Athlete seeds ────────────────────────────────────────────────────

type SocialLinks = {
  instagram?: string;
  x?: string;
  tiktok?: string;
  facebook?: string;
  linkedin?: string;
  foundation?: string;
};

type AssetRef = { filename: string; sourceUrl: string };

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
  avatar: AssetRef | null;
  socialLinks: SocialLinks;
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
    avatar: {
      filename: "athlete-iga-swiatek-avatar.jpg",
      sourceUrl: "/brand/heroes/iga-swiatek.jpg",
    },
    socialLinks: {
      instagram: "https://www.instagram.com/iga.swiatek/",
      facebook: "https://www.facebook.com/IgaSwiatek/",
      x: "https://x.com/iga_swiatek",
      linkedin: "https://www.linkedin.com/in/iga-swiatek/",
      foundation: "https://www.instagram.com/igaswiatekfoundation/",
    },
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
    avatar: {
      filename: "athlete-alexander-bublik-avatar.jpg",
      sourceUrl: "/brand/heroes/alexander-bublik.jpg",
    },
    socialLinks: { instagram: "https://www.instagram.com/bublik/" },
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
    countryRank: 3,
    titlesCount: 1,
    bio: "Italian tennis player on the ATP tour, breakthrough season in 2025.",
    avatar: {
      filename: "athlete-flavio-cobolli-avatar.jpg",
      sourceUrl: "/brand/portraits/flavio-cobolli.jpg",
    },
    socialLinks: {
      instagram: "https://www.instagram.com/flavio_cobbo/",
      x: "https://x.com/cobollifla",
      tiktok: "https://www.tiktok.com/@flaviocobolli",
    },
  },
];

// ── Sponsor seeds ────────────────────────────────────────────────────

type SponsorSeed = {
  name: string;
  logoFilename: string;
  logoSourceUrl: string;
  websiteUrl: string;
};

const sponsorsByAthlete: Record<string, SponsorSeed[]> = {
  "flavio-cobolli": [
    {
      name: "On",
      logoFilename: "sponsor-cobolli-on.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69ea408040d7a6d42fd37c0c.png",
      websiteUrl: "https://www.on.com/en/collection/tennis",
    },
    {
      name: "Renault",
      logoFilename: "sponsor-cobolli-renault.jpg",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69ea40af606f3c5150bc5cba.jpg",
      websiteUrl: "https://www.renault.com",
    },
    {
      name: "Polaroid",
      logoFilename: "sponsor-cobolli-polaroid.jpg",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69ea4097f27f57227b8cdd98.jpg",
      websiteUrl: "https://www.polaroid.com",
    },
    {
      name: "La Roche-Posay",
      logoFilename: "sponsor-cobolli-la-roche-posay.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69ea40c840d7a6d42fd37c22.png",
      websiteUrl: "https://www.laroche-posay.com",
    },
  ],
  "iga-swiatek": [
    {
      name: "On",
      logoFilename: "sponsor-iga-on.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69cf809870316a71384e8df5.png",
      websiteUrl: "https://www.on.com/en-us/collection/tennis",
    },
    {
      name: "Rolex",
      logoFilename: "sponsor-iga-rolex.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69cf80a770316a71384e8dfb.png",
      websiteUrl: "https://www.rolex.com",
    },
  ],
  "alexander-bublik": [
    {
      name: "Armani EA7",
      logoFilename: "sponsor-bublik-armani-ea7.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69dc9d33b27fae1e5f03cfdf.png",
      websiteUrl: "https://www.armani.com/en-wx/ea7/experience/athletes/",
    },
  ],
};

// ── Newsletter seeds (block-shaped) ──────────────────────────────────

type NewsletterSeed = {
  athleteSlug: string;
  editionNumber: number;
  editionDate: Date;
  editionMode: EditionModeValue;
  title: string;
  slug: string;
  tournamentName: string | null;
  tournamentCategory: string | null;
  tournamentLocation: string | null;
  tournamentSurface: string | null;
  tournamentStartDate: Date | null;
  tournamentEndDate: Date | null;
  worldRankSnapshot: number;
  countryRankSnapshot: number;
  hero: AssetRef;
  tournamentLogo: AssetRef | null;
  kitImage: AssetRef | null;
  buildSections: (assets: {
    kitImageUrl: string | null;
    tournamentLogoUrl: string | null;
  }) => Array<{ type: SectionTypeValue; blocks: Prisma.InputJsonValue }>;
};

const newsletters: NewsletterSeed[] = [
  // ── 1. Flavio Cobolli — Monte Carlo (TOURNAMENT) ───────────────────
  {
    athleteSlug: "flavio-cobolli",
    editionNumber: 1,
    editionDate: new Date("2026-04-08"),
    editionMode: "TOURNAMENT",
    title: "Monte Carlo: what a week",
    slug: "monte-carlo-2026",
    tournamentName: "Rolex Monte-Carlo Masters",
    tournamentCategory: "ATP Masters 1000",
    tournamentLocation: "Monte Carlo, Monaco",
    tournamentSurface: "Clay",
    tournamentStartDate: new Date("2026-04-06"),
    tournamentEndDate: new Date("2026-04-12"),
    worldRankSnapshot: 16,
    countryRankSnapshot: 3,
    hero: {
      filename: "cobolli-monte-carlo-hero.jpeg",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69eb6d2f47ca91d8a8df3d97.jpeg",
    },
    tournamentLogo: {
      filename: "cobolli-monte-carlo-logo.jpg",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69eb6df5f51ddaf490543aee.jpg",
    },
    kitImage: {
      filename: "cobolli-monte-carlo-kit.jpg",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69eb6d5447ca91d8a8df3daa.jpg",
    },
    buildSections: ({ kitImageUrl, tournamentLogoUrl }) => [
      {
        type: "ATHLETE_REVIEW",
        blocks: [
          {
            kind: "text",
            body:
              "Monte Carlo. One of the tournaments I look forward to the most — the clay, the setting, the atmosphere. First round against Comesaña was a real battle. I dropped the second set but came back in the third. 7-5, 2-6, 6-3.\n\nThen Blockx in the second round. He played better than me. 3-6, 3-6, no arguments. Disappointing — but the clay swing is just starting and there's a lot ahead.",
          },
        ],
      },
      {
        type: "WEEK_RECAP",
        blocks: [
          {
            kind: "tournament_summary",
            logoUrl: tournamentLogoUrl ?? undefined,
            name: "Rolex Monte-Carlo Masters",
            category: "ATP Masters 1000",
            location: "Monte Carlo, Monaco",
            surface: "Clay",
            dateRange: "6–12 April 2026",
          },
          { kind: "hero_metric", value: "R2", label: "Best result" },
          { kind: "hero_metric", value: "#10", label: "Seed" },
          { kind: "hero_metric", value: "1-1", label: "W / L" },
          {
            kind: "match_card",
            result: "W",
            roundName: "Round 1",
            opponentName: "F. Comesaña",
            opponentRank: "#99",
            opponentCountry: "ARG",
            score: "7-5 2-6 6-3",
            date: "6 April",
            commentary:
              "Tough opener on clay — heavy ball, fights for every point. Lost the second, found something extra in the third.",
            highlightUrl: "https://www.youtube.com/watch?v=AA2_J2gaj5I",
          },
          {
            kind: "match_card",
            result: "L",
            roundName: "Round 2",
            opponentName: "A. Blockx",
            opponentRank: "#91",
            opponentCountry: "BEL",
            score: "3-6 3-6",
            date: "8 April",
            commentary:
              "Blockx played a clean match. I never found my baseline game. Those days happen.",
            highlightUrl:
              "https://www.tennistv.com/videos/4484136/monte-carlo-2026-r2-cobolli-blockx-short-highlights",
          },
          {
            kind: "media_link",
            source: "ATP Tour",
            headline: "Blockx claims seeded scalp of Cobolli in Monte-Carlo",
            url: "https://www.atptour.com/en/news/blockx-fonseca-monte-carlo-2026-monday",
          },
        ],
      },
      {
        type: "COMING_UP",
        blocks: [
          {
            kind: "text",
            body:
              "Munich first — ATP 500, clay, a tournament I've always enjoyed. Then Madrid, Rome, Roland Garros. Monte Carlo was a short week, but there were good signs. Time to build on them.",
          },
          {
            kind: "schedule_item",
            dateRange: "Apr 8–9",
            title: "Rest in Rome",
            description: "Family, proper food, no racket. Reset the head.",
          },
          {
            kind: "schedule_item",
            dateRange: "Apr 10–12",
            title: "Training block",
            description: "Clay work, serve practice, match patterns.",
          },
          {
            kind: "schedule_item",
            dateRange: "Apr 13",
            title: "Arrival in Munich",
            description: "BMW Open starts April 14.",
          },
        ],
      },
      {
        type: "MONETISATION",
        blocks: [
          {
            kind: "kit",
            id: randomUUID(),
            title: "My clay-season kit",
            body:
              "On's CloudFly gives me the traction I need on Monte Carlo's red clay, and La Roche-Posay SPF 50 is part of my pre-match routine when you're outside for hours.",
            media: kitImageUrl
              ? { kind: "image", url: kitImageUrl }
              : undefined,
            cta: {
              label: "Discover On's clay season gear",
              url: "https://www.on.com/en-us/collection/tennis",
            },
          },
          {
            kind: "partner_content",
            id: randomUUID(),
            partnerName: "La Roche-Posay",
            title: "What I use to protect my skin on tour",
            body: "Anthelios UVMune 400 — SPF 50, sweat-resistant.",
            cta: {
              label: "See the routine",
              url: "https://www.laroche-posay.com",
            },
          },
        ],
      },
      {
        type: "FAN_ENGAGEMENT",
        blocks: [
          {
            kind: "poll",
            id: randomUUID(),
            question: "What do you want to see from Munich?",
            options: [
              { label: "Tactical breakdown of a match", emoji: "🎾", isHighlighted: false },
              { label: "A day in my life on tour", emoji: "🏊", isHighlighted: false },
              { label: "My pre-match routine", emoji: "🏁", isHighlighted: false },
              { label: "Playing at home in Italy", emoji: "🇮🇹", isHighlighted: false },
            ],
          },
          {
            kind: "qa",
            id: randomUUID(),
            prompt: "Ask me a question for the Munich edition",
            reassurance: "I'll pick 3 and answer them next week.",
          },
        ],
      },
    ],
  },

  // ── 2. Flavio Cobolli — Madrid prep (WEEKLY) ───────────────────────
  {
    athleteSlug: "flavio-cobolli",
    editionNumber: 2,
    editionDate: new Date("2026-04-22"),
    editionMode: "WEEKLY",
    title: "This week in Madrid prep",
    slug: "madrid-prep-2026",
    tournamentName: null,
    tournamentCategory: null,
    tournamentLocation: null,
    tournamentSurface: null,
    tournamentStartDate: null,
    tournamentEndDate: null,
    worldRankSnapshot: 13,
    countryRankSnapshot: 3,
    hero: {
      filename: "cobolli-munich-hero.jpg",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69eb24fa96b9e15bbc850490.jpg",
    },
    tournamentLogo: null,
    kitImage: {
      filename: "cobolli-munich-kit.jpeg",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69eb2d94efc1924cd8115c2d.jpeg",
    },
    buildSections: ({ kitImageUrl }) => [
      {
        type: "ATHLETE_REVIEW",
        blocks: [
          {
            kind: "text",
            body:
              "No match week. Back in Rome with the team. The body needs it after five days in Munich and the back-to-back travel from Monte Carlo.\n\nLight on court, heavy in the gym. Trying to land in Madrid sharp.",
          },
        ],
      },
      {
        type: "WEEK_RECAP",
        blocks: [
          {
            kind: "training_update",
            body:
              "Three days of clay sessions at home — short, intense. Focused on the second-serve return and the inside-out forehand. Both felt better by Friday.",
          },
          {
            kind: "recovery_travel_update",
            body:
              "Daily ice baths and physio. Slept ten hours most nights. Family dinners every evening — that's the real reset.",
          },
          {
            kind: "stats_update",
            rankingCurrent: "#13",
            rankingChange: "+3 since Munich final",
            body:
              "First time inside the top 15. The Munich final pushed me up — I want to defend the points by going deep in Madrid.",
          },
          {
            kind: "quote",
            text:
              "The best thing about this week is that I don't have to win anything. I just have to be ready.",
            attribution: "Me, to my coach, Tuesday morning",
          },
        ],
      },
      {
        type: "COMING_UP",
        blocks: [
          {
            kind: "text",
            body:
              "Madrid next. Different altitude, different ball — the conditions reward the heavy hitters. I want to take the lessons from Munich into the Caja Mágica.",
          },
          {
            kind: "schedule_item",
            dateRange: "Apr 23–24",
            title: "Final prep in Rome",
            description: "Sharper sessions. Serve patterns. Travel Friday.",
          },
          {
            kind: "schedule_item",
            dateRange: "Apr 25",
            title: "Arrival in Madrid",
            description: "First practice on the centre court. Get the bounce in the legs.",
          },
          {
            kind: "schedule_item",
            dateRange: "Apr 27 – May 4",
            title: "Mutua Madrid Open",
            description: "Masters 1000. Goal: go further than I ever have at this level.",
          },
        ],
      },
      {
        type: "MONETISATION",
        blocks: [
          {
            kind: "athlete_product",
            id: randomUUID(),
            title: "My training journal — the one I actually use",
            body:
              "After two years of testing notebooks, I finally made my own. 90 days, one page per session.",
            media: kitImageUrl
              ? { kind: "image", url: kitImageUrl }
              : undefined,
            price: "€24",
            cta: {
              label: "Get the journal",
              url: "https://flaviocobolli.com/shop/journal",
            },
          },
        ],
      },
      {
        type: "FAN_ENGAGEMENT",
        blocks: [
          {
            kind: "prediction",
            id: randomUUID(),
            prompt: "How far do you think I'll go in Madrid?",
            options: [
              { label: "R32", isHighlighted: false },
              { label: "R16", isHighlighted: false },
              { label: "QF or better", isHighlighted: false },
            ],
          },
          {
            kind: "prize_draw",
            id: randomUUID(),
            title: "Win a match-worn Munich shirt",
            body:
              "One signed shirt from the Munich final. Open to members worldwide.",
            ctaLabel: "Enter the draw",
            closesAt: "Apr 30, 2026",
          },
        ],
      },
    ],
  },

  // ── 3. Iga Świątek — Miami (TOURNAMENT) ────────────────────────────
  {
    athleteSlug: "iga-swiatek",
    editionNumber: 1,
    editionDate: new Date("2026-03-24"),
    editionMode: "TOURNAMENT",
    title: "Miami: a tough quarter",
    slug: "miami-2026",
    tournamentName: "Miami Open",
    tournamentCategory: "WTA 1000",
    tournamentLocation: "Miami Gardens, USA",
    tournamentSurface: "Hard",
    tournamentStartDate: new Date("2026-03-17"),
    tournamentEndDate: new Date("2026-03-29"),
    worldRankSnapshot: 4,
    countryRankSnapshot: 1,
    hero: {
      filename: "iga-miami-hero.png",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69d037d26169969004e5356d.png",
    },
    tournamentLogo: {
      filename: "iga-miami-logo.png",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69d037df3444432bc4ac3a6e.png",
    },
    kitImage: {
      filename: "iga-miami-kit.png",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69d037f05588fb598df7fb04.png",
    },
    buildSections: ({ kitImageUrl, tournamentLogoUrl }) => [
      {
        type: "ATHLETE_REVIEW",
        blocks: [
          {
            kind: "text",
            body:
              "Miami is done — and it hurts. I dominated the first set against Magda, played exactly how I wanted to. Then something shifted. She led 5-2 in the third — I saved two match points, got back to 5-3. But she closed it out. 73 opening-round wins, gone.\n\nClay season starts now — and that's where I feel most like myself.",
          },
        ],
      },
      {
        type: "WEEK_RECAP",
        blocks: [
          {
            kind: "tournament_summary",
            logoUrl: tournamentLogoUrl ?? undefined,
            name: "Miami Open",
            category: "WTA 1000",
            location: "Miami Gardens, USA",
            surface: "Hard",
            dateRange: "17–29 March 2026",
          },
          { kind: "hero_metric", value: "R2", label: "Best result" },
          { kind: "hero_metric", value: "#2", label: "Seed" },
          { kind: "hero_metric", value: "0-1", label: "W / L" },
          {
            kind: "match_card",
            result: "BYE",
            roundName: "Round 1",
            date: "Mar 18",
            contextNote: "Seed #2",
          },
          {
            kind: "match_card",
            result: "L",
            roundName: "Round 2",
            opponentName: "M. Linette",
            opponentRank: "#50",
            opponentCountry: "POL",
            score: "6-1 5-7 3-6",
            date: "Mar 20",
            contextNote: "All-Polish clash",
            commentary:
              "I led the first set, broke her twice, won 88% of first-serve points. Then I lost the thread completely. When you save match points and still lose, it stings differently.",
          },
          {
            kind: "media_link",
            source: "WTA",
            headline: "Linette ends Świątek's 73-match opening-round streak",
            url: "https://www.wtatennis.com/news/4472909/linette-ends-swiateks-73-match-opening-win-streak",
          },
        ],
      },
      {
        type: "COMING_UP",
        blocks: [
          {
            kind: "text",
            body:
              "Two weeks on hard court, two early exits. Now I go home. The clay season is where I've always found my best tennis, and I need it more than ever right now.",
          },
          {
            kind: "schedule_item",
            dateRange: "Mar 21–23",
            title: "Flight home to Poland",
            description: "Family, rest, no racket.",
          },
          {
            kind: "schedule_item",
            dateRange: "Mar 24–28",
            title: "Active recovery",
            description: "Ice baths, physio, sleep. Mental reset with my team.",
          },
          {
            kind: "schedule_item",
            dateRange: "Apr 14–20",
            title: "Porsche Grand Prix Stuttgart",
            description: "First clay tournament of the season. Defending title territory.",
          },
        ],
      },
      {
        type: "MONETISATION",
        blocks: [
          {
            kind: "athlete_product",
            id: randomUUID(),
            title: "Recovery essentials",
            body:
              "After a tough stretch, recovery is part of the job. The bag I travel with — and what's inside it.",
            media: kitImageUrl
              ? { kind: "image", url: kitImageUrl }
              : undefined,
            cta: { label: "See what's in my bag", url: "https://igaswiatek.com/recovery" },
          },
        ],
      },
      {
        type: "FAN_ENGAGEMENT",
        blocks: [
          {
            kind: "poll",
            id: randomUUID(),
            question:
              "Which part of my game should I focus on heading into clay?",
            options: [
              { label: "Serve consistency", isHighlighted: false },
              { label: "Mental resilience in tight sets", isHighlighted: false },
              { label: "Forehand under pressure", isHighlighted: false },
              { label: "Just trust yourself", emoji: "🏆", isHighlighted: true },
            ],
          },
        ],
      },
    ],
  },

  // ── 4. Alexander Bublik — Monte Carlo (TOURNAMENT) ─────────────────
  {
    athleteSlug: "alexander-bublik",
    editionNumber: 1,
    editionDate: new Date("2026-04-13"),
    editionMode: "TOURNAMENT",
    title: "Monte Carlo: a quarterfinal to build on",
    slug: "monte-carlo-2026",
    tournamentName: "Rolex Monte-Carlo Masters",
    tournamentCategory: "ATP Masters 1000",
    tournamentLocation: "Monte Carlo, Monaco",
    tournamentSurface: "Clay",
    tournamentStartDate: new Date("2026-04-06"),
    tournamentEndDate: new Date("2026-04-12"),
    worldRankSnapshot: 11,
    countryRankSnapshot: 1,
    hero: {
      filename: "bublik-monte-carlo-hero.png",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69dc9d29648713cd2e9ca7a5.png",
    },
    tournamentLogo: {
      filename: "bublik-monte-carlo-logo.png",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69dc9d2d648713cd2e9ca7a7.png",
    },
    kitImage: {
      filename: "bublik-monte-carlo-kit.jpg",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69dc9d52648713cd2e9ca7ba.jpg",
    },
    buildSections: ({ kitImageUrl, tournamentLogoUrl }) => [
      {
        type: "ATHLETE_REVIEW",
        blocks: [
          {
            kind: "text",
            body:
              "Hey everyone. Monte Carlo. A year ago I was in qualifying here, losing a third set 6-0. This week I reached the quarterfinal. That's the kind of progress that keeps you going.\n\nTwo clean wins — Monfils, then Lehečka — and then Alcaraz happened. 6-3, 6-0. A bagel in the second. I'll take it.",
          },
        ],
      },
      {
        type: "WEEK_RECAP",
        blocks: [
          {
            kind: "tournament_summary",
            logoUrl: tournamentLogoUrl ?? undefined,
            name: "Rolex Monte-Carlo Masters",
            category: "ATP Masters 1000",
            location: "Monte Carlo, Monaco",
            surface: "Clay",
            dateRange: "6–12 April 2026",
          },
          { kind: "hero_metric", value: "QF", label: "Best result" },
          { kind: "hero_metric", value: "3", label: "Matches" },
          { kind: "hero_metric", value: "2-1", label: "W / L" },
          {
            kind: "match_card",
            result: "BYE",
            roundName: "Round 1",
            date: "6 April",
            contextNote: "Seeded #8",
          },
          {
            kind: "match_card",
            result: "W",
            roundName: "Round 2",
            opponentName: "G. Monfils",
            opponentCountry: "FRA",
            score: "6-4 6-4",
            date: "7 April",
            commentary:
              "Ten years ago I was a hitting partner here. At the net after the match Gaël remembered telling me clay would be my main surface — neither of us had forgotten.",
            highlightUrl:
              "https://www.atptour.com/en/video/highlights-bublik-dials-in-to-end-monfils-montecarlo-2026-career",
          },
          {
            kind: "match_card",
            result: "W",
            roundName: "Round of 16",
            opponentName: "J. Lehečka",
            opponentRank: "#13",
            opponentCountry: "CZE",
            score: "6-2 7-5",
            date: "9 April",
            highlightUrl:
              "https://www.atptour.com/en/video/highlights-bublik-downs-lehecka-for-maiden-monte-carlo-2026-qf-spot",
          },
          {
            kind: "match_card",
            result: "L",
            roundName: "Quarterfinal",
            opponentName: "C. Alcaraz",
            opponentRank: "#1",
            opponentCountry: "ESP",
            score: "3-6 0-6",
            date: "10 April",
            highlightUrl:
              "https://www.atptour.com/en/news/alcaraz-bublik-monte-carlo-2026-friday",
          },
        ],
      },
      {
        type: "COMING_UP",
        blocks: [
          {
            kind: "text",
            body:
              "Munich first, then Madrid, then Rome, then Roland Garros. Last year the clay swing was where everything clicked. A QF here is a good start. The serve travels on this surface. Let's keep going.",
          },
        ],
      },
      {
        type: "MONETISATION",
        blocks: [
          {
            kind: "kit",
            id: randomUUID(),
            title: "The kit I wore all week",
            media: kitImageUrl
              ? { kind: "image", url: kitImageUrl }
              : undefined,
            cta: {
              label: "Discover the kit",
              url: "https://www.armani.com/en-wx/ea7/experience/athletes/",
            },
          },
        ],
      },
      {
        type: "FAN_ENGAGEMENT",
        blocks: [
          {
            kind: "poll",
            id: randomUUID(),
            question: "What was the highlight of my week in Monte Carlo?",
            options: [
              { label: "The win vs Monfils", emoji: "🎯", isHighlighted: false },
              { label: "Beating Lehečka", emoji: "💪", isHighlighted: false },
              { label: "First Monte Carlo QF", emoji: "🏆", isHighlighted: false },
              { label: "Surviving clay as me", emoji: "😂", isHighlighted: true },
            ],
          },
        ],
      },
    ],
  },
];

// ── Orchestration ────────────────────────────────────────────────────

async function syncAthlete(seed: AthleteSeed): Promise<string> {
  const { socialLinks, avatar, ...rest } = seed;
  const avatarUrl = avatar
    ? await ensureSeedAsset(avatar.filename, avatar.sourceUrl)
    : null;
  const data = {
    ...rest,
    avatarUrl,
    socialLinks: socialLinks as Prisma.InputJsonValue,
  };
  const result = await prisma.athlete.upsert({
    where: { slug: seed.slug },
    update: data,
    create: data,
  });
  const brevoListId = await ensureAthleteList(result);
  console.log(`✓ athlete ${result.slug} (brevoListId: ${brevoListId})`);
  return result.id;
}

async function syncSponsors(athleteId: string, seeds: SponsorSeed[]) {
  await prisma.sponsor.deleteMany({ where: { athleteId } });
  for (let order = 0; order < seeds.length; order++) {
    const s = seeds[order];
    const logoUrl = await ensureSeedAsset(s.logoFilename, s.logoSourceUrl);
    await prisma.sponsor.create({
      data: {
        athleteId,
        name: s.name,
        logoUrl,
        websiteUrl: s.websiteUrl,
        order,
      },
    });
  }
  console.log(`  ✓ ${seeds.length} sponsors`);
}

async function syncNewsletter(
  athleteId: string,
  n: NewsletterSeed,
): Promise<void> {
  const heroImageUrl = await ensureSeedAsset(n.hero.filename, n.hero.sourceUrl);
  const tournamentLogoUrl = n.tournamentLogo
    ? await ensureSeedAsset(n.tournamentLogo.filename, n.tournamentLogo.sourceUrl)
    : null;
  const kitImageUrl = n.kitImage
    ? await ensureSeedAsset(n.kitImage.filename, n.kitImage.sourceUrl)
    : null;

  const sections = n.buildSections({ kitImageUrl, tournamentLogoUrl });

  await prisma.newsletter.deleteMany({
    where: { athleteId, editionNumber: n.editionNumber },
  });

  const created = await prisma.newsletter.create({
    data: {
      athleteId,
      editionNumber: n.editionNumber,
      editionDate: n.editionDate,
      editionMode: n.editionMode,
      title: n.title,
      slug: n.slug,
      heroImageUrl,
      tournamentName: n.tournamentName,
      tournamentLogoUrl,
      tournamentCategory: n.tournamentCategory,
      tournamentLocation: n.tournamentLocation,
      tournamentSurface: n.tournamentSurface,
      tournamentStartDate: n.tournamentStartDate,
      tournamentEndDate: n.tournamentEndDate,
      worldRankSnapshot: n.worldRankSnapshot,
      countryRankSnapshot: n.countryRankSnapshot,
      status: NewsletterStatus.PUBLISHED,
      publishedAt: new Date(),
      sections: {
        create: sections.map((s, order) => ({
          type: s.type,
          order,
          blocks: s.blocks,
        })),
      },
    },
  });
  console.log(`  ✓ newsletter #${created.editionNumber} ${created.slug}`);
}

async function main() {
  const athleteIdBySlug = new Map<string, string>();

  for (const a of athletes) {
    const id = await syncAthlete(a);
    athleteIdBySlug.set(a.slug, id);
    const sponsorSeeds = sponsorsByAthlete[a.slug] ?? [];
    if (sponsorSeeds.length > 0) await syncSponsors(id, sponsorSeeds);
  }

  for (const n of newsletters) {
    const athleteId = athleteIdBySlug.get(n.athleteSlug);
    if (!athleteId) {
      console.warn(`✗ skipping newsletter — athlete '${n.athleteSlug}' not found`);
      continue;
    }
    await syncNewsletter(athleteId, n);
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
