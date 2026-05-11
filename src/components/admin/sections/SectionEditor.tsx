import {
  blocksFor,
  type EditionModeValue,
  type SectionTypeValue,
} from "@/lib/schemas/newsletterSection";

// ── Section draft type ────────────────────────────────────────────────
//
// Drafts live in editor state and are validated against (type, mode)
// block-list schemas at submit time. The form maintains one draft per
// section type; blocks are the editor's working list.

export interface SectionDraft {
  type: SectionTypeValue;
  blocks: unknown[];
}

export function validateSectionDraft(
  draft: SectionDraft,
  mode: EditionModeValue,
):
  | { ok: true; blocks: unknown[] }
  | { ok: false; message: string } {
  const result = blocksFor(draft.type, mode).safeParse(draft.blocks);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first.path.join(".") || "blocks";
    return {
      ok: false,
      message: `${path}: ${first.message}`,
    };
  }
  return { ok: true, blocks: result.data as unknown[] };
}
