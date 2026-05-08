import type { Metadata } from "next";
import { genPageMetadata } from "@/lib/seo/genPageMetadata";
import { getAthleteBySlug } from "@/lib/services/athlete";

export async function generateMetadata({
  params,
}: PageProps<"/[athleteSlug]">): Promise<Metadata> {
  const { athleteSlug } = await params;
  const athlete = await getAthleteBySlug(athleteSlug);
  if (!athlete) return {};

  const fullName = `${athlete.firstName} ${athlete.lastName}`;
  return genPageMetadata({
    title: fullName,
    description:
      athlete.bio ?? `${fullName} — newsletter and updates on Halo Collective.`,
    url: `/${athleteSlug}`,
  });
}

export default function AthleteLayout({
  children,
}: LayoutProps<"/[athleteSlug]">) {
  return children;
}
