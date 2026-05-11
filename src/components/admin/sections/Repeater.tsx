"use client";

import * as React from "react";
import { FieldLabel } from "@/components/admin/sections/FormAtoms";

interface RepeaterProps<T> {
  label: React.ReactNode;
  help?: React.ReactNode;
  items: T[];
  empty: T;
  onChange: (next: T[]) => void;
  render: (item: T, set: (item: T) => void, index: number) => React.ReactNode;
  addLabel?: string;
  emptyState?: React.ReactNode;
}

export default function Repeater<T>({
  label,
  help,
  items,
  empty,
  onChange,
  render,
  addLabel = "Add",
  emptyState,
}: RepeaterProps<T>) {
  function add() {
    onChange([...items, structuredClone(empty)]);
  }

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

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <FieldLabel>{label}</FieldLabel>
          {help ? (
            <p className="text-[11px] leading-snug text-ink-3">{help}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={add}
          className="rounded-xs border border-line bg-cream px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink/40"
        >
          + {addLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-sm border border-dashed border-line bg-cream-3/40 px-4 py-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
          {emptyState ?? "Nothing yet"}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="space-y-3 rounded-sm border border-line bg-cream p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                  {(idx + 1).toString().padStart(2, "0")}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    aria-label="Move up"
                    className="flex h-11 w-11 items-center justify-center rounded-xs font-mono text-[14px] leading-none text-ink-3 transition-colors hover:bg-cream-3 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <span aria-hidden="true">↑</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1}
                    aria-label="Move down"
                    className="flex h-11 w-11 items-center justify-center rounded-xs font-mono text-[14px] leading-none text-ink-3 transition-colors hover:bg-cream-3 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <span aria-hidden="true">↓</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    aria-label="Remove row"
                    className="ml-1 flex h-11 min-w-11 items-center justify-center rounded-xs px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3 transition-colors hover:bg-cream-3 hover:text-ink"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {render(item, (next) => update(idx, next), idx)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
