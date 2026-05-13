"use client";

import { cn } from "@/lib/utils";
import type { OnboardingOption } from "@/lib/constants/onboarding";

interface ChipMultiSelectProps {
  label: string;
  options: ReadonlyArray<OnboardingOption>;
  value: string[];
  onChange: (next: string[]) => void;
}

export default function ChipMultiSelect({
  label,
  options,
  value,
  onChange,
}: ChipMultiSelectProps) {
  function toggle(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
      return;
    }
    onChange([...value, option]);
  }

  return (
    <div className="space-y-3">
      <h3 className="font-serif text-[16px] font-semibold tracking-[-0.005em] text-ink">
        {label}
      </h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(option.value)}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition",
                selected
                  ? "border-accent-warm bg-accent-warm/15 text-ink"
                  : "border-line bg-cream text-ink-2 hover:bg-cream-3",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
