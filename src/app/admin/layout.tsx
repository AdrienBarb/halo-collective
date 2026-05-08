import Link from "next/link";

export const metadata = {
  title: "Admin · Halo Collective",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-line bg-cream-2">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
          <Link
            href="/admin"
            className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink"
          >
            Halo · Admin
          </Link>
          <nav className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-2">
            <Link href="/admin/athletes" className="hover:text-ink">
              Athletes
            </Link>
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink"
            >
              View site ↗
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-6 py-10">{children}</main>
    </div>
  );
}
