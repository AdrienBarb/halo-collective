import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getAthleteBySlug } from "@/lib/services/athlete";
import { listPublishedByAthleteId } from "@/lib/services/newsletter";
import { isSubscribedToAthlete } from "@/lib/services/subscription";
import { auth } from "@/lib/better-auth/auth";
import AthleteProfile from "@/components/athlete/AthleteProfile";

export default async function AthleteHomePage({
  params,
  searchParams,
}: PageProps<"/[athleteSlug]">) {
  const { athleteSlug } = await params;
  const sp = await searchParams;
  const editionParam = typeof sp.edition === "string" ? sp.edition : null;

  // Kick off independent fetches in parallel: athlete lookup + session.
  const [athlete, session] = await Promise.all([
    getAthleteBySlug(athleteSlug),
    auth.api.getSession({ headers: await headers() }),
  ]);
  if (!athlete) notFound();

  const isSignedIn = Boolean(session?.user);

  const [editions, isSubscribed] = await Promise.all([
    listPublishedByAthleteId(athlete.id),
    isSignedIn
      ? isSubscribedToAthlete(session!.user.id, athlete.id)
      : Promise.resolve(false),
  ]);

  return (
    <AthleteProfile
      athlete={athlete}
      editions={editions}
      selectedSlug={editionParam}
      isSignedIn={isSignedIn}
      isSubscribed={isSubscribed}
    />
  );
}
