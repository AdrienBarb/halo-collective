import { notFound } from "next/navigation";
import { getAthleteBySlug } from "@/lib/services/athlete";
import { listPublishedByAthleteId } from "@/lib/services/newsletter";
import AthleteProfile from "@/components/athlete/AthleteProfile";

export default async function AthleteHomePage({
  params,
}: PageProps<"/[athleteSlug]">) {
  const { athleteSlug } = await params;
  const athlete = await getAthleteBySlug(athleteSlug);
  if (!athlete) notFound();

  const editions = await listPublishedByAthleteId(athlete.id);

  return <AthleteProfile athlete={athlete} editions={editions} />;
}
