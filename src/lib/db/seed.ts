import "dotenv/config";
import { Buffer } from "node:buffer";
import { NewsletterStatus, Sport, type Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { supabaseStorage } from "@/lib/storage/client";
import { ensureAthleteList } from "@/lib/brevo/lists";
import type { SectionTypeValue } from "@/lib/schemas/newsletterSection";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — refusing to seed");
}

// ── Supabase asset uploader ──────────────────────────────────────────
//
// Newsletter imagery (hero, tournament logo, kit photo) and sponsor
// logos originate on the Brevo CDN. We mirror them into the project's
// `media` bucket so the public site references our own storage. Each
// asset is keyed by a stable filename — the upload is skipped when the
// object already exists, making the seed idempotent and cheap to rerun.

const MEDIA_BUCKET = "media";
const SEED_PREFIX = "seed";
const assetUrlCache = new Map<string, string>();

async function ensureSeedAsset(
  filename: string,
  sourceUrl: string,
): Promise<string> {
  const cached = assetUrlCache.get(filename);
  if (cached) return cached;

  const objectPath = `${SEED_PREFIX}/${filename}`;
  const bucket = supabaseStorage.storage.from(MEDIA_BUCKET);

  const publicUrl = bucket.getPublicUrl(objectPath).data.publicUrl;

  // Skip re-upload when the object is already there.
  const { data: existing } = await bucket.list(SEED_PREFIX, {
    search: filename,
    limit: 1,
  });
  if (existing?.some((entry) => entry.name === filename)) {
    assetUrlCache.set(filename, publicUrl);
    return publicUrl;
  }

  const res = await fetch(sourceUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch asset ${sourceUrl}: ${res.status}`);
  }
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const buffer = Buffer.from(await res.arrayBuffer());

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
    avatarUrl: "/brand/heroes/iga-swiatek.jpg",
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
    avatarUrl: "/brand/heroes/alexander-bublik.jpg",
    socialLinks: {
      instagram: "https://www.instagram.com/bublik/",
    },
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
    avatarUrl: "/brand/portraits/flavio-cobolli.jpg",
    socialLinks: {
      instagram: "https://www.instagram.com/flavio_cobbo/",
      x: "https://x.com/cobollifla",
      tiktok: "https://www.tiktok.com/@flaviocobolli",
    },
  },
];

// ── Sponsor seeds ────────────────────────────────────────────────────
//
// Logos live on Brevo's CDN; the seed mirrors each one into Supabase
// before persisting the Sponsor row. Order controls display sequence
// in the athlete header and newsletter sponsor strip.

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
      name: "Tecnifibre",
      logoFilename: "sponsor-iga-tecnifibre.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69cf809de07c75ded60a2489.png",
      websiteUrl: "https://www.tecnifibre.com/en",
    },
    {
      name: "OSHEE",
      logoFilename: "sponsor-iga-oshee.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69cf80a2186f62d83f9a664f.png",
      websiteUrl: "https://oshee.eu",
    },
    {
      name: "Rolex",
      logoFilename: "sponsor-iga-rolex.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69cf80a770316a71384e8dfb.png",
      websiteUrl: "https://www.rolex.com",
    },
    {
      name: "Oral-B",
      logoFilename: "sponsor-iga-oral-b.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69cf80ac163e39a9bf8d4c06.png",
      websiteUrl: "https://oralb.com",
    },
    {
      name: "Lego",
      logoFilename: "sponsor-iga-lego.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69cf80b270316a71384e8e02.png",
      websiteUrl: "https://www.lego.com",
    },
    {
      name: "Visa",
      logoFilename: "sponsor-iga-visa.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69cf80b8186f62d83f9a6657.png",
      websiteUrl: "https://www.visa.com",
    },
    {
      name: "Infosys",
      logoFilename: "sponsor-iga-infosys.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69cf80c3e07c75ded60a249f.png",
      websiteUrl: "https://www.infosys.com",
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
    {
      name: "Diadem",
      logoFilename: "sponsor-bublik-diadem.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69dc9d385283d836eca904e4.png",
      websiteUrl: "https://diademsports.com",
    },
    {
      name: "Bianchet",
      logoFilename: "sponsor-bublik-bianchet.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69dc9d3b65b942fd5925da56.png",
      websiteUrl: "https://www.bianchet.com/the-brand/partners-friends",
    },
    {
      name: "Lexus",
      logoFilename: "sponsor-bublik-lexus.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69dc9d405283d836eca904e9.png",
      websiteUrl: "https://discoverlexus.com",
    },
    {
      name: "Codos",
      logoFilename: "sponsor-bublik-codos.jpg",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69dc9d45648713cd2e9ca7b5.jpg",
      websiteUrl: "https://codos.network",
    },
  ],
};

// ── Newsletter seeds ─────────────────────────────────────────────────
//
// Hero, tournament logo and kit imagery are referenced by filename;
// `ensureSeedAsset` uploads them into Supabase at run time. Section
// content matches the per-type Zod schemas in newsletterSection.ts.

type SectionSeed = {
  type: SectionTypeValue;
  content: Prisma.InputJsonValue;
};

type AssetRef = {
  filename: string;
  sourceUrl: string;
};

type NewsletterSeed = {
  athleteSlug: string;
  editionNumber: number;
  editionDate: Date;
  title: string;
  slug: string;
  tournamentName: string;
  tournamentContext: string;
  worldRankSnapshot: number;
  countryRankSnapshot: number;
  hero: AssetRef;
  tournamentLogo: AssetRef;
  kitImage: AssetRef | null;
  buildSections: (assets: { kitImageUrl: string | null }) => SectionSeed[];
};

const newsletters: NewsletterSeed[] = [
  // ── Flavio Cobolli — Monte Carlo #01 ───────────────────────────
  {
    athleteSlug: "flavio-cobolli",
    editionNumber: 1,
    editionDate: new Date("2026-04-08"),
    title: "Monte Carlo: what a week",
    slug: "monte-carlo-2026",
    tournamentName: "Rolex Monte-Carlo Masters",
    tournamentContext: "2nd Round — Rolex Monte-Carlo Masters 2026",
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
    buildSections: ({ kitImageUrl }) => [
      {
        type: "DEBRIEF",
        content: {
          body:
            "Monte Carlo. One of the tournaments I look forward to the most — the clay, the setting, the atmosphere on those courts. First round against Comesana was a real battle. I dropped the second set but came back in the third. 7-5, 2-6, 6-3 — took what I needed. Then Blockx in the second round. He played better than me. 3-6, 3-6, no arguments. Disappointing — but the clay swing is just starting and there's a lot ahead.",
          pullQuote: {
            contextLabel: "After R2 vs Blockx",
            text:
              "He was better today. I didn't play my best when it mattered — and at this level, that's the match. You take it, you learn, you move on.",
          },
        },
      },
      {
        type: "RESULTS",
        content: {
          stats: [
            { value: "R2", label: "Singles" },
            { value: "#10", label: "Seed" },
            { value: "1-1", label: "W / L" },
          ],
          matches: [
            {
              result: "W",
              opponentName: "F. Comesaña",
              opponentRank: "#99",
              opponentCountry: "ARG",
              score: "7-5 2-6 6-3",
              roundName: "Round 1",
              date: "6 April",
              commentary:
                "Comesana is a tough opener on clay — heavy ball, fights for every point, never gives you rhythm for free. I lost the second set and had to find something extra in the third. Not my cleanest match but I found what I needed when it counted.",
              highlightUrl: "https://www.youtube.com/watch?v=AA2_J2gaj5I",
            },
            {
              result: "L",
              opponentName: "A. Blockx",
              opponentRank: "#91",
              opponentCountry: "BEL",
              score: "3-6 3-6",
              roundName: "Round 2",
              date: "8 April",
              commentary:
                "Blockx played a clean match. He's a good mover on clay and he made it difficult from the first game. I never found my baseline game — couldn't impose my forehand, couldn't build the points the way I wanted. Those days happen.",
              highlightUrl:
                "https://www.tennistv.com/videos/4484136/monte-carlo-2026-r2-cobolli-blockx-short-highlights",
            },
          ],
          pressLinks: [
            {
              source: "ATP Tour",
              headline: "Blockx claims seeded scalp of Cobolli in Monte-Carlo",
              url: "https://www.atptour.com/en/news/blockx-fonseca-monte-carlo-2026-monday",
            },
            {
              source: "ATP Tour",
              headline: "All results — Rolex Monte-Carlo Masters 2026",
              url: "https://www.atptour.com/en/scores/archive/monte-carlo/410/2026/results",
            },
          ],
        },
      },
      {
        type: "WHATS_NEXT",
        content: {
          tournamentMeta:
            "BMW Open by Bitpanda · 14-20 April 2026 · ATP 500 · 🟤 Clay",
          body:
            "Munich first — ATP 500, clay, a tournament I've always enjoyed. Then Madrid, Rome, Roland Garros. This is the swing where I want to show what I can do. Monte Carlo was a short week, but there were good signs. Time to build on them.",
          schedule: [
            {
              dateRange: "Apr 8-9",
              title: "Rest days in Rome",
              description:
                "Back home. Family, proper food, no racket. Reset the head after Monte Carlo.",
            },
            {
              dateRange: "Apr 10-12",
              title: "Training block",
              description:
                "Back on court. Clay work, serve practice, match patterns. Getting sharp again before Munich.",
            },
            {
              dateRange: "Apr 13",
              title: "Arrival in Munich",
              description:
                "BMW Open starts April 14. Arriving the day before to get a feel for the courts at MTTC Iphitos.",
            },
          ],
        },
      },
      {
        type: "KIT",
        content: {
          body:
            "Clay season means different demands on everything — your shoes, your skin, your kit. On's CloudFly gives me the traction I need on Monte Carlo's red clay, and La Roche-Posay SPF 50 is part of my pre-match routine when you're outside for hours.",
          ...(kitImageUrl ? { imageUrl: kitImageUrl } : {}),
          cta: {
            label: "Discover On's clay season gear",
            url: "https://www.on.com/en-us/collection/tennis",
          },
        },
      },
      {
        type: "ENGAGEMENT",
        content: {
          question: "What do you want to see from Munich?",
          pollOptions: [
            { label: "Tactical breakdown of a match", emoji: "🌟", isHighlighted: false },
            { label: "A day in my life on tour", emoji: "🏊", isHighlighted: false },
            { label: "My pre-match preparation routine", emoji: "🏁", isHighlighted: false },
            { label: "What it means to play in Italy", emoji: "🎶", isHighlighted: false },
          ],
          pollUrl: "https://flaviocobolli.com/vote/munich26",
        },
      },
    ],
  },

  // ── Flavio Cobolli — Munich #02 ────────────────────────────────
  {
    athleteSlug: "flavio-cobolli",
    editionNumber: 2,
    editionDate: new Date("2026-04-20"),
    title: "Munich: a final to remember",
    slug: "munich-2026",
    tournamentName: "BMW Open by Bitpanda",
    tournamentContext: "Runner-up — BMW Open Munich 2026",
    worldRankSnapshot: 13,
    countryRankSnapshot: 3,
    hero: {
      filename: "cobolli-munich-hero.jpg",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69eb24fa96b9e15bbc850490.jpg",
    },
    tournamentLogo: {
      filename: "cobolli-munich-logo.jpeg",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69eb25cce00691c2189eb88c.jpeg",
    },
    kitImage: {
      filename: "cobolli-munich-kit.jpeg",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69eb2d94efc1924cd8115c2d.jpeg",
    },
    buildSections: ({ kitImageUrl }) => [
      {
        type: "DEBRIEF",
        content: {
          body:
            "Munich is done. A runner-up finish against Ben Shelton — 2-6, 5-7. It hurts to lose a final. But this week was one I'll carry with me for a long time. No sets dropped until Sunday. Zverev in the semis — the biggest win of my career. Shelton was simply better in the final. There will be other finals on clay.",
          pullQuote: {
            contextLabel: "Post-final · Munich · 19 April",
            text:
              "I'm proud of this week. I beat Zverev — one of the best players in the world on this surface — and reached my third ATP 500 final. The level I showed gives me a lot of confidence heading into the rest of the clay season.",
          },
        },
      },
      {
        type: "RESULTS",
        content: {
          stats: [
            { value: "Final", label: "Result" },
            { value: "ATP 500", label: "Category" },
            { value: "4-1", label: "W / L" },
          ],
          matches: [
            {
              result: "W",
              opponentName: "D. Dedura-Palomero",
              opponentCountry: "GER",
              score: "6-4 7-5",
              roundName: "Round 1",
              date: "14 April",
              highlightUrl:
                "https://www.atptour.com/en/video/highlights-cobolli-dashes-nextgenatp-deduras-munich-2026-hopes",
            },
            {
              result: "W",
              opponentName: "Z. Bergs",
              opponentRank: "#40",
              opponentCountry: "BEL",
              score: "6-2 6-3",
              roundName: "Round of 16",
              date: "15 April",
              highlightUrl:
                "https://www.atptour.com/en/video/highlights-cobolli-sinks-bergs-to-book-qf-spot-in-munich-2026",
            },
            {
              result: "W",
              opponentName: "V. Kopriva",
              opponentCountry: "CZE",
              score: "6-3 6-2",
              roundName: "Quarterfinal",
              date: "17 April",
              highlightUrl:
                "https://www.atptour.com/en/video/highlights-cobolli-marches-past-kopriva-into-munich-2026-sfs",
            },
            {
              result: "W",
              opponentName: "A. Zverev",
              opponentRank: "#3",
              opponentCountry: "GER",
              score: "6-3 6-3",
              roundName: "Semifinal",
              date: "18 April",
              contextNote: "Biggest career win",
              commentary:
                "I served well, returned deep, and trusted my forehand on the big points. Walking off court I knew the level was there — now it was about backing it up in the final.",
              highlightUrl:
                "https://www.atptour.com/en/video/highlights-cobolli-fires-past-zverev-into-munich-2026-final",
            },
            {
              result: "L",
              opponentName: "B. Shelton",
              opponentRank: "#6",
              opponentCountry: "USA",
              score: "2-6 5-7",
              roundName: "Final",
              date: "19 April",
              commentary:
                "Shelton came out at a level I couldn't match in the first set. The second was close. That's sport.",
              highlightUrl:
                "https://www.atptour.com/en/video/extended-highlights-shelton-defeats-cobolli-for-munich-2026-title",
            },
          ],
          pressLinks: [
            {
              source: "ATP Tour",
              headline: "Cobolli hits 32 winners to stun defending champion Zverev",
              url: "https://www.atptour.com/en/news/zverev-cobolli-munich-2026-sfs",
            },
            {
              source: "Tennis365",
              headline: "Shelton defeats Cobolli in Munich final",
              url: "https://www.tennis365.com/tennis-news/ben-shelton-flavio-cobolli-prize-money-ranking-points-bmw-open-munich",
            },
            {
              source: "Tennis Gazette",
              headline:
                "Cobolli sends heartfelt message to Shelton after emotional Munich week",
              url: "https://www.thetennisgazette.com/news/flavio-cobolli-sends-message-to-ben-shelton-on-social-media-after-losing-to-him-in-the-final-in-munich/",
            },
          ],
        },
      },
      {
        type: "WHATS_NEXT",
        content: {
          tournamentMeta:
            "Mutua Madrid Open · 25 April–4 May 2026 · Masters 1000 · 🟤 Clay",
          body:
            "Munich is behind me. Madrid is next. This is the clay block I've been building toward for two years — I want to go deep at every tournament between here and Roland Garros. I'm arriving with confidence and a clear head.",
          schedule: [
            {
              dateRange: "20-21 Apr",
              title: "Rest day in Rome",
              description:
                "Back home. Family, proper food, no racket. Reset the mind after an intense week.",
            },
            {
              dateRange: "22-24 Apr",
              title: "Light clay block",
              description:
                "Short sessions on clay. Physio, footwork. Keep the legs fresh after five days in Munich.",
            },
            {
              dateRange: "25 Apr",
              title: "Arrival in Madrid",
              description:
                "Set up at the Caja Magica. First practice on altitude clay. The conditions are very different from Munich.",
            },
            {
              dateRange: "Late Apr–May",
              title: "Mutua Madrid Open",
              description:
                "Masters 1000. My goal: go further than I ever have at this level. The confidence from Munich is real.",
            },
          ],
        },
      },
      {
        type: "KIT",
        content: {
          body:
            "Four wins, one final. The On kit moved with me from day one. The Head racket gave me everything against Zverev. When you stop thinking about your gear — that's when you know it's right.",
          ...(kitImageUrl ? { imageUrl: kitImageUrl } : {}),
          cta: { label: "Discover my kit", url: "https://flaviocobolli.com/kit" },
        },
      },
      {
        type: "ENGAGEMENT",
        content: {
          question: "What's my biggest weapon on clay?",
          pollOptions: [
            { label: "Aggressive baseline game", isHighlighted: false },
            { label: "Return of serve", isHighlighted: false },
            { label: "Speed and movement", isHighlighted: false },
            { label: "Mental toughness under pressure", isHighlighted: false },
          ],
          pollUrl: "https://flaviocobolli.com/vote/clay26",
        },
      },
    ],
  },

  // ── Iga Świątek — Miami #02 ─────────────────────────────────────
  {
    athleteSlug: "iga-swiatek",
    editionNumber: 2,
    editionDate: new Date("2026-03-24"),
    title: "Miami: a tough quarter",
    slug: "miami-2026",
    tournamentName: "Miami Open",
    tournamentContext: "Six-time Grand Slam champion",
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
    buildSections: ({ kitImageUrl }) => [
      {
        type: "DEBRIEF",
        content: {
          body:
            "Miami is done — and it hurts. I dominated the first set against Magda, played exactly how I wanted to. Then something shifted. In the second and third sets, I lost grip of everything I'd built. She led 5-2 in the third — I saved two match points, got back to 5-3. But she closed it out. 73 opening-round wins, gone. Clay season starts now — and that's where I feel most like myself.",
          pullQuote: {
            contextLabel: "Post-match interview",
            text:
              "I stopped doing anything well tactically. Tennis feels complicated in my head. I know it's supposed to be simple. In terms of my mentality and how I feel on court, it's going to take a while.",
          },
        },
      },
      {
        type: "RESULTS",
        content: {
          stats: [
            { value: "R2", label: "Singles" },
            { value: "0-1", label: "W / L" },
          ],
          matches: [
            {
              result: "BYE",
              roundName: "Round 1",
              date: "Mar 18",
              contextNote: "Seed #2",
            },
            {
              result: "L",
              opponentName: "M. Linette",
              opponentRank: "#50",
              opponentCountry: "POL",
              score: "6-1 5-7 3-6",
              roundName: "Round 2",
              date: "Mar 20",
              contextNote: "All-Polish clash",
              commentary:
                "I led the first set, broke her twice, won 88% of first-serve points. And then I lost the thread completely. Magda raced to 5-2 in the third — I saved two of her match points and pulled it back to 5-3. But she closed it out on her fourth chance. When you save match points and still lose, it stings differently.",
              highlightUrl:
                "https://www.wtatennis.com/news/4472909/linette-ends-swiateks-73-match-opening-win-streak-into-miami-third-round",
            },
          ],
          pressLinks: [
            {
              source: "Sky Sports",
              headline: "Swiatek suffers shock first-round defeat in Miami",
              url: "https://www.skysports.com/tennis/news/12110/13522050/miami-open-iga-swiatek-suffers-shock-first-round-defeat",
            },
            {
              source: "WTA",
              headline:
                "Linette ends Swiatek's 73-match opening-round win streak",
              url: "https://www.wtatennis.com/news/4472909/linette-ends-swiateks-73-match-opening-win-streak",
            },
          ],
          subSection: {
            label: "A new chapter",
            body:
              "This wasn't a decision I made in Miami. The process started in Doha, after the loss to Sakkari. Wim and I sat down and talked for a long time — we tried to find solutions. When I looked at the whole picture honestly, I knew I needed a different direction. Two years together, one Wimbledon title — I'm grateful for all of it. Now I head to Rafa's academy in Manacor to work with Francisco Roig. A new voice, a new perspective. This is not panic. This is a decision I made with a clear head.",
            pressLinks: [
              {
                source: "Tennis.com",
                headline: "Swiatek splits from coach Fissette following Miami loss",
                url: "https://www.tennis.com/news/articles/iga-swiatek-announces-split-from-coach-wim-fissette-following-miami-open-loss",
              },
              {
                source: "Yahoo Sports",
                headline:
                  "Swiatek already spotted with new coach Roig — 9 days after Fissette split",
                url: "https://sports.yahoo.com/articles/iga-swiatek-spotted-coach-just-171900446.html",
              },
            ],
          },
        },
      },
      {
        type: "WHATS_NEXT",
        content: {
          tournamentMeta:
            "Stuttgart · Madrid · Roland Garros · 🟤 Clay season begins",
          body:
            "Two weeks on hard court, two early exits. Now I go home. The clay season is where I've always found my best tennis, and I need it more than ever right now. I'll take a few days off, reset completely, and then build toward Stuttgart and Madrid.",
          schedule: [
            {
              dateRange: "Mar 21-23",
              title: "Flight home to Poland",
              description: "Family, rest, no racket.",
            },
            {
              dateRange: "Mar 24-28",
              title: "Active recovery",
              description:
                "Ice baths, physio, sleep. Mental reset with my team and Daria.",
            },
            {
              dateRange: "Mar 29–Apr 5",
              title: "Clay transition",
              description:
                "First sessions on clay. Footwork, timing, topspin.",
            },
            {
              dateRange: "Apr 14-20",
              title: "Porsche Grand Prix Stuttgart",
              description:
                "First clay tournament of the season. Defending title territory.",
            },
          ],
        },
      },
      {
        type: "KIT",
        content: {
          body:
            "After a tough stretch, recovery is also part of the job. Lego builds, a good book, sleep without an alarm — and my Tecnifibre resting in the corner until I'm ready to pick it up again. We'll be back soon.",
          ...(kitImageUrl ? { imageUrl: kitImageUrl } : {}),
        },
      },
      {
        type: "ENGAGEMENT",
        content: {
          question:
            "Which part of my game should I focus on heading into the clay season?",
          pollOptions: [
            { label: "Serve consistency", isHighlighted: false },
            { label: "Mental resilience in tight sets", isHighlighted: false },
            { label: "Forehand under pressure", isHighlighted: false },
            {
              label: "Everything is fine — just trust yourself!",
              emoji: "🏆",
              isHighlighted: true,
            },
          ],
          pollUrl: "https://igaswiatek.com/vote/clay26",
        },
      },
    ],
  },

  // ── Alexander Bublik — Monte Carlo #01 ──────────────────────────
  {
    athleteSlug: "alexander-bublik",
    editionNumber: 1,
    editionDate: new Date("2026-04-13"),
    title: "Monte Carlo: a quarterfinal to build on",
    slug: "monte-carlo-2026",
    tournamentName: "Rolex Monte-Carlo Masters",
    tournamentContext: "ATP World No. 11 · Kazakhstan",
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
    buildSections: ({ kitImageUrl }) => [
      {
        type: "DEBRIEF",
        content: {
          body:
            "Hey everyone. Monte Carlo. A year ago I was in qualifying here, losing a third set 6-0. This week I reached the quarterfinal. That's the kind of progress that keeps you going. Two clean wins — Monfils, then Lehečka — and then Alcaraz happened. 6-3, 6-0. A bagel in the second. I'll take it. The clay swing last year changed a lot of things for me. I want to keep building on that. Madrid is next.",
          pullQuote: {
            contextLabel: "After the QF vs Alcaraz",
            text:
              "He was on another level today. I had my chances in the first set. The second set… let's just say he was better. But I'm happy with the week — this is my best result here.",
          },
        },
      },
      {
        type: "RESULTS",
        content: {
          stats: [
            { value: "QF", label: "Best result" },
            { value: "3", label: "Matches" },
            { value: "2-1", label: "W / L" },
          ],
          matches: [
            {
              result: "BYE",
              roundName: "1st Round",
              date: "6 April",
              contextNote: "Seeded #8",
            },
            {
              result: "W",
              opponentName: "G. Monfils",
              opponentCountry: "FRA",
              score: "6-4 6-4",
              roundName: "Round 2",
              date: "Tue 7 April",
              contextNote: "1h16",
              commentary:
                "Ten years ago, I was a hitting partner here in Monte Carlo. Gaël gave me some words that I never forgot. At the net after our match, I reminded him — 'You told me: grass is not your surface, here is your main.' He smiled straight away. He remembered. One of those moments you don't plan but that stay with you.",
              highlightUrl:
                "https://www.atptour.com/en/video/highlights-bublik-dials-in-to-end-monfils-montecarlo-2026-career",
            },
            {
              result: "W",
              opponentName: "J. Lehečka",
              opponentRank: "#13",
              opponentCountry: "CZE",
              score: "6-2 7-5",
              roundName: "Round of 16",
              date: "Thu 9 April",
              highlightUrl:
                "https://www.atptour.com/en/video/highlights-bublik-downs-lehecka-for-maiden-monte-carlo-2026-qf-spot",
            },
            {
              result: "L",
              opponentName: "C. Alcaraz",
              opponentRank: "#1",
              opponentCountry: "ESP",
              score: "3-6 0-6",
              roundName: "Quarterfinal",
              date: "Fri 10 April",
              highlightUrl:
                "https://www.atptour.com/en/news/alcaraz-bublik-monte-carlo-2026-friday",
            },
          ],
          pressLinks: [
            {
              source: "Eurosport",
              headline:
                "Bublik, dix ans après : le sparring-partner devenu bourreau de Monfils sur le Rocher",
              url: "https://www.eurosport.fr/tennis/atp-monte-carlo/2026/gael-monfils-et-son-defi-physique-pour-des-adieux-pleinement-reussis-jai-envie-de-faire-mieux-mais-mon-corps-ne-le-permet-pas_sto23288232/story.shtml",
            },
            {
              source: "Sky Sports",
              headline: "Alcaraz vs Bublik — Monte Carlo QF highlights",
              url: "https://www.skysports.com/tennis/video/33733/13530157/carlos-alcaraz-vs-alexander-bublik-monte-carlo-highlights",
            },
            {
              source: "Tennis Majors",
              headline:
                "Bublik ends Monfils's Monte Carlo farewell — and the memories he helped create",
              url: "https://www.tennismajors.com/atp/bublik-ends-monfilss-monte-carlo-farewell-and-the-memories-he-helped-create-847987.html",
            },
            {
              source: "Last Word on Sports",
              headline:
                "Alcaraz and Bublik set for first-ever meeting in Monte Carlo quarterfinals",
              url: "https://lastwordonsports.com/tennis/2026/04/09/carlos-alcaraz-alexander-bublik-first-meeting/",
            },
          ],
        },
      },
      {
        type: "WHATS_NEXT",
        content: {
          tournamentMeta: "BMW Open Munich · 14-20 April 2026 · 🟤 Clay",
          body:
            "Munich first, then Madrid, then Rome, then Roland Garros. Last year the clay swing was where everything clicked — two titles, a Grand Slam quarterfinal. I want more of that. A QF here in Monte Carlo is a good start. The serve travels on this surface. Let's keep going.",
          schedule: [],
        },
      },
      {
        type: "KIT",
        content: {
          body: "The kit I wore all week in Monte Carlo.",
          ...(kitImageUrl ? { imageUrl: kitImageUrl } : {}),
          cta: {
            label: "Discover the kit",
            url: "https://www.armani.com/en-wx/ea7/experience/athletes/",
          },
        },
      },
      {
        type: "ENGAGEMENT",
        content: {
          question: "What was the highlight of my week in Monte Carlo?",
          pollOptions: [
            { label: "The win vs Monfils", emoji: "🎯", isHighlighted: false },
            { label: "Beating Lehečka (ATP #13)", emoji: "💪", isHighlighted: false },
            {
              label: "Reaching my first Monte Carlo QF",
              emoji: "🏆",
              isHighlighted: false,
            },
            {
              label: "Surviving clay as Alex Bublik",
              emoji: "😂",
              isHighlighted: true,
            },
          ],
        },
      },
    ],
  },
];

// ── Orchestration ────────────────────────────────────────────────────

async function syncAthlete(seed: AthleteSeed): Promise<string> {
  const { socialLinks, ...rest } = seed;
  const data = {
    ...rest,
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
  // Wipe and recreate to keep ordering and content fully driven by seed.
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
  const tournamentLogoUrl = await ensureSeedAsset(
    n.tournamentLogo.filename,
    n.tournamentLogo.sourceUrl,
  );
  const kitImageUrl = n.kitImage
    ? await ensureSeedAsset(n.kitImage.filename, n.kitImage.sourceUrl)
    : null;

  const sections = n.buildSections({ kitImageUrl });

  await prisma.newsletter.deleteMany({
    where: { athleteId, editionNumber: n.editionNumber },
  });

  const created = await prisma.newsletter.create({
    data: {
      athleteId,
      editionNumber: n.editionNumber,
      editionDate: n.editionDate,
      title: n.title,
      slug: n.slug,
      heroImageUrl,
      tournamentName: n.tournamentName,
      tournamentLogoUrl,
      tournamentContext: n.tournamentContext,
      worldRankSnapshot: n.worldRankSnapshot,
      countryRankSnapshot: n.countryRankSnapshot,
      status: NewsletterStatus.PUBLISHED,
      publishedAt: new Date(),
      sections: {
        create: sections.map((s, order) => ({
          type: s.type,
          order,
          content: s.content,
        })),
      },
    },
  });
  console.log(
    `  ✓ newsletter #${created.editionNumber} ${created.slug}`,
  );
}

async function main() {
  const athleteIdBySlug = new Map<string, string>();

  for (const a of athletes) {
    const id = await syncAthlete(a);
    athleteIdBySlug.set(a.slug, id);

    const sponsorSeeds = sponsorsByAthlete[a.slug] ?? [];
    if (sponsorSeeds.length > 0) {
      await syncSponsors(id, sponsorSeeds);
    }
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
