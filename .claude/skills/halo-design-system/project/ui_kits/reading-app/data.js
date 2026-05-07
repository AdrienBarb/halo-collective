window.HALO_DATA = {
  roster: [
    {
      slug: "flavio-cobolli",
      name: "Flavio Cobolli",
      flag: "🇮🇹",
      country: "Italy",
      countryCode: "ITA",
      sport: "Tennis",
      tour: "ATP",
      rank: 16,
      countryRank: 3,
      titles: 0,
      hero: "../../assets/heroes/flavio-cobolli.jpg",
      portrait: "../../assets/portraits/flavio-cobolli.jpg",
      heroPos: "center 15%",
      flagStripe: ["#009246", "#ffffff", "#ce2b37"],
      language: "en",
      latestIssue: "03",
      latestDate: "22 APR 2026",
      latestTitle: "Monte‑Carlo, raw"
    },
    {
      slug: "iga-swiatek",
      name: "Iga Świątek",
      flag: "🇵🇱",
      country: "Poland",
      countryCode: "POL",
      sport: "Tennis",
      tour: "WTA",
      rank: 4,
      countryRank: 1,
      titles: 22,
      hero: "../../assets/heroes/iga-swiatek.jpg",
      portrait: "",
      heroPos: "center 25%",
      flagStripe: ["#ffffff", "#b8001f"],
      language: "en",
      latestIssue: "12",
      latestDate: "06 MAY 2026",
      latestTitle: "Madrid, the long week"
    },
    {
      slug: "arthur-rinderknech",
      name: "Arthur Rinderknech",
      flag: "🇫🇷",
      country: "France",
      countryCode: "FRA",
      sport: "Tennis",
      tour: "ATP",
      rank: 26,
      countryRank: 2,
      titles: 0,
      hero: "../../assets/heroes/arthur-rinderknech.jpg",
      portrait: "",
      heroPos: "center 20%",
      flagStripe: ["#002395", "#ffffff", "#ed2939"],
      language: "fr",
      latestIssue: "07",
      latestDate: "29 AVR 2026",
      latestTitle: "Madrid, semaine compliquée"
    },
    {
      slug: "alexander-bublik",
      name: "Alexander Bublik",
      flag: "🇰🇿",
      country: "Kazakhstan",
      countryCode: "KAZ",
      sport: "Tennis",
      tour: "ATP",
      rank: 11,
      countryRank: 1,
      titles: 4,
      hero: "../../assets/heroes/alexander-bublik.jpg",
      portrait: "",
      heroPos: "center 10%",
      flagStripe: ["#009dbf", "#f5c500"],
      language: "en",
      latestIssue: "05",
      latestDate: "18 APR 2026",
      latestTitle: "On showmanship and serves"
    },
    {
      slug: "elise-mertens",
      name: "Elise Mertens",
      flag: "🇧🇪",
      country: "Belgium",
      countryCode: "BEL",
      sport: "Tennis",
      tour: "WTA",
      rank: 24,
      countryRank: 1,
      titles: 8,
      hero: "../../assets/heroes/elise-mertens.jpg",
      portrait: "../../assets/portraits/elise-mertens.png",
      heroPos: "center 20%",
      flagStripe: ["#1a1a1a", "#ffd100", "#ef3340"],
      language: "en",
      latestIssue: "09",
      latestDate: "02 MAY 2026",
      latestTitle: "Doubles draw, fresh legs"
    }
  ],

  // Per-athlete issue archives (mock)
  issues: {
    "flavio-cobolli": [
      { num: "03", date: "22 APR 2026", title: "Monte‑Carlo, raw", tag: "Monte‑Carlo Masters" },
      { num: "02", date: "08 APR 2026", title: "Indian sun, Miami nerves", tag: "Sunshine Double" },
      { num: "01", date: "21 MAR 2026", title: "Welcome — and why I'm doing this", tag: "Hello" }
    ],
    "iga-swiatek": [
      { num: "12", date: "06 MAY 2026", title: "Madrid, the long week", tag: "Mutua Madrid" },
      { num: "11", date: "23 APR 2026", title: "Stuttgart on indoor clay", tag: "Stuttgart" },
      { num: "10", date: "10 APR 2026", title: "Off‑week reset in Mallorca", tag: "Off‑week" }
    ]
  },

  // Story for Cobolli #03 — the canonical example
  story: {
    athleteSlug: "flavio-cobolli",
    issueNum: "03",
    date: "22 APR 2026",
    location: "MONTE‑CARLO",
    title: "My Monte‑Carlo week, raw",
    subtitle: "First Masters QF on European clay — the way it actually felt.",
    voiceNote: { duration: "1:30", title: "Coming next: Munich preview", date: "22 APR" },
    debrief: [
      "Tough first round at home — the crowd was there, my game wasn't, yet. We figured it out by Wednesday.",
      "Quarters against Sinner felt close in the body. Score didn't show it, but the second set tiebreak is the one I'll re‑watch.",
      "Onwards to Munich. Different surface, same plan: trust the legs, swing free."
    ],
    quote: { source: "L'ÉQUIPE · 24 APR", text: "Cobolli n'a pas tremblé sur la terre du Country Club — un set qui dit beaucoup de la suite." },
    matches: [
      { result: "W", round: "R64", date: "20 APR", oppName: "Roman Safiullin", oppRank: "#42", oppFlag: "🇷🇺", score: "6‑3, 7‑6", notes: "Solid start. Kept first‑serve % above 70 the whole match." },
      { result: "W", round: "R32", date: "21 APR", oppName: "Sebastian Korda", oppRank: "#23", oppFlag: "🇺🇸", score: "7‑5, 6‑4", notes: "Clutch returns at 5‑5 in the first. Felt the legs after." },
      { result: "W", round: "R16", date: "22 APR", oppName: "Karen Khachanov", oppRank: "#19", oppFlag: "🇷🇺", score: "6‑4, 3‑6, 6‑3", notes: "Three‑setter. Crowd carried me in the third." },
      { result: "L", round: "QF", date: "24 APR", oppName: "Jannik Sinner", oppRank: "#1", oppFlag: "🇮🇹", score: "3‑6, 4‑6", notes: "Closer than the score. Returned big on second serves but couldn't break in the set‑two tiebreak. Onwards to Munich." }
    ],
    poll: {
      question: "Where should I peak next?",
      options: [
        { emoji: "🟠", label: "Madrid — back on clay" },
        { emoji: "🟢", label: "Rome — home crowd" },
        { emoji: "🔴", label: "Roland‑Garros — final boss" }
      ]
    },
    kit: {
      title: "What's in my bag right now",
      items: [
        { name: "Tecnifibre TF40 305", role: "Frame · 16x19", img: "../../assets/sponsors/tecnifibre.webp" },
        { name: "Psycho Bunny match polo", role: "On court", img: "../../assets/sponsors/psycho-bunny.png" }
      ]
    },
    sponsors: [
      { name: "Psycho Bunny", img: "../../assets/sponsors/psycho-bunny.png" },
      { name: "Tecnifibre", img: "../../assets/sponsors/tecnifibre.webp" },
      { name: "Extia", img: "../../assets/sponsors/extia.png" },
      { name: "Fosvia", img: "../../assets/sponsors/fosvia.jpg" }
    ]
  }
};
