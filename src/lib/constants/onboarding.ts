export interface OnboardingOption {
  readonly value: string;
  readonly label: string;
}

export const SPORTS: readonly OnboardingOption[] = [
  { value: "tennis", label: "Tennis" },
  { value: "football", label: "Football" },
  { value: "running", label: "Running" },
  { value: "cycling", label: "Cycling" },
  { value: "basketball", label: "Basketball" },
  { value: "golf", label: "Golf" },
  { value: "swimming", label: "Swimming" },
  { value: "formula_1", label: "Formula 1" },
  { value: "rugby", label: "Rugby" },
  { value: "skiing", label: "Skiing" },
  { value: "padel", label: "Padel" },
  { value: "fitness", label: "Fitness" },
] as const;

export const LIFESTYLE: readonly OnboardingOption[] = [
  { value: "nutrition", label: "Nutrition" },
  { value: "travel", label: "Travel" },
  { value: "fashion", label: "Fashion" },
  { value: "tech", label: "Tech" },
  { value: "music", label: "Music" },
  { value: "fitness_wellness", label: "Fitness & wellness" },
  { value: "business", label: "Business" },
  { value: "sustainability", label: "Sustainability" },
  { value: "gaming", label: "Gaming" },
  { value: "art", label: "Art" },
  { value: "photography", label: "Photography" },
  { value: "food", label: "Food" },
] as const;

// Arthur's sponsors pinned to the top of the list — used as the highest-priority
// signal when the daily cron merges declared preferences with social follows
// (see CLAUDE.md "How declared brands feed the sponsor flags"). Order within
// the sponsor block matches the deck.
export const BRANDS: readonly OnboardingOption[] = [
  { value: "tecnifibre", label: "Tecnifibre" },
  { value: "psycho_bunny", label: "Psycho Bunny" },
  { value: "extia", label: "Extia" },
  { value: "fovis", label: "Fovis" },
  { value: "wilson", label: "Wilson" },
  { value: "lacoste", label: "Lacoste" },
  { value: "herbalife", label: "Herbalife" },
  { value: "babolat", label: "Babolat" },
  { value: "head", label: "Head" },
  { value: "nike", label: "Nike" },
  { value: "adidas", label: "Adidas" },
  { value: "on_running", label: "On Running" },
  { value: "new_balance", label: "New Balance" },
  { value: "myprotein", label: "Myprotein" },
  { value: "sis", label: "SIS" },
  { value: "nutripure", label: "Nutripure" },
  { value: "marriott", label: "Marriott" },
  { value: "accor", label: "Accor" },
  { value: "emirates", label: "Emirates" },
  { value: "air_france", label: "Air France" },
  { value: "rolex", label: "Rolex" },
  { value: "red_bull", label: "Red Bull" },
  { value: "ralph_lauren", label: "Ralph Lauren" },
  { value: "hugo_boss", label: "Hugo Boss" },
  { value: "bnp_paribas", label: "BNP Paribas" },
  { value: "credit_agricole", label: "Crédit Agricole" },
  { value: "apple", label: "Apple" },
  { value: "samsung", label: "Samsung" },
] as const;
