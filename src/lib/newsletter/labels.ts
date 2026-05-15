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
    watchOnYoutube: string;
    feedback: string;
    enterDraw: string;
    learnMore: string;
  };
  monetisationEyebrows: {
    kit: string;
    partner_content: string;
    affiliate: string;
    paid_content: string;
    athlete_product: string;
    donation: string;
    fan_experience: string;
  };
  engagementEyebrows: {
    poll: string;
    prediction: string;
    quiz: string;
    prize_draw: string;
    qa: string;
    survey: string;
    challenge: string;
  };
  eyebrows: {
    press: string;
    partners: string;
    exclusiveMember: string;
  };
  mediaRecap: {
    header: string;
    /** Use `{count}` placeholder */
    articleSingularTemplate: string;
    /** Use `{count}` placeholder */
    articlePluralTemplate: string;
  };
  engagementInteractive: {
    signInToParticipate: string;
    subscribeToParticipate: string;
    submit: string;
    submitting: string;
    yourAnswerRecorded: string;
    changeMyAnswer: string;
    closed: string;
    correctAnswer: string;
    incorrectAnswer: string;
    enterDraw: string;
    drawConsent: string;
    inDraw: string;
    drawClosed: string;
    iDidIt: string;
    youDidIt: string;
    /** Use `{count}` placeholder */
    reactionCountTemplate: string;
    /** Use `{count}` placeholder */
    votesCountTemplate: string;
    yourQuestionPlaceholder: string;
    yourAnswerPlaceholder: string;
  };
  reassuranceText: string;
  questionIntro: string;
  /** Use `{tournament}` as a placeholder. */
  tournamentLabelTemplate: string;
  /** Single letter badges in match result rings (W/L) — localized. */
  matchResultLetters: {
    win: string;
    loss: string;
  };
}

const EN: NewsletterLabels = {
  sections: {
    ATHLETE_REVIEW: {
      number: "01",
      eyebrow: "My week",
      titleTemplate: "My week",
    },
    WEEK_RECAP: {
      number: "02",
      eyebrow: "Week recap",
      titleTemplate: "What happened this week",
    },
    COMING_UP: {
      number: "03",
      eyebrow: "Coming up",
      titleTemplate: "What's coming next",
    },
    MONETISATION: {
      number: "04",
      eyebrow: "Picks",
      titleTemplate: "What I'm into right now",
    },
    FAN_ENGAGEMENT: {
      number: "05",
      eyebrow: "Your turn",
      titleTemplate: "Your turn",
    },
  },
  ctas: {
    vote: "Vote →",
    askMe: "Ask me a question →",
    read: "Read",
    highlights: "Highlights",
    watchOnYoutube: "Watch on YouTube",
    feedback: "Share your feedback on this newsletter →",
    enterDraw: "Enter the draw →",
    learnMore: "Learn more →",
  },
  monetisationEyebrows: {
    kit: "My kit",
    partner_content: "Partner",
    affiliate: "Recommended",
    paid_content: "Members-only",
    athlete_product: "From me",
    donation: "Support",
    fan_experience: "Experience",
  },
  engagementEyebrows: {
    poll: "Poll",
    prediction: "Prediction",
    quiz: "Quiz",
    prize_draw: "Prize draw",
    qa: "Ask me anything",
    survey: "Quick survey",
    challenge: "Challenge",
  },
  eyebrows: {
    press: "What they wrote about me",
    partners: "My partners",
    exclusiveMember: "Exclusive member",
  },
  mediaRecap: {
    header: "What they wrote",
    articleSingularTemplate: "{count} article",
    articlePluralTemplate: "{count} articles",
  },
  engagementInteractive: {
    signInToParticipate: "Sign in to participate",
    subscribeToParticipate: "Subscribe to participate",
    submit: "Submit",
    submitting: "Submitting…",
    yourAnswerRecorded: "Your answer is in. Thanks!",
    changeMyAnswer: "Change my answer",
    closed: "Closed",
    correctAnswer: "Correct answer!",
    incorrectAnswer: "Not quite — the correct answer is highlighted",
    enterDraw: "Enter the draw",
    drawConsent: "I agree to the prize draw terms",
    inDraw: "You're in the draw ✓",
    drawClosed: "Draw closed",
    iDidIt: "I did it ✊",
    youDidIt: "You did it ✊",
    reactionCountTemplate: "{count} fans did it",
    votesCountTemplate: "{count} votes",
    yourQuestionPlaceholder: "Type your question…",
    yourAnswerPlaceholder: "Type your answer…",
  },
  reassuranceText:
    "I'll pick 3 fan questions and answer them in the next newsletter.",
  questionIntro:
    "Vote to help me prioritise — I'll respond in the next edition.",
  tournamentLabelTemplate: "My week at {tournament}",
  matchResultLetters: { win: "W", loss: "L" },
};

const FR: NewsletterLabels = {
  sections: {
    ATHLETE_REVIEW: {
      number: "01",
      eyebrow: "Ma semaine",
      titleTemplate: "Ma semaine",
    },
    WEEK_RECAP: {
      number: "02",
      eyebrow: "Récap de la semaine",
      titleTemplate: "Ce qui s'est passé cette semaine",
    },
    COMING_UP: {
      number: "03",
      eyebrow: "La suite",
      titleTemplate: "Ce qui m'attend",
    },
    MONETISATION: {
      number: "04",
      eyebrow: "Mes coups de cœur",
      titleTemplate: "Ce que j'utilise en ce moment",
    },
    FAN_ENGAGEMENT: {
      number: "05",
      eyebrow: "À toi de jouer",
      titleTemplate: "À toi de jouer",
    },
  },
  ctas: {
    vote: "Voter →",
    askMe: "Pose-moi une question →",
    read: "Lire",
    highlights: "Résumé",
    watchOnYoutube: "Voir sur YouTube",
    feedback: "Partage ton avis sur cette newsletter →",
    enterDraw: "Participer au tirage →",
    learnMore: "En savoir plus →",
  },
  monetisationEyebrows: {
    kit: "Mon kit",
    partner_content: "Partenaire",
    affiliate: "Mes recos",
    paid_content: "Membres",
    athlete_product: "De ma part",
    donation: "Soutenir",
    fan_experience: "Expérience",
  },
  engagementEyebrows: {
    poll: "Sondage",
    prediction: "Pronostic",
    quiz: "Quiz",
    prize_draw: "Tirage au sort",
    qa: "La parole est à toi",
    survey: "Mini-sondage",
    challenge: "Défi",
  },
  eyebrows: {
    press: "Ce qu'on a écrit sur moi",
    partners: "Mes partenaires",
    exclusiveMember: "Membre exclusif",
  },
  mediaRecap: {
    header: "Ce qu'on a écrit sur moi",
    articleSingularTemplate: "{count} article",
    articlePluralTemplate: "{count} articles",
  },
  engagementInteractive: {
    signInToParticipate: "Connecte-toi pour participer",
    subscribeToParticipate: "Abonne-toi pour participer",
    submit: "Envoyer",
    submitting: "Envoi…",
    yourAnswerRecorded: "Ta réponse est enregistrée. Merci !",
    changeMyAnswer: "Modifier ma réponse",
    closed: "Terminé",
    correctAnswer: "Bonne réponse !",
    incorrectAnswer: "Pas tout à fait — la bonne réponse est surlignée",
    enterDraw: "Participer au tirage",
    drawConsent: "J'accepte les conditions du tirage",
    inDraw: "Tu participes au tirage ✓",
    drawClosed: "Tirage terminé",
    iDidIt: "Je l'ai fait ✊",
    youDidIt: "Tu l'as fait ✊",
    reactionCountTemplate: "{count} fans l'ont fait",
    votesCountTemplate: "{count} votes",
    yourQuestionPlaceholder: "Écris ta question…",
    yourAnswerPlaceholder: "Écris ta réponse…",
  },
  reassuranceText:
    "Je sélectionne 3 questions de fans et j'y réponds dans la prochaine newsletter.",
  questionIntro:
    "Vote pour m'aider à prioriser — je réponds dans la prochaine édition.",
  tournamentLabelTemplate: "Ma semaine à {tournament}",
  matchResultLetters: { win: "V", loss: "D" },
};

const REGISTRY: Record<NewsletterLocale, NewsletterLabels> = { en: EN, fr: FR };

export function getNewsletterLabels(
  locale: NewsletterLocale = "en"
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
  tournamentName: string | null | undefined
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
  locale: NewsletterLocale = "en"
): string | null {
  const labels = getNewsletterLabels(locale);
  return applyTournamentTemplate(
    labels.sections[type].titleTemplate,
    tournamentName
  );
}

/** Derive the athlete-voice "My week in X" line shown in the identity block. */
export function getTournamentLabel(
  tournamentName: string | null | undefined,
  locale: NewsletterLocale = "en"
): string | null {
  const labels = getNewsletterLabels(locale);
  return applyTournamentTemplate(
    labels.tournamentLabelTemplate,
    tournamentName
  );
}
