"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Repeater from "@/components/admin/sections/Repeater";
import {
  FieldLabel,
  TextField,
  TextareaField,
} from "@/components/admin/sections/FormAtoms";
import type {
  PressLink,
  ResultsContent,
} from "@/lib/schemas/newsletterSection";

interface ResultsFieldsProps {
  content: ResultsContent;
  onChange: (next: ResultsContent) => void;
}

export default function ResultsFields({
  content,
  onChange,
}: ResultsFieldsProps) {
  return (
    <div className="space-y-7">
      <Repeater
        label="Snapshot stats"
        help="Up to 4 big numbers. Best as ratios or totals — wins, hours on court, sets won, etc."
        addLabel="Add stat"
        emptyState="No stats yet"
        items={content.stats}
        empty={{ value: "", label: "" }}
        onChange={(stats) => onChange({ ...content, stats })}
        render={(item, set) => (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField
              label="Number"
              placeholder="6"
              value={item.value}
              onChange={(value) => set({ ...item, value })}
            />
            <TextField
              label="Label"
              placeholder="Aces in R2"
              value={item.label}
              onChange={(label) => set({ ...item, label })}
            />
          </div>
        )}
      />

      <Repeater
        label="Matches"
        help="Listed in the order you want them shown. Chronological usually reads best."
        addLabel="Add match"
        emptyState="No matches yet"
        items={content.matches}
        empty={
          {
            result: "W" as const,
            roundName: "",
            date: "",
            opponentName: undefined,
            opponentRank: undefined,
            opponentCountry: undefined,
            score: undefined,
            contextNote: undefined,
            commentary: undefined,
          } as ResultsContent["matches"][number]
        }
        onChange={(matches) => onChange({ ...content, matches })}
        render={(item, set) => (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="space-y-1.5">
                <FieldLabel>Result</FieldLabel>
                <select
                  className="block h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={item.result}
                  onChange={(e) =>
                    set({
                      ...item,
                      result: e.target.value as typeof item.result,
                    })
                  }
                >
                  <option value="W">Win</option>
                  <option value="L">Loss</option>
                  <option value="BYE">Bye</option>
                  <option value="EXEMPT">Exempt</option>
                </select>
              </div>
              <TextField
                label="Round"
                placeholder="R2"
                value={item.roundName}
                onChange={(roundName) => set({ ...item, roundName })}
              />
              <TextField
                label="Date"
                placeholder="14 Apr"
                value={item.date}
                onChange={(date) => set({ ...item, date })}
              />
              <TextField
                label="Score"
                placeholder="6-3 6-4"
                value={item.score ?? ""}
                onChange={(v) =>
                  set({ ...item, score: v || undefined })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <TextField
                label="Opponent"
                placeholder="Terence Atmane"
                value={item.opponentName ?? ""}
                onChange={(v) =>
                  set({ ...item, opponentName: v || undefined })
                }
              />
              <TextField
                label="Rank"
                placeholder="#53"
                value={item.opponentRank ?? ""}
                onChange={(v) =>
                  set({ ...item, opponentRank: v || undefined })
                }
              />
              <TextField
                label="Country"
                placeholder="FRA"
                value={item.opponentCountry ?? ""}
                onChange={(v) =>
                  set({ ...item, opponentCountry: v || undefined })
                }
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Context (optional)</FieldLabel>
              <Input
                placeholder="A short headline-style note — e.g. 'First top-100 win of the year'."
                value={item.contextNote ?? ""}
                onChange={(e) =>
                  set({ ...item, contextNote: e.target.value || undefined })
                }
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Commentary (optional)</FieldLabel>
              <Textarea
                rows={2}
                placeholder="Two or three sentences in the athlete's voice."
                value={item.commentary ?? ""}
                onChange={(e) =>
                  set({ ...item, commentary: e.target.value || undefined })
                }
              />
            </div>
          </div>
        )}
      />

      <Repeater
        label="Press coverage"
        help="What journalists wrote this week. Optional."
        addLabel="Add link"
        emptyState="No press links yet"
        items={content.pressLinks ?? []}
        empty={{ source: "", headline: "", url: "" } as PressLink}
        onChange={(pressLinks) =>
          onChange({
            ...content,
            pressLinks: pressLinks.length ? pressLinks : undefined,
          })
        }
        render={(item, set) => (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <TextField
                label="Source"
                placeholder="L'Équipe"
                value={item.source}
                onChange={(source) => set({ ...item, source })}
              />
              <TextField
                label="URL"
                type="url"
                placeholder="https://…"
                value={item.url}
                onChange={(url) => set({ ...item, url })}
              />
            </div>
            <TextareaField
              label="Headline"
              rows={2}
              placeholder="The headline as it ran."
              value={item.headline}
              onChange={(headline) => set({ ...item, headline })}
            />
          </div>
        )}
      />
    </div>
  );
}
