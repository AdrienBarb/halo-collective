import type { Metadata } from "next";
import { genPageMetadata } from "@/lib/seo/genPageMetadata";

export const metadata: Metadata = genPageMetadata({
  title: "Available soon",
  description: "This page is on its way.",
  url: "/available-soon",
});

export default function AvailableSoonPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[640px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-banner">
        Halo Collective
      </div>

      <h1 className="font-display text-[40px] font-medium uppercase leading-[1.05] tracking-[-0.025em] text-ink sm:text-[56px]">
        Available soon.
      </h1>

      <p className="mt-6 max-w-[480px] font-display text-[17px] italic leading-[1.5] text-ink-2 sm:text-[19px]">
        We&rsquo;re putting the finishing touches on this. Check back shortly.
      </p>

      <div className="mt-10 h-px w-16 bg-line" />

      <div className="mt-6 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-ink-3">
        Stay tuned →
      </div>
    </div>
  );
}
