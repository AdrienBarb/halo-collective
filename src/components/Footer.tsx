import Link from "next/link";
import Wordmark from "@/components/Wordmark";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-cream-2">
      <div className="mx-auto max-w-[1180px] px-8 pb-[30px] pt-[38px] text-center">
        <Wordmark size="large" />
        <div className="mt-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
          © {year} · All Rights Reserved
        </div>
      </div>
      <div className="border-t border-line px-8 py-[22px] text-center font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
        <Link href="/admin" className="transition-colors hover:text-ink">
          Admin →
        </Link>
      </div>
    </footer>
  );
}
