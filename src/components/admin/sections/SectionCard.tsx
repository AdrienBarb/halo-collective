"use client";

import * as React from "react";

// Naming note: the props use the typography-accurate code names
// (`eyebrow` = small uppercase kicker, `title` = large h2). The user-
// facing input labels read "Custom title" (for eyebrow) and "Custom
// subtitle" (for title) — this matches how the editorial team thinks
// about the section header. Do NOT swap inputs without also rolling
// the DB column rename through the schema, services, and renderers.
interface SectionCardProps {
  /** Anchor id used by the sidebar table-of-contents. */
  id: string;
  /** Section ordinal — rendered as a big mono numeral. */
  number: string;
  /** Section name shown next to the numeral, e.g. "My debrief". */
  name: string;
  /** One short sentence explaining what goes inside. */
  description: string;
  /** Custom value for the small uppercase kicker line. UI labels this input "Custom title". */
  eyebrow?: string;
  /** Placeholder for the eyebrow input — typically the static default from labels.ts. */
  eyebrowPlaceholder?: string;
  /** When provided, renders an editable eyebrow input ("Custom title" in UI) above the title input. */
  onEyebrowChange?: (value: string) => void;
  /** Custom value for the large h2 heading. UI labels this input "Custom subtitle". */
  title?: string;
  /** Placeholder for the title input — typically the static default from labels.ts. */
  titlePlaceholder?: string;
  /** When provided, renders an editable title input ("Custom subtitle" in UI). */
  onTitleChange?: (value: string) => void;
  children: React.ReactNode;
}

export default function SectionCard({
  id,
  number,
  name,
  description,
  eyebrow,
  eyebrowPlaceholder,
  onEyebrowChange,
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
        <div className="font-sans text-[26px] font-semibold leading-none tracking-tight text-accent-gold">
          {number}
        </div>
        <div className="min-w-0">
          <div className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
            {name}
          </div>
          <p className="mt-1 text-[15px] leading-snug text-ink-2">
            {description}
          </p>
        </div>
      </header>
      {onEyebrowChange || onTitleChange ? (
        <div className="space-y-4 border-b border-line px-6 py-5">
          {onEyebrowChange ? (
            <div>
              <label className="block font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                Custom title
              </label>
              {/*
                Mono-uppercase mirrors the small kicker line in the
                rendered header band, so editors see roughly what they'll
                ship.
              */}
              <input
                type="text"
                value={eyebrow ?? ""}
                onChange={(e) => onEyebrowChange(e.target.value)}
                onBlur={(e) => {
                  const trimmed = e.target.value.trim();
                  if (trimmed !== e.target.value) onEyebrowChange(trimmed);
                }}
                placeholder={eyebrowPlaceholder}
                maxLength={120}
                className="mt-2 w-full border-0 bg-transparent p-0 font-sans text-[12px] font-medium uppercase tracking-[0.22em] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-0"
              />
            </div>
          ) : null}
          {onTitleChange ? (
            <div>
              <label className="block font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                Custom subtitle
              </label>
              {/*
                Borderless + serif mirrors how the rendered newsletter h2
                looks, so editors see roughly what they'll ship.
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
                className="mt-2 w-full border-0 bg-transparent p-0 font-display text-[20px] leading-[1.2] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-0"
              />
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="space-y-6 px-6 py-6">{children}</div>
    </section>
  );
}
