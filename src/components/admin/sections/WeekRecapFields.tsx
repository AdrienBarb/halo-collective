"use client";

import type {
  EditionModeValue,
  MatchCardBlock,
  WeekRecapTournamentBlock,
  WeekRecapWeeklyBlock,
} from "@/lib/schemas/newsletterSection";
import BlockList from "@/components/admin/sections/BlockList";
import BlockPicker from "@/components/admin/sections/BlockPicker";
import CompactImageField from "@/components/admin/sections/CompactImageField";
import MediaBlockInput from "@/components/admin/sections/MediaBlockInput";
import Repeater from "@/components/admin/sections/Repeater";
import {
  Field,
  TextareaField,
  TextField,
} from "@/components/admin/sections/FormAtoms";
import {
  emptyWeekRecapBlock,
  type WeekRecapBlockKind,
} from "@/components/admin/sections/blockDefaults";

type WeekRecapBlock = WeekRecapTournamentBlock | WeekRecapWeeklyBlock;

interface WeekRecapFieldsProps {
  blocks: WeekRecapBlock[];
  editionMode: EditionModeValue;
  onChange: (next: WeekRecapBlock[]) => void;
}

const KIND_LABELS: Record<WeekRecapBlockKind, string> = {
  tournament_summary: "Tournament summary",
  hero_metric: "Hero metric",
  match_card: "Match card",
  media_link: "Media link",
  training_update: "Training update",
  recovery_travel_update: "Recovery / travel update",
  social_recap: "Social recap",
  media_recap: "Media recap",
  stats_update: "Ranking / stats update",
  throwback: "Throwback",
  quote: "Quote",
};

const TOURNAMENT_KINDS: WeekRecapBlockKind[] = [
  "tournament_summary",
  "hero_metric",
  "match_card",
  "media_link",
];

const WEEKLY_KINDS: WeekRecapBlockKind[] = [
  "training_update",
  "recovery_travel_update",
  "social_recap",
  "media_recap",
  "stats_update",
  "throwback",
  "quote",
];

const MATCH_RESULTS: Array<{ value: MatchCardBlock["result"]; label: string }> = [
  { value: "W", label: "Win" },
  { value: "L", label: "Loss" },
  { value: "BYE", label: "Bye" },
  { value: "EXEMPT", label: "Exempt" },
];

const MATCH_FORMATS: Array<{ value: MatchCardBlock["format"]; label: string }> = [
  { value: "singles", label: "Singles" },
  { value: "doubles", label: "Doubles" },
];

export default function WeekRecapFields({
  blocks,
  editionMode,
  onChange,
}: WeekRecapFieldsProps) {
  const allowedKinds = editionMode === "TOURNAMENT" ? TOURNAMENT_KINDS : WEEKLY_KINDS;
  const options = allowedKinds.map((kind) => ({ kind, label: KIND_LABELS[kind] }));

  function handleAdd(kind: WeekRecapBlockKind) {
    onChange([...blocks, emptyWeekRecapBlock(kind)]);
  }

  return (
    <div className="space-y-4">
      <BlockPicker options={options} onAdd={handleAdd} sectionLabel="Week recap" />
      <BlockList
        items={blocks}
        onChange={onChange}
        kindLabel={(b) => KIND_LABELS[b.kind]}
        renderItem={(block, set) => renderBlockEditor(block, set)}
      />
    </div>
  );
}

function renderBlockEditor(
  block: WeekRecapBlock,
  set: (next: WeekRecapBlock) => void,
): React.ReactNode {
  switch (block.kind) {
    case "tournament_summary":
      return (
        <div className="space-y-3">
          <CompactImageField
            label="Logo"
            value={block.logoUrl ?? null}
            onChange={(url) => set({ ...block, logoUrl: url ?? undefined })}
            onClear={() => set({ ...block, logoUrl: undefined })}
            aspect="square"
            height={88}
          />
          <TextField
            label="Tournament name"
            placeholder="Rolex Monte-Carlo Masters"
            value={block.name}
            onChange={(v) => set({ ...block, name: v })}
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField
              label="Category"
              placeholder="ATP Masters 1000"
              value={block.category ?? ""}
              onChange={(v) => set({ ...block, category: v || undefined })}
            />
            <TextField
              label="Location"
              placeholder="Monte Carlo, Monaco"
              value={block.location ?? ""}
              onChange={(v) => set({ ...block, location: v || undefined })}
            />
            <TextField
              label="Surface"
              placeholder="Clay"
              value={block.surface ?? ""}
              onChange={(v) => set({ ...block, surface: v || undefined })}
            />
            <TextField
              label="Date range"
              placeholder="6–13 April"
              value={block.dateRange ?? ""}
              onChange={(v) => set({ ...block, dateRange: v || undefined })}
            />
          </div>
        </div>
      );

    case "hero_metric":
      return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <TextField
            label="Value"
            placeholder="QF"
            value={block.value}
            onChange={(v) => set({ ...block, value: v })}
          />
          <TextField
            label="Label"
            placeholder="Best result"
            value={block.label}
            onChange={(v) => set({ ...block, label: v })}
          />
        </div>
      );

    case "match_card":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="Format">
              <select
                value={block.format}
                onChange={(e) =>
                  set({ ...block, format: e.target.value as MatchCardBlock["format"] })
                }
                className="w-full rounded-xs border border-line bg-cream px-3 py-2 text-sm text-ink"
              >
                {MATCH_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Result">
              <select
                value={block.result}
                onChange={(e) =>
                  set({ ...block, result: e.target.value as MatchCardBlock["result"] })
                }
                className="w-full rounded-xs border border-line bg-cream px-3 py-2 text-sm text-ink"
              >
                {MATCH_RESULTS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Field>
            <TextField
              label="Round"
              placeholder="Round of 16"
              value={block.roundName}
              onChange={(v) => set({ ...block, roundName: v })}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <TextField
              label="Opponent name"
              placeholder="J. Lehecka"
              value={block.opponentName ?? ""}
              onChange={(v) => set({ ...block, opponentName: v || undefined })}
            />
            <TextField
              label="Opponent country"
              placeholder="CZE"
              value={block.opponentCountry ?? ""}
              onChange={(v) => set({ ...block, opponentCountry: v || undefined })}
            />
            <TextField
              label="Opponent rank / seed"
              placeholder="#13"
              value={block.opponentRank ?? ""}
              onChange={(v) => set({ ...block, opponentRank: v || undefined })}
            />
          </div>
          <TextField
            label="Context note (optional)"
            placeholder="Seed #22 · Walkover · with V. Vacherot"
            help="Short qualifier shown next to the opponent name. Don't repeat the opponent's name here."
            value={block.contextNote ?? ""}
            onChange={(v) => set({ ...block, contextNote: v || undefined })}
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField
              label="Score"
              placeholder="6-2 7-5"
              value={block.score ?? ""}
              onChange={(v) => set({ ...block, score: v || undefined })}
            />
            <TextField
              label="Date"
              placeholder="Apr 10"
              value={block.date ?? ""}
              onChange={(v) => set({ ...block, date: v || undefined })}
            />
          </div>
          <TextField
            label="Highlights URL"
            placeholder="https://www.youtube.com/watch?v=…"
            help="YouTube auto-detected and shown with a YouTube badge at render time."
            type="url"
            value={block.highlightUrl ?? ""}
            onChange={(v) => set({ ...block, highlightUrl: v || undefined })}
          />
          <TextareaField
            label="Commentary (optional)"
            placeholder="One short line about the match."
            rows={2}
            value={block.commentary ?? ""}
            onChange={(v) => set({ ...block, commentary: v || undefined })}
          />
        </div>
      );

    case "media_link":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField
              label="Source"
              placeholder="L'Équipe"
              value={block.source}
              onChange={(v) => set({ ...block, source: v })}
            />
            <TextField
              label="CTA label (optional)"
              placeholder="Read"
              value={block.ctaLabel ?? ""}
              onChange={(v) => set({ ...block, ctaLabel: v || undefined })}
            />
          </div>
          <TextField
            label="Headline"
            placeholder="Une semaine ascendante"
            value={block.headline}
            onChange={(v) => set({ ...block, headline: v })}
          />
          <TextField
            label="URL"
            placeholder="https://lequipe.fr/…"
            type="url"
            value={block.url}
            onChange={(v) => set({ ...block, url: v })}
          />
        </div>
      );

    case "training_update":
    case "recovery_travel_update":
    case "throwback":
      return (
        <div className="space-y-3">
          <TextareaField
            label="Body"
            placeholder="What happened, in a paragraph or two."
            value={block.body}
            onChange={(v) => set({ ...block, body: v })}
          />
          <MediaBlockInput
            value={block.media}
            onChange={(next) => set({ ...block, media: next })}
          />
        </div>
      );

    case "social_recap":
      return (
        <Repeater
          label="Posts"
          items={block.posts}
          empty={{ url: "", caption: undefined }}
          onChange={(next) => set({ ...block, posts: next })}
          addLabel="Post"
          render={(post, setPost) => (
            <div className="space-y-3">
              <TextField
                label="URL"
                placeholder="https://instagram.com/p/…"
                type="url"
                value={post.url}
                onChange={(v) => setPost({ ...post, url: v })}
              />
              <TextField
                label="Caption (optional)"
                placeholder="Best moment of the week"
                value={post.caption ?? ""}
                onChange={(v) => setPost({ ...post, caption: v || undefined })}
              />
            </div>
          )}
        />
      );

    case "media_recap":
      return (
        <Repeater
          label="Links"
          items={block.links}
          empty={{ source: "", headline: "", url: "" }}
          onChange={(next) => set({ ...block, links: next })}
          addLabel="Link"
          render={(link, setLink) => (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <TextField
                  label="Source"
                  placeholder="L'Équipe"
                  value={link.source}
                  onChange={(v) => setLink({ ...link, source: v })}
                />
                <TextField
                  label="URL"
                  type="url"
                  placeholder="https://…"
                  value={link.url}
                  onChange={(v) => setLink({ ...link, url: v })}
                />
              </div>
              <TextField
                label="Headline"
                value={link.headline}
                onChange={(v) => setLink({ ...link, headline: v })}
              />
            </div>
          )}
        />
      );

    case "stats_update":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField
              label="Current ranking"
              placeholder="#18"
              value={block.rankingCurrent ?? ""}
              onChange={(v) =>
                set({ ...block, rankingCurrent: v || undefined })
              }
            />
            <TextField
              label="Movement"
              placeholder="+4 this week"
              value={block.rankingChange ?? ""}
              onChange={(v) =>
                set({ ...block, rankingChange: v || undefined })
              }
            />
          </div>
          <TextareaField
            label="Body (optional)"
            placeholder="Anything to add about the numbers."
            rows={3}
            value={block.body ?? ""}
            onChange={(v) => set({ ...block, body: v || undefined })}
          />
        </div>
      );

    case "quote":
      return (
        <div className="space-y-3">
          <TextareaField
            label="Quote"
            placeholder="The line you want pulled out."
            rows={3}
            value={block.text}
            onChange={(v) => set({ ...block, text: v })}
          />
          <TextField
            label="Attribution (optional)"
            placeholder="Coach Marco, post-match"
            value={block.attribution ?? ""}
            onChange={(v) => set({ ...block, attribution: v || undefined })}
          />
        </div>
      );
  }
}
