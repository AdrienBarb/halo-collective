import { redirect } from "next/navigation";

type EditionRoute = "/[athleteSlug]/[editionSlug]";

export default async function EditionPage({
  params,
}: PageProps<EditionRoute>) {
  const { athleteSlug, editionSlug } = await params;
  redirect(`/${athleteSlug}?edition=${encodeURIComponent(editionSlug)}`);
}
