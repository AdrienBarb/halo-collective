"use client";

import * as React from "react";

interface SectionCardProps {
  /** Anchor id used by the sidebar table-of-contents. */
  id: string;
  /** Section ordinal — rendered as a big mono numeral. */
  number: string;
  /** Section name shown next to the numeral, e.g. "My debrief". */
  name: string;
  /** One short sentence explaining what goes inside. */
  description: string;
  children: React.ReactNode;
}

export default function SectionCard({
  id,
  number,
  name,
  description,
  children,
}: SectionCardProps) {
  // The scroll-margin offset keeps anchored sections from landing under
  // the page chrome when an editor clicks a TOC link.
  return (
    <section
      id={id}
      className="scroll-mt-8 rounded-sm border border-line bg-cream-2"
    >
      <header className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 border-b border-line px-6 py-5 md:gap-x-7">
        <div className="font-mono text-[26px] font-semibold leading-none tracking-tight text-accent-gold">
          {number}
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
            {name}
          </div>
          <p className="mt-1 font-serif text-[15px] italic leading-snug text-ink-2">
            {description}
          </p>
        </div>
      </header>
      <div className="space-y-6 px-6 py-6">{children}</div>
    </section>
  );
}
