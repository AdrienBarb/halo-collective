"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isLandingHidden } from "@/lib/utils/isLandingHidden";

const NAV_ITEMS = [
  { href: "/admin/athletes", label: "Athletes" },
  { href: "/admin/newsletters", label: "Newsletters" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-line bg-cream-2">
      <div className="border-b border-line px-6 py-5">
        <Link
          href="/admin"
          className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink"
        >
          Halo · Admin
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-sm px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors",
                    isActive
                      ? "bg-cream-3 text-ink"
                      : "text-ink-2 hover:bg-cream-3 hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {isLandingHidden() ? null : (
        <div className="border-t border-line px-6 py-4">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3 transition-colors hover:text-ink"
          >
            View site ↗
          </Link>
        </div>
      )}
    </aside>
  );
}
