export type Country = {
  code: string;
  name: string;
};

export const COUNTRIES: Country[] = [
  { code: "ARG", name: "Argentina" },
  { code: "AUS", name: "Australia" },
  { code: "AUT", name: "Austria" },
  { code: "BEL", name: "Belgium" },
  { code: "BRA", name: "Brazil" },
  { code: "BUL", name: "Bulgaria" },
  { code: "CAN", name: "Canada" },
  { code: "CHI", name: "Chile" },
  { code: "CHN", name: "China" },
  { code: "COL", name: "Colombia" },
  { code: "CRO", name: "Croatia" },
  { code: "CZE", name: "Czechia" },
  { code: "DEN", name: "Denmark" },
  { code: "ESP", name: "Spain" },
  { code: "FIN", name: "Finland" },
  { code: "FRA", name: "France" },
  { code: "GBR", name: "United Kingdom" },
  { code: "GER", name: "Germany" },
  { code: "GRE", name: "Greece" },
  { code: "HUN", name: "Hungary" },
  { code: "IND", name: "India" },
  { code: "IRL", name: "Ireland" },
  { code: "ITA", name: "Italy" },
  { code: "JPN", name: "Japan" },
  { code: "KAZ", name: "Kazakhstan" },
  { code: "KOR", name: "South Korea" },
  { code: "MEX", name: "Mexico" },
  { code: "NED", name: "Netherlands" },
  { code: "NOR", name: "Norway" },
  { code: "NZL", name: "New Zealand" },
  { code: "POL", name: "Poland" },
  { code: "POR", name: "Portugal" },
  { code: "ROU", name: "Romania" },
  { code: "RSA", name: "South Africa" },
  { code: "RUS", name: "Russia" },
  { code: "SRB", name: "Serbia" },
  { code: "SUI", name: "Switzerland" },
  { code: "SVK", name: "Slovakia" },
  { code: "SWE", name: "Sweden" },
  { code: "TUN", name: "Tunisia" },
  { code: "TUR", name: "Turkey" },
  { code: "UKR", name: "Ukraine" },
  { code: "USA", name: "United States" },
];

export function findCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
