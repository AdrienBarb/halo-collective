"use client";

import * as React from "react";

interface BlockOption<K extends string> {
  kind: K;
  label: string;
}

interface BlockPickerProps<K extends string> {
  options: ReadonlyArray<BlockOption<K>>;
  onAdd: (kind: K) => void;
  /** Visible button label (e.g. "Add block"). */
  label?: string;
  /** Section context for the select's accessible name. */
  sectionLabel?: string;
}

// Dropdown + Add button shown above a section's block list.
// Editor picks a kind, clicks Add, and the section's onAdd handler
// appends a fresh empty block of that kind.
export default function BlockPicker<K extends string>({
  options,
  onAdd,
  label = "Add block",
  sectionLabel,
}: BlockPickerProps<K>) {
  const [selected, setSelected] = React.useState<K>(options[0]?.kind);

  if (!selected) return null;

  const selectLabel = sectionLabel
    ? `Block kind for ${sectionLabel}`
    : "Block kind to add";

  return (
    <div className="flex items-center gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value as K)}
        aria-label={selectLabel}
        className="min-h-11 rounded-xs border border-line bg-cream px-3 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-ink"
      >
        {options.map((opt) => (
          <option key={opt.kind} value={opt.kind}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onAdd(selected)}
        className="min-h-11 rounded-xs border border-line bg-ink px-3 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-cream transition-colors hover:bg-ink-2"
      >
        + {label}
      </button>
    </div>
  );
}
