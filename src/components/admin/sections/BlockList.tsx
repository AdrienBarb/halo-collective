"use client";

import * as React from "react";

interface BlockListProps<T> {
  items: T[];
  onChange: (next: T[]) => void;
  renderItem: (item: T, set: (item: T) => void, index: number) => React.ReactNode;
  kindLabel: (item: T) => string;
  emptyState?: React.ReactNode;
}

// Stable per-row key. Monetisation/engagement blocks already carry a
// UUID `id`; others (media, schedule_item, ...) fall back to index +
// a per-mount counter so React preserves child state across reorders
// for the lifetime of this list.
function getRowKey(item: unknown, fallback: number): string {
  if (
    item &&
    typeof item === "object" &&
    "id" in item &&
    typeof (item as { id: unknown }).id === "string"
  ) {
    return (item as { id: string }).id;
  }
  return `row-${fallback}`;
}

// Shared list-of-blocks UI: each block lives in a card with a kind
// label header + reorder/delete controls. The per-kind subform is
// passed in by the section field component as `renderItem`.
export default function BlockList<T>({
  items,
  onChange,
  renderItem,
  kindLabel,
  emptyState,
}: BlockListProps<T>) {
  function update(idx: number, next: T) {
    const arr = [...items];
    arr[idx] = next;
    onChange(arr);
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const arr = [...items];
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    onChange(arr);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-line bg-cream-3/40 px-4 py-6 text-center font-sans text-[10px] uppercase tracking-[0.18em] text-ink-3">
        {emptyState ?? "No blocks yet — pick a kind above and click Add"}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, idx) => (
        <li
          key={getRowKey(item, idx)}
          className="space-y-3 rounded-sm border border-line bg-cream p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
              {(idx + 1).toString().padStart(2, "0")} &nbsp;|&nbsp; {kindLabel(item)}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                aria-label="Move up"
                className="flex h-11 w-11 items-center justify-center rounded-xs font-sans text-[14px] leading-none text-ink-3 transition-colors hover:bg-cream-3 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
              >
                <span aria-hidden="true">↑</span>
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={idx === items.length - 1}
                aria-label="Move down"
                className="flex h-11 w-11 items-center justify-center rounded-xs font-sans text-[14px] leading-none text-ink-3 transition-colors hover:bg-cream-3 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
              >
                <span aria-hidden="true">↓</span>
              </button>
              <button
                type="button"
                onClick={() => remove(idx)}
                aria-label="Remove block"
                className="ml-1 flex h-11 min-w-11 items-center justify-center rounded-xs px-2 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-ink-3 transition-colors hover:bg-cream-3 hover:text-ink"
              >
                Remove
              </button>
            </div>
          </div>
          {renderItem(item, (next) => update(idx, next), idx)}
        </li>
      ))}
    </ul>
  );
}
