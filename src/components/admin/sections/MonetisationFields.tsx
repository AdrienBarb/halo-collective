"use client";

import type {
  MonetisationBlock,
  PhaseItem,
} from "@/lib/schemas/newsletterSection";
import BlockList from "@/components/admin/sections/BlockList";
import BlockPicker from "@/components/admin/sections/BlockPicker";
import MediaBlockInput from "@/components/admin/sections/MediaBlockInput";
import Repeater from "@/components/admin/sections/Repeater";
import {
  TextareaField,
  TextField,
} from "@/components/admin/sections/FormAtoms";
import { emptyMonetisationBlock } from "@/components/admin/sections/blockDefaults";

interface MonetisationFieldsProps {
  blocks: MonetisationBlock[];
  onChange: (next: MonetisationBlock[]) => void;
}

type CommercialBlock = Exclude<MonetisationBlock, { kind: "phase_timeline" }>;
type TimelineBlock = Extract<MonetisationBlock, { kind: "phase_timeline" }>;

const KIND_LABELS: Record<MonetisationBlock["kind"], string> = {
  kit: "Kit / gear",
  partner_content: "Partner content",
  affiliate: "Affiliate product",
  paid_content: "Paid / members-only content",
  athlete_product: "Athlete product",
  donation: "Donation / charity",
  fan_experience: "Fan experience",
  phase_timeline: "Phase timeline",
};

const OPTIONS = (
  Object.keys(KIND_LABELS) as Array<MonetisationBlock["kind"]>
).map((kind) => ({ kind, label: KIND_LABELS[kind] }));

const EMPTY_PHASE: PhaseItem = { label: "", title: "", description: "" };

export default function MonetisationFields({
  blocks,
  onChange,
}: MonetisationFieldsProps) {
  function handleAdd(kind: MonetisationBlock["kind"]) {
    onChange([...blocks, emptyMonetisationBlock(kind)]);
  }

  return (
    <div className="space-y-4">
      <BlockPicker options={OPTIONS} onAdd={handleAdd} sectionLabel="Monetisation" />
      <BlockList
        items={blocks}
        onChange={onChange}
        kindLabel={(b) => KIND_LABELS[b.kind]}
        renderItem={(block, set) =>
          block.kind === "phase_timeline"
            ? renderPhaseTimeline(block, set as (next: TimelineBlock) => void)
            : renderCommercial(block, set as (next: CommercialBlock) => void)
        }
      />
    </div>
  );
}

function renderPhaseTimeline(
  block: TimelineBlock,
  set: (next: TimelineBlock) => void,
): React.ReactNode {
  return (
    <Repeater
      label="Phases"
      help="2–10 phases. Section title is used as heading — no per-block title."
      items={block.phases}
      empty={EMPTY_PHASE}
      addLabel="Add phase"
      onChange={(next) => set({ ...block, phases: next })}
      render={(phase, setPhase) => (
        <div className="space-y-3">
          <TextField
            label="Label"
            placeholder="PHASE 1"
            value={phase.label}
            onChange={(v) => setPhase({ ...phase, label: v })}
          />
          <TextField
            label="Title"
            placeholder="Décharge totale"
            value={phase.title}
            onChange={(v) => setPhase({ ...phase, title: v })}
          />
          <TextareaField
            label="Description"
            placeholder="Cryo 3x/jour, compression, anti-inflammatoires…"
            rows={3}
            value={phase.description}
            onChange={(v) => setPhase({ ...phase, description: v })}
          />
        </div>
      )}
    />
  );
}

function renderCommercial(
  block: CommercialBlock,
  set: (next: CommercialBlock) => void,
): React.ReactNode {
  return (
    <div className="space-y-3">
      <TextField
        label="Title"
        placeholder="Rackets I played with this week"
        value={block.title}
        onChange={(v) => set({ ...block, title: v })}
      />
      {renderKindExtras(block, set)}
      <TextareaField
        label="Body (optional)"
        placeholder="A short sell line or two."
        rows={3}
        value={block.body ?? ""}
        onChange={(v) => set({ ...block, body: v || undefined })}
      />
      <MediaBlockInput
        value={block.media}
        onChange={(next) => set({ ...block, media: next })}
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <TextField
          label="CTA label"
          placeholder="Shop the kit"
          value={block.cta.label}
          onChange={(v) =>
            set({ ...block, cta: { ...block.cta, label: v } })
          }
        />
        <TextField
          label="CTA URL"
          placeholder="https://shop.example.com/kit"
          type="url"
          value={block.cta.url}
          onChange={(v) => set({ ...block, cta: { ...block.cta, url: v } })}
        />
      </div>
    </div>
  );
}

function renderKindExtras(
  block: CommercialBlock,
  set: (next: CommercialBlock) => void,
): React.ReactNode {
  switch (block.kind) {
    case "kit":
    case "athlete_product":
      return (
        <TextField
          label="Price (optional)"
          placeholder="$129"
          value={block.price ?? ""}
          onChange={(v) => set({ ...block, price: v || undefined })}
        />
      );
    case "partner_content":
      return (
        <TextField
          label="Partner name (optional)"
          placeholder="Rolex"
          value={block.partnerName ?? ""}
          onChange={(v) => set({ ...block, partnerName: v || undefined })}
        />
      );
    case "donation":
      return (
        <TextField
          label="Goal label (optional)"
          placeholder="€10k raised"
          value={block.goalLabel ?? ""}
          onChange={(v) => set({ ...block, goalLabel: v || undefined })}
        />
      );
    case "fan_experience":
      return (
        <TextField
          label="Date label (optional)"
          placeholder="June 12, Paris"
          value={block.dateLabel ?? ""}
          onChange={(v) => set({ ...block, dateLabel: v || undefined })}
        />
      );
    default:
      return null;
  }
}
