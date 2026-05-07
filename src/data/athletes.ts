export type FlagStripe = readonly string[];

export type Athlete = {
  slug: string;
  name: string;
  rank: string;
  hero: string;
  heroFocus: string; // CSS object-position for the photo
  flag: FlagStripe;
  language: "EN" | "FR";
};

export const athletes: readonly Athlete[] = [
  {
    slug: "iga-swiatek",
    name: "Iga Świątek",
    rank: "WTA #4",
    hero: "/brand/heroes/iga-swiatek.jpg",
    heroFocus: "center 20%",
    flag: ["#ffffff", "#b8001f"], // POL
    language: "EN",
  },
  {
    slug: "alexander-bublik",
    name: "Alexander Bublik",
    rank: "ATP #11",
    hero: "/brand/heroes/alexander-bublik.jpg",
    heroFocus: "center 12%",
    flag: ["#009dbf", "#f5c500"], // KAZ
    language: "EN",
  },
  {
    slug: "flavio-cobolli",
    name: "Flavio Cobolli",
    rank: "ATP #13",
    hero: "/brand/heroes/flavio-cobolli.jpg",
    heroFocus: "center 18%",
    flag: ["#009246", "#ffffff", "#ce2b37"], // ITA
    language: "EN",
  },
];
