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
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
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
    slug: "arthur-rinderknech",
    firstName: "Arthur",
    lastName: "Rinderknech",
    countryCode: "FRA",
    countryName: "France",
    tour: "ATP",
    sport: Sport.TENNIS,
    worldRank: 27,
    countryRank: 1,
    titlesCount: 1,
    bio: "Joueur français de tennis, #1 français à l'ATP. Né à Gassin, formé à Rennes.",
    avatar: {
      filename: "athlete-arthur-rinderknech-avatar.jpg",
      sourceUrl: "/brand/heroes/arthur-rinderknech.jpg",
    },
    socialLinks: {
      instagram:
        "https://www.instagram.com/arthurrinder?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      x: "https://x.com/arthurrinder?s=20",
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
  "arthur-rinderknech": [
    {
      name: "Psycho Bunny",
      logoFilename: "sponsor-arthur-psycho-bunny.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69c3fee5808eb23066b339e9.png",
      websiteUrl: "https://psychobunny.com",
    },
    {
      name: "Tecnifibre",
      logoFilename: "sponsor-arthur-tecnifibre.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69c3ff480b0eb0e5dc3d5275.png",
      websiteUrl: "https://www.tecnifibre.com",
    },
    {
      name: "Extia",
      logoFilename: "sponsor-arthur-extia.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69c3ff1987384ceb6aab04d1.png",
      websiteUrl: "https://www.extia-group.com",
    },
    {
      name: "Fosvia",
      logoFilename: "sponsor-arthur-fosvia.png",
      logoSourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69c3ff370b0eb0e5dc3d526b.png",
      websiteUrl: "https://www.fosvia.com",
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
  reviewVoicenote: AssetRef | null;
  comingUpVoicenote: AssetRef | null;
  buildSections: (assets: {
    kitImageUrl: string | null;
    tournamentLogoUrl: string | null;
    reviewVoicenoteUrl: string | null;
    comingUpVoicenoteUrl: string | null;
  }) => Array<{ type: SectionTypeValue; blocks: Prisma.InputJsonValue }>;
};

const newsletters: NewsletterSeed[] = [
  // ── #01 — Indian Wells (TOURNAMENT) ────────────────────────────────
  {
    athleteSlug: "arthur-rinderknech",
    editionNumber: 1,
    editionDate: new Date("2026-03-17"),
    editionMode: "TOURNAMENT",
    title: "Retour sur ma semaine",
    slug: "indian-wells-2026",
    tournamentName: "BNP Paribas Open",
    tournamentCategory: "ATP Masters 1000",
    tournamentLocation: "Indian Wells, USA",
    tournamentSurface: "Dur",
    tournamentStartDate: new Date("2026-03-04"),
    tournamentEndDate: new Date("2026-03-15"),
    worldRankSnapshot: 27,
    countryRankSnapshot: 1,
    hero: {
      filename: "arthur-indian-wells-hero.jpg",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69d4d56906cc717826a737b3.jpg",
    },
    tournamentLogo: {
      filename: "arthur-indian-wells-bnp-logo.png",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69d4d56c79eef569b558bf96.png",
    },
    kitImage: {
      filename: "arthur-indian-wells-psycho-bunny-kit.jpg",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69d4d57206cc717826a737b9.jpg",
    },
    reviewVoicenote: {
      filename: "arthur-iw2026-review-voicenote.wav",
      sourceUrl: "/brand/voicenotes/sample-silence.wav",
    },
    comingUpVoicenote: {
      filename: "arthur-mc2026-preview-voicenote.wav",
      sourceUrl: "/brand/voicenotes/sample-silence.wav",
    },
    buildSections: ({
      kitImageUrl,
      tournamentLogoUrl,
      reviewVoicenoteUrl,
      comingUpVoicenoteUrl,
    }) => [
      {
        type: "ATHLETE_REVIEW",
        blocks: [
          ...(reviewVoicenoteUrl
            ? [
                {
                  kind: "audio",
                  url: reviewVoicenoteUrl,
                  title: "Note vocale",
                  location: "Indian Wells · 16 Mars",
                  durationLabel: "0:54",
                },
              ]
            : []),
          {
            kind: "text",
            body:
              "Indian Wells c'est terminé. En simple, j'ai pris le premier set à Alcaraz, mené un break dans le 2e. Mes ischio-jambiers ont crampé — c'est lui qui m'a mis dans cet état. En double avec Valentin, on bat Medvedev, Djokovic, Tsitsipas, Rublev, Khachanov. On arrive en finale d'un Masters 1000. Finale perdue, mais la tête haute.",
          },
          {
            kind: "text",
            body:
              "Après le match vs Alcaraz — « Il y en a peut-être un dans le monde capable de tenir cette intensité. J'aurais aimé être le premier à le battre en 2026, mais ça ne sera pas pour ce soir. »",
          },
        ],
      },
      {
        type: "WEEK_RECAP",
        blocks: [
          {
            kind: "tournament_summary",
            logoUrl: tournamentLogoUrl ?? undefined,
            name: "BNP Paribas Open",
            category: "ATP Masters 1000",
            location: "Indian Wells, USA",
            surface: "Dur",
            dateRange: "4–15 Mars 2026",
          },
          { kind: "hero_metric", value: "3e tour", label: "En simple" },
          { kind: "hero_metric", value: "Finaliste", label: "En double" },
          { kind: "hero_metric", value: "4-1", label: "V / D" },
          {
            kind: "match_card",
            format: "singles",
            result: "EXEMPT",
            roundName: "Simple · 1er Tour",
            date: "4 Mars",
            contextNote: "Tête de série #26",
          },
          {
            kind: "match_card",
            format: "singles",
            result: "W",
            roundName: "Simple · 2e Tour",
            opponentName: "J.M. Cerundolo",
            opponentRank: "#20",
            opponentCountry: "ARG",
            date: "7 Mars",
            contextNote: "Walkover · forfait blessure de Cerundolo",
          },
          {
            kind: "match_card",
            format: "singles",
            result: "L",
            roundName: "Simple · 3e Tour",
            opponentName: "C. Alcaraz",
            opponentRank: "#1",
            opponentCountry: "ESP",
            score: "7-6(6) 3-6 2-6",
            date: "9 Mars",
            commentary:
              "Premier set pris, break d'avance dans le 2e. Les ischios ont lâché — c'est lui qui m'a mis dans cet état.",
            highlightUrl:
              "https://www.atptour.com/en/video/highlights-alcaraz-earns-comeback-win-vs-rinderknech-in-indian-wells-2026",
          },
          {
            kind: "match_card",
            format: "doubles",
            result: "W",
            roundName: "Double · 1er Tour",
            opponentName: "Medvedev / Tien",
            score: "7-5 6-3",
            date: "9 Mars",
            contextNote: "avec V. Vacherot",
            highlightUrl:
              "https://www.atptour.com/en/video/hot-shot-tweener-denied-rinderknechvacherot-outfox-medvedevtien-in-indian-wells-2026",
          },
          {
            kind: "match_card",
            format: "doubles",
            result: "W",
            roundName: "Double · 2e Tour",
            opponentName: "Djokovic / Tsitsipas",
            score: "7-6(4) 7-5",
            date: "11 Mars",
            contextNote: "avec V. Vacherot",
            highlightUrl:
              "https://www.atptour.com/en/video/highlights-rinderknechvacherot-down-djokovictsitsipas-in-indian-wells-2026-doubles",
          },
          {
            kind: "match_card",
            format: "doubles",
            result: "W",
            roundName: "Double · Quart de finale",
            opponentName: "Khachanov / Rublev",
            score: "6-3 6-4",
            date: "13 Mars",
            contextNote: "avec V. Vacherot",
          },
          {
            kind: "match_card",
            format: "doubles",
            result: "W",
            roundName: "Double · Demi-finale",
            opponentName: "Goransson / Bhambri",
            score: "7-5 6(4)-7 [10-5]",
            date: "14 Mars",
            contextNote: "avec V. Vacherot",
            highlightUrl:
              "https://www.atptour.com/en/video/extended-highlights-rinderknechvacherot--andreozziguinard-earn-sf-wins-in-indian-wells-2026",
          },
          {
            kind: "match_card",
            format: "doubles",
            result: "L",
            roundName: "Double · Finale 🥈",
            opponentName: "Andreozzi / Guinard",
            score: "6-7(3) 3-6",
            date: "15 Mars",
            contextNote: "avec V. Vacherot",
            commentary:
              "Je repense encore à ce set point à 5-4. On avait le dessus. Valentin et moi, on vient du circuit universitaire. Arriver en finale d'un Masters 1000 et battre Djokovic, Tsitsipas, Rublev, Khachanov — personne ne nous avait prédit ça. La défaite fait mal. Mais on revient.",
            highlightUrl:
              "https://www.tennistv.com/videos/4469534/indian-wells-2026-final-andreozzi-guinard-rinderknech-vacherot-short-highlights",
          },
          {
            kind: "media_link",
            source: "Eurosport",
            headline: "Rinderknech a bousculé l'intouchable Alcaraz",
            url: "https://www.eurosport.fr/tennis/indian-wells-2026-arthur-rinderknech-a-bouscule-lintouchable-carlos-alcaraz-taylor-fritz-et-alexander-bublik-deja-elimines_sto23279360/story.shtml",
          },
          {
            kind: "media_link",
            source: "L'Équipe / WLT",
            headline:
              "« Il y en a peut-être un dans le monde capable de faire ça »",
            url: "https://www.welovetennis.fr/atp/atp-indian-wells/rinderknech-encore-battu-par-alcaraz-il-y-en-a-peut-etre-un-dans-le-monde-capable-de-faire-cela",
          },
          {
            kind: "media_link",
            source: "BNP Paribas Open",
            headline: "Family Affair : les cousins renversent Djokovic/Tsitsipas",
            url: "https://bnpparibasopen.com/news/doubles-sf1-highlights-indian-wells-2026",
          },
          {
            kind: "media_link",
            source: "Tennis Up To Date",
            headline: "Rinderknech & Vacherot : course en finale inoubliable",
            url: "https://tennisuptodate.com/atp/cousins-rinderknech-and-vacherot-fall-just-short-in-indian-wells-doubles-final-after-standout-run",
          },
        ],
      },
      {
        type: "COMING_UP",
        blocks: [
          ...(comingUpVoicenoteUrl
            ? [
                {
                  kind: "audio",
                  url: comingUpVoicenoteUrl,
                  title: "Note vocale",
                  location: "Monte-Carlo · Preview semaine",
                  durationLabel: "0:45",
                },
              ]
            : []),
          {
            kind: "text",
            body:
              "Rolex Monte-Carlo Masters · 6–13 Avril 2026 · Tête de série #26 · 🟤 Terre battue",
          },
          {
            kind: "text",
            body:
              "Monte-Carlo dans trois semaines. La terre battue, c'est là où je veux vraiment faire parler de moi cette saison. Je rentre à Rennes quelques jours. Ensuite direction Monte-Carlo pour une préparation spécifique. Je veux arriver à 100%.",
          },
        ],
      },
      {
        type: "MONETISATION",
        blocks: [
          {
            kind: "kit",
            id: randomUUID(),
            title: "Mon équipement de la semaine",
            body:
              "La tenue Psycho Bunny que j'ai portée toute la semaine à Indian Wells.",
            media: kitImageUrl
              ? { kind: "image", url: kitImageUrl }
              : undefined,
            cta: {
              label: "Découvrir la tenue",
              url: "https://psychobunny.com/collections/mens-tennis",
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
            prompt:
              "Monte-Carlo approche, jusqu'où me voyez-vous aller ? Faites votre pronostic pour tenter de gagner ma raquette Tecnifibre TF-40 dédicacée.",
            options: [
              { label: "1er ou 2e tour", isHighlighted: false },
              { label: "Quart de finale", isHighlighted: false },
              { label: "Demi-finale", isHighlighted: false },
              { label: "Finale ou vainqueur", emoji: "🏆", isHighlighted: true },
            ],
          },
          {
            kind: "prize_draw",
            id: randomUUID(),
            title: "Raquette Tecnifibre TF-40 dédicacée",
            body:
              "Tirage au sort parmi tous les participants au pronostic. Résultat annoncé le 6 avril.",
            ctaLabel: "Voter et tenter de gagner",
            closesAt: "6 Avril 2026",
          },
          {
            kind: "survey",
            id: randomUUID(),
            title: "Donne ton avis sur ma newsletter",
            body:
              "Deux minutes pour me dire ce qui te plaît et ce que tu veux voir plus souvent.",
            externalUrl: "https://arthurrinderknech.com/feedback",
          },
        ],
      },
    ],
  },

  // ── #02 — Miami (TOURNAMENT) ───────────────────────────────────────
  {
    athleteSlug: "arthur-rinderknech",
    editionNumber: 2,
    editionDate: new Date("2026-03-22"),
    editionMode: "TOURNAMENT",
    title: "Ma semaine à Miami",
    slug: "miami-2026",
    tournamentName: "Miami Open",
    tournamentCategory: "ATP Masters 1000",
    tournamentLocation: "Miami Gardens, USA",
    tournamentSurface: "Dur",
    tournamentStartDate: new Date("2026-03-18"),
    tournamentEndDate: new Date("2026-03-29"),
    worldRankSnapshot: 27,
    countryRankSnapshot: 1,
    hero: {
      filename: "arthur-miami-hero.png",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69ce5838b391da177370f246.png",
    },
    tournamentLogo: {
      filename: "arthur-miami-logo.png",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69ce583d4eaaa6b90fdc6234.png",
    },
    kitImage: {
      filename: "arthur-miami-recovery.jpg",
      sourceUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69ce5867956b428284c0ab9d.jpg",
    },
    reviewVoicenote: {
      filename: "arthur-miami-bleus-analysis-voicenote.wav",
      sourceUrl: "/brand/voicenotes/sample-silence.wav",
    },
    comingUpVoicenote: null,
    buildSections: ({ kitImageUrl, tournamentLogoUrl, reviewVoicenoteUrl }) => [
      {
        type: "ATHLETE_REVIEW",
        blocks: [
          {
            kind: "video",
            url: "https://www.youtube.com/shorts/QMtJ-tS-C8w",
          },
          {
            kind: "text",
            body:
              "Salut ! Miami, c'est fini pour moi. Éliminé par Térence Atmane au 2e tour dans un duel 100% français. Lui a très bien joué. Moi, j'ai pris un coup de fatigue après Indian Wells. Le premier set était serré, j'avais ma chance. Le deuxième m'a échappé. Je rentre, je récupère. Monte-Carlo arrive vite — et c'est là où je veux vraiment faire la différence.",
          },
          {
            kind: "text",
            body:
              "Après le match vs Atmane — « Il a été meilleur que moi aujourd'hui. Il m'a pas laissé grand-chose. Maintenant j'ai hâte d'être à Monte-Carlo, sur ma surface, pour repartir de l'avant. »",
          },
          ...(reviewVoicenoteUrl
            ? [
                {
                  kind: "audio",
                  url: reviewVoicenoteUrl,
                  title: "Mon analyse · Les Bleus à Miami",
                  location: "Miami · 22 Mars",
                  durationLabel: "1 min",
                },
              ]
            : []),
          {
            kind: "text",
            body:
              "Pendant que moi je rentrais tôt, les gars ont fait quelque chose d'historique. Quatre Français en 8e de finale d'un Masters 1000 — Fils, Atmane, Humbert, Halys. Ça ne s'était pas vu depuis 2017. Arthur Fils a été le meilleur de tous : il a sorti des gros joueurs, joué un tennis offensif et tranchant. La demi contre Lehecka, c'est une défaite qui ne remet rien en question — Lehecka était chaud, mais Fils aurait pu passer. Atmane continue sur sa lancée de Cincinnati. Il m'a battu et il a ensuite battu Auger-Aliassime. Ça me fait plaisir et un peu mal en même temps — c'est ça le sport. Le tennis français est en train de faire quelque chose.",
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
            category: "ATP Masters 1000",
            location: "Miami Gardens, USA",
            surface: "Dur",
            dateRange: "18–29 Mars 2026",
          },
          { kind: "hero_metric", value: "2e tour", label: "En simple" },
          { kind: "hero_metric", value: "—", label: "En double" },
          { kind: "hero_metric", value: "0-1", label: "V / D" },
          {
            kind: "match_card",
            format: "singles",
            result: "EXEMPT",
            roundName: "1er Tour",
            date: "19 Mars",
            contextNote: "Tête de série #26",
          },
          {
            kind: "match_card",
            format: "singles",
            result: "L",
            roundName: "2e Tour",
            opponentName: "T. Atmane",
            opponentRank: "#53",
            opponentCountry: "FRA",
            score: "6(4)-7 3-6",
            date: "21 Mars",
            contextNote: "Duel 100% français",
            commentary:
              "Difficile à vivre, ce match. J'avais les jambes après la semaine d'Indian Wells, et Térence a très bien joué. Il n'a rien laissé passer. Le premier set était serré — j'aurais pu le prendre. Dans le deuxième, j'ai perdu en précision au service au mauvais moment. Pas d'excuses : il a été meilleur que moi ce jour-là. Je récupère et je relève la tête pour Monte-Carlo.",
            highlightUrl:
              "https://www.atptour.com/en/scores/stats-centre/archive/2026/403/ms057?tab=Stats",
          },
          {
            kind: "media_link",
            source: "Eurosport",
            headline: "Atmane domine Rinderknech dans le duel 100% français",
            url: "https://www.eurosport.fr/tennis/atp-miami/2026/terence-atmane-arthur-rinderknech_mtc20017139/live.shtml",
          },
          {
            kind: "media_link",
            source: "Tennis TV",
            headline: "Replay : Atmane vs Rinderknech — Miami 2026 R2",
            url: "https://www.tennistv.com/videos/4473962/miami-2026-r2-atmane-rinderknech",
          },
          {
            kind: "media_link",
            source: "ATP Tour",
            headline: "Tous les résultats Miami Open 2026",
            url: "https://www.atptour.com/en/scores/archive/miami/403/2026/results",
          },
        ],
      },
      {
        type: "COMING_UP",
        blocks: [
          {
            kind: "video",
            url: "https://www.youtube.com/shorts/QMtJ-tS-C8w",
          },
          {
            kind: "text",
            body:
              "Rolex Monte-Carlo Masters · 6–13 Avril 2026 · Tête de série #26 · 🟤 Terre battue",
          },
          {
            kind: "text",
            body:
              "Deux semaines à Indian Wells et Miami, c'est physiquement éprouvant. Je rentre à Rennes me reposer. La terre battue arrive vite — je veux y arriver frais et affûté.",
          },
          {
            kind: "schedule_item",
            dateRange: "22–23 Mars",
            title: "Retour à Rennes",
            description:
              "Vol Miami → Paris → Rennes. Famille, repos total, pas de raquette.",
          },
          {
            kind: "schedule_item",
            dateRange: "24–25 Mars",
            title: "Récupération active",
            description:
              "Bains froids, kiné, sommeil long. Nutrition soignée pour reconstituer les stocks.",
          },
          {
            kind: "schedule_item",
            dateRange: "26–28 Mars",
            title: "Reprise légère",
            description:
              "Premiers échanges sur dur à Rennes. Cardio léger. Pas de compétition dans la tête.",
          },
          {
            kind: "schedule_item",
            dateRange: "29–31 Mars",
            title: "Transition terre battue",
            description:
              "Premiers échanges sur terre. Réajustement des appuis, du timing. Travail spécifique service-retour.",
          },
          {
            kind: "schedule_item",
            dateRange: "1–5 Avril",
            title: "Direction Monte-Carlo",
            description:
              "Installation sur site. Pratique intensive au Monte-Carlo Country Club. Objectif : arriver à 100%.",
          },
        ],
      },
      {
        type: "MONETISATION",
        blocks: [
          {
            kind: "kit",
            id: randomUUID(),
            title: "Mes inconditionnels pour bien récupérer",
            body:
              "Après deux semaines intenses, la récupération c'est aussi du travail. Bains froids, sommeil, nutrition — et ma Tecnifibre TF-40 posée dans le coin pour ne pas y penser. On repart bientôt.",
            media: kitImageUrl
              ? { kind: "image", url: kitImageUrl }
              : undefined,
            cta: {
              label: "Découvre mon programme de récup",
              url: "https://www.tecnifibre.com",
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
            question:
              "Quelle partie de mon jeu pensez-vous que je devrais travailler avant Monte-Carlo ? Votez pour m'aider à prioriser ma préparation.",
            options: [
              { label: "Coup droit", isHighlighted: false },
              { label: "Revers", isHighlighted: false },
              { label: "Volée", isHighlighted: false },
              { label: "Service", isHighlighted: false },
            ],
          },
          {
            kind: "qa",
            id: randomUUID(),
            prompt: "Pose moi une question",
            reassurance:
              "Je sélectionnerai 3 questions fans et y répondrai dans la prochaine newsletter.",
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
  const reviewVoicenoteUrl = n.reviewVoicenote
    ? await ensureSeedAsset(
        n.reviewVoicenote.filename,
        n.reviewVoicenote.sourceUrl,
      )
    : null;
  const comingUpVoicenoteUrl = n.comingUpVoicenote
    ? await ensureSeedAsset(
        n.comingUpVoicenote.filename,
        n.comingUpVoicenote.sourceUrl,
      )
    : null;

  const sections = n.buildSections({
    kitImageUrl,
    tournamentLogoUrl,
    reviewVoicenoteUrl,
    comingUpVoicenoteUrl,
  });

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

async function cleanupRemovedAthletes(keepSlugs: string[]): Promise<void> {
  const removed = await prisma.athlete.deleteMany({
    where: { slug: { notIn: keepSlugs } },
  });
  if (removed.count > 0) {
    console.log(`✗ removed ${removed.count} athlete(s) not in seed`);
  }
}

async function main() {
  await cleanupRemovedAthletes(athletes.map((a) => a.slug));

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
