import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/services/currentUser";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin · Halo Collective",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();
  if (!admin) notFound();

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar />
      <main className="flex-1">
        <div className="mx-auto max-w-[1100px] px-6 py-10">{children}</div>
      </main>
    </div>
  );
}
