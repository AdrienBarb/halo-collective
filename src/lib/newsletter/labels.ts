import type { SectionTypeValue } from "@/lib/schemas/newsletterSection";

// Single source of truth for every templated string that surrounds
// section content — section eyebrows/numbers/titles, CTA copy, fixed
// editorial chrome. Editors never type any of this; renderers pull from
// here so the same template ships across every athlete and edition.

export type NewsletterLocale = "en" | "fr";

interface SectionLabels {
  number: string;
  eyebrow: string;
  /** Use `{tournament}` as a placeholder. If absent, returned as-is. */
  titleTemplate: string;
}

export interface NewsletterLabels {
  sections: Record<SectionTypeValue, SectionLabels>;
  ctas: {
    vote: string;
    askMe: string;
    read: string;
    highlights: string;
    feedback: string;
  };
  eyebrows: {
    press: string;
    partners: string;
    exclusiveMember: string;
  };
  reassuranceText: string;
  questionIntro: string;
  /** Use `{tournament}` as a placeholder. */
  tournamentLabelTemplate: string;
}

const EN: NewsletterLabels = {
  sections: {
    DEBRIEF: {
      number: "01",
      eyebrow: "My debrief",
      titleTemplate: "My {tournament} debrief",
    },
    RESULTS: {
      number: "02",
      eyebrow: "Tournament recap",
      titleTemplate: "My results in {tournament}",
    },
    WHATS_NEXT: {
      number: "03",
      eyebrow: "Coming up",
      titleTemplate: "What's coming this week",
    },
    KIT: {
      number: "04",
      eyebrow: "My kit",
      titleTemplate: "What I played with in {tournament}",
    },
    ENGAGEMENT: {
      number: "05",
      eyebrow: "Your turn",
      titleTemplate: "The question of the week",
    },
  },
  ctas: {
    vote: "Vote →",
    askMe: "Ask me a question →",
    read: "Read",
    highlights: "Highlights",
    feedback: "Share your feedback on this newsletter →",
  },
  eyebrows: {
    press: "What they wrote about me",
    partners: "My partners",
    exclusiveMember: "Exclusive member",
  },
  reassuranceText:
    "I'll pick 3 fan questions and answer them in the next newsletter.",
  questionIntro: "Vote to help me prioritise — I'll respond in the next edition.",
  tournamentLabelTemplate: "My week in {tournament}",
};

const FR: NewsletterLabels = {
  sections: {
    DEBRIEF: {
      number: "01",
      eyebrow: "Mon débrief",
      titleTemplate: "Mon débrief {tournament}",
    },
    RESULTS: {
      number: "02",
      eyebrow: "Récap tournoi",
      titleTemplate: "Mes résultats à {tournament}",
    },
    WHATS_NEXT: {
      number: "03",
      eyebrow: "La suite",
      titleTemplate: "Ce qui m'attend cette semaine",
    },
    KIT: {
      number: "04",
      eyebrow: "Mon kit",
      titleTemplate: "Ce avec quoi j'ai joué à {tournament}",
    },
    ENGAGEMENT: {
      number: "05",
      eyebrow: "À toi de jouer",
      titleTemplate: "Le pronostic de la semaine",
    },
  },
  ctas: {
    vote: "Voter →",
    askMe: "Pose-moi une question →",
    read: "Lire",
    highlights: "Résumé",
    feedback: "Partage ton avis sur cette newsletter →",
  },
  eyebrows: {
    press: "Ce qu'on a écrit sur moi",
    partners: "Mes partenaires",
    exclusiveMember: "Membre exclusif",
  },
  reassuranceText:
    "Je sélectionne 3 questions de fans et j'y réponds dans la prochaine newsletter.",
  questionIntro:
    "Vote pour m'aider à prioriser — je réponds dans la prochaine édition.",
  tournamentLabelTemplate: "Ma semaine à {tournament}",
};

const REGISTRY: Record<NewsletterLocale, NewsletterLabels> = { en: EN, fr: FR };

export function getNewsletterLabels(
  locale: NewsletterLocale = "en",
): NewsletterLabels {
  return REGISTRY[locale] ?? EN;
}

/**
 * Substitute `{tournament}` in any template string. Returns `null` if the
 * template requires a tournament name but none is available — callers can
 * then conditionally render with a clean truthy check.
 */
export function applyTournamentTemplate(
  template: string,
  tournamentName: string | null | undefined,
): string | null {
  if (!template.includes("{tournament}")) return template;
  const name = tournamentName?.trim();
  if (!name) return null;
  return template.replace("{tournament}", name);
}

/** Derive the per-section title shown in the email/web header. */
export function getSectionTitle(
  type: SectionTypeValue,
  tournamentName: string | null | undefined,
  locale: NewsletterLocale = "en",
): string | null {
  const labels = getNewsletterLabels(locale);
  return applyTournamentTemplate(labels.sections[type].titleTemplate, tournamentName);
}

/** Derive the athlete-voice "My week in X" line shown in the identity block. */
export function getTournamentLabel(
  tournamentName: string | null | undefined,
  locale: NewsletterLocale = "en",
): string | null {
  const labels = getNewsletterLabels(locale);
  return applyTournamentTemplate(labels.tournamentLabelTemplate, tournamentName);
}
