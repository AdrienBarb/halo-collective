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
  /** Optional per-edition custom title (overrides the static default). */
  title?: string;
  /** Placeholder shown when no custom title is set — typically the default label. */
  titlePlaceholder?: string;
  /** When provided, renders an editable title input above the children. */
  onTitleChange?: (value: string) => void;
  children: React.ReactNode;
}

export default function SectionCard({
  id,
  number,
  name,
  description,
  title,
  titlePlaceholder,
  onTitleChange,
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
          <p className="mt-1 text-[15px] leading-snug text-ink-2">
            {description}
          </p>
        </div>
      </header>
      {onTitleChange ? (
        <div className="border-b border-line px-6 py-5">
          <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
            Custom title
          </label>
          {/*
            Intentionally unstyled — this input is meant to read like
            the section's <h2>, not a form field. Borderless + serif
            mirrors how the rendered newsletter title looks, so editors
            see roughly what they'll ship.
          */}
          <input
            type="text"
            value={title ?? ""}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={(e) => {
              const trimmed = e.target.value.trim();
              if (trimmed !== e.target.value) onTitleChange(trimmed);
            }}
            placeholder={titlePlaceholder}
            maxLength={120}
            className="mt-2 w-full border-0 bg-transparent p-0 font-serif text-[20px] leading-[1.2] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-0"
          />
        </div>
      ) : null}
      <div className="space-y-6 px-6 py-6">{children}</div>
    </section>
  );
}
