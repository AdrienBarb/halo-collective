export type Country = {
  code: string;
  name: string;
  dialCode: string;
};

export const COUNTRIES: Country[] = [
  { code: "ARG", name: "Argentina", dialCode: "+54" },
  { code: "AUS", name: "Australia", dialCode: "+61" },
  { code: "AUT", name: "Austria", dialCode: "+43" },
  { code: "BEL", name: "Belgium", dialCode: "+32" },
  { code: "BRA", name: "Brazil", dialCode: "+55" },
  { code: "BUL", name: "Bulgaria", dialCode: "+359" },
  { code: "CAN", name: "Canada", dialCode: "+1" },
  { code: "CHI", name: "Chile", dialCode: "+56" },
  { code: "CHN", name: "China", dialCode: "+86" },
  { code: "COL", name: "Colombia", dialCode: "+57" },
  { code: "CRO", name: "Croatia", dialCode: "+385" },
  { code: "CZE", name: "Czechia", dialCode: "+420" },
  { code: "DEN", name: "Denmark", dialCode: "+45" },
  { code: "ESP", name: "Spain", dialCode: "+34" },
  { code: "FIN", name: "Finland", dialCode: "+358" },
  { code: "FRA", name: "France", dialCode: "+33" },
  { code: "GBR", name: "United Kingdom", dialCode: "+44" },
  { code: "GER", name: "Germany", dialCode: "+49" },
  { code: "GRE", name: "Greece", dialCode: "+30" },
  { code: "HUN", name: "Hungary", dialCode: "+36" },
  { code: "IND", name: "India", dialCode: "+91" },
  { code: "IRL", name: "Ireland", dialCode: "+353" },
  { code: "ITA", name: "Italy", dialCode: "+39" },
  { code: "JPN", name: "Japan", dialCode: "+81" },
  { code: "KAZ", name: "Kazakhstan", dialCode: "+7" },
  { code: "KOR", name: "South Korea", dialCode: "+82" },
  { code: "MEX", name: "Mexico", dialCode: "+52" },
  { code: "NED", name: "Netherlands", dialCode: "+31" },
  { code: "NOR", name: "Norway", dialCode: "+47" },
  { code: "NZL", name: "New Zealand", dialCode: "+64" },
  { code: "POL", name: "Poland", dialCode: "+48" },
  { code: "POR", name: "Portugal", dialCode: "+351" },
  { code: "ROU", name: "Romania", dialCode: "+40" },
  { code: "RSA", name: "South Africa", dialCode: "+27" },
  { code: "RUS", name: "Russia", dialCode: "+7" },
  { code: "SRB", name: "Serbia", dialCode: "+381" },
  { code: "SUI", name: "Switzerland", dialCode: "+41" },
  { code: "SVK", name: "Slovakia", dialCode: "+421" },
  { code: "SWE", name: "Sweden", dialCode: "+46" },
  { code: "TUN", name: "Tunisia", dialCode: "+216" },
  { code: "TUR", name: "Turkey", dialCode: "+90" },
  { code: "UKR", name: "Ukraine", dialCode: "+380" },
  { code: "USA", name: "United States", dialCode: "+1" },
];

export function findCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function isValidDialCode(dialCode: string): boolean {
  return COUNTRIES.some((c) => c.dialCode === dialCode);
}
