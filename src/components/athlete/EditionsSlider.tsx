"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type EditionsSliderProps = {
  count: number;
  children: React.ReactNode;
};

export default function EditionsSlider({ count, children }: EditionsSliderProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  function scrollByCard(direction: 1 | -1) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.querySelector<HTMLElement>("[data-edition-card]");
    const distance = card ? card.offsetWidth + 24 : scroller.clientWidth * 0.8;
    scroller.scrollBy({ left: distance * direction, behavior: "smooth" });
  }

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink">
            Editions
          </h2>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
            {count.toString().padStart(2, "0")}
          </span>
        </div>
        {count > 1 ? (
          <div className="flex gap-2">
            <ArrowButton
              direction="left"
              onClick={() => scrollByCard(-1)}
              label="Previous edition"
            />
            <ArrowButton
              direction="right"
              onClick={() => scrollByCard(1)}
              label="Next edition"
            />
          </div>
        ) : null}
      </div>

      <div
        ref={scrollerRef}
        className="-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}

function ArrowButton({
  direction,
  onClick,
  label,
}: {
  direction: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream-2 text-ink-2 transition-colors hover:border-line-2 hover:text-ink"
    >
      <Icon className="h-4 w-4" strokeWidth={1.6} />
    </button>
  );
}
