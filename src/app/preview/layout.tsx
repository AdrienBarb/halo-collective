import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/services/currentUser";

export const metadata = {
  title: "Preview · Halo Collective",
  robots: { index: false, follow: false },
};

export default async function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();
  if (!admin) notFound();
  return children;
}
