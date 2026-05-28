"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import type { Newsletter, NewsletterSection } from "@prisma/client";
import {
  newsletterFormSchema,
  type NewsletterFormInput,
} from "@/lib/schemas/newsletter";
import useApi from "@/lib/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import HeroUploader from "@/components/admin/HeroUploader";
import CompactImageField from "@/components/admin/sections/CompactImageField";
import SectionCard from "@/components/admin/sections/SectionCard";
import AthleteReviewFields from "@/components/admin/sections/AthleteReviewFields";
import WeekRecapFields from "@/components/admin/sections/WeekRecapFields";
import ComingUpFields from "@/components/admin/sections/ComingUpFields";
import MonetisationFields from "@/components/admin/sections/MonetisationFields";
import FanEngagementFields from "@/components/admin/sections/FanEngagementFields";
import { validateSectionDraft } from "@/components/admin/sections/SectionEditor";
import {
  SECTION_DESCRIPTIONS,
  SECTION_LABELS,
  SECTION_ORDER,
} from "@/components/admin/sections/sectionDefaults";
import {
  isSectionMeaningful,
  type AthleteReviewBlock,
  type ComingUpBlock,
  type EditionModeValue,
  type FanEngagementBlock,
  type MonetisationBlock,
  type SectionTypeValue,
  type WeekRecapTournamentBlock,
  type WeekRecapWeeklyBlock,
} from "@/lib/schemas/newsletterSection";
import {
  parseNewsletterImport,
  type ParsedNewsletterImport,
} from "@/lib/newsletter/importJson";
import { getNewsletterLabels, getSectionTitle } from "@/lib/newsletter/labels";
import { DEFAULT_LOCALE } from "@/i18n/locales";
import { CLAUDE_BRIEF_PROJECT_SYSTEM_PROMPT } from "@/lib/newsletter/claudeBriefPrompt";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  NEWSLETTER_PREVIEW_ROUTE,
  NEWSLETTER_PREVIEW_STORAGE_KEY,
} from "@/lib/newsletter/preview";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/better-auth/auth-client";

type NewsletterWithSections = Newsletter & {
  sections: NewsletterSection[];
};

interface AthleteOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface NewsletterFormProps {
  athleteId?: string;
  athletes?: AthleteOption[];
  initialData?: NewsletterWithSections;
  mode: "create" | "edit";
}

type HeaderValues = NewsletterFormInput;
type SectionBlocksMap = Record<SectionTypeValue, unknown[]>;

const SECTION_ANCHORS: Record<SectionTypeValue, string> = {
  ATHLETE_REVIEW: "athlete-review",
  WEEK_RECAP: "week-recap",
  COMING_UP: "coming-up",
  MONETISATION: "monetisation",
  FAN_ENGAGEMENT: "fan-engagement",
};

function toDateInput(date: Date | string | null | undefined): string | undefined {
  if (!date) return undefined;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

// Brevo merge tags exposed in the Email subject editor. Keys map to the
// `attributes` we upsert on Brevo contacts (see services/subscription.ts).
const EMAIL_SUBJECT_MERGE_TAGS: ReadonlyArray<{ label: string; value: string }> = [
  { label: "First name (Hey fallback)", value: '{{ contact.FIRSTNAME | default: "Hey" }}' },
];

// Build the per-section block map, falling back to an empty list for
// any section the database hasn't seen yet.
function buildSectionBlocksMap(
  initial: NewsletterSection[] | undefined,
): SectionBlocksMap {
  const byType = new Map<SectionTypeValue, NewsletterSection>();
  for (const s of initial ?? []) {
    const t = s.type as SectionTypeValue;
    if (!byType.has(t)) byType.set(t, s);
  }
  const map = {} as SectionBlocksMap;
  for (const type of SECTION_ORDER) {
    const found = byType.get(type);
    const blocks = found?.blocks;
    map[type] = Array.isArray(blocks) ? (blocks as unknown[]) : [];
  }
  return map;
}

type SectionTitlesMap = Record<SectionTypeValue, string>;
type SectionEyebrowsMap = Record<SectionTypeValue, string>;

function buildSectionTitlesMap(
  initial: NewsletterSection[] | undefined,
): SectionTitlesMap {
  const byType = new Map<SectionTypeValue, NewsletterSection>();
  for (const s of initial ?? []) {
    const t = s.type as SectionTypeValue;
    if (!byType.has(t)) byType.set(t, s);
  }
  const map = {} as SectionTitlesMap;
  for (const type of SECTION_ORDER) {
    map[type] = byType.get(type)?.title ?? "";
  }
  return map;
}

function buildSectionEyebrowsMap(
  initial: NewsletterSection[] | undefined,
): SectionEyebrowsMap {
  const byType = new Map<SectionTypeValue, NewsletterSection>();
  for (const s of initial ?? []) {
    const t = s.type as SectionTypeValue;
    if (!byType.has(t)) byType.set(t, s);
  }
  const map = {} as SectionEyebrowsMap;
  for (const type of SECTION_ORDER) {
    map[type] = byType.get(type)?.eyebrow ?? "";
  }
  return map;
}

export default function NewsletterForm({
  athleteId,
  athletes,
  initialData,
  mode,
}: NewsletterFormProps) {
  const router = useRouter();
  const { usePost, usePut } = useApi();
  const isEdit = mode === "edit";
  const [aiInput, setAiInput] = useState("");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    athleteId ?? "",
  );

  const form = useForm<HeaderValues>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      emailSubject: initialData?.emailSubject ?? "",
      heroImageUrl: initialData?.heroImageUrl ?? undefined,
      editionMode: (initialData?.editionMode as EditionModeValue | undefined) ?? "WEEKLY",
      tournamentName: initialData?.tournamentName ?? undefined,
      tournamentLogoUrl: initialData?.tournamentLogoUrl ?? undefined,
      tournamentCategory: initialData?.tournamentCategory ?? undefined,
      tournamentLocation: initialData?.tournamentLocation ?? undefined,
      tournamentSurface: initialData?.tournamentSurface ?? undefined,
      tournamentStartDate: toDateInput(initialData?.tournamentStartDate),
      tournamentEndDate: toDateInput(initialData?.tournamentEndDate),
      worldRankSnapshot: initialData?.worldRankSnapshot ?? undefined,
      countryRankSnapshot: initialData?.countryRankSnapshot ?? undefined,
    },
  });

  const [sections, setSections] = useState<SectionBlocksMap>(() =>
    buildSectionBlocksMap(initialData?.sections),
  );
  const [sectionTitles, setSectionTitles] = useState<SectionTitlesMap>(() =>
    buildSectionTitlesMap(initialData?.sections),
  );
  const [sectionEyebrows, setSectionEyebrows] = useState<SectionEyebrowsMap>(() =>
    buildSectionEyebrowsMap(initialData?.sections),
  );

  const editionMode = (useWatch({
    control: form.control,
    name: "editionMode",
  }) ?? "WEEKLY") as EditionModeValue;

  const [importOpen, setImportOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<ParsedNewsletterImport | null>(
    null,
  );

  function applyImport(parsed: ParsedNewsletterImport) {
    form.reset(parsed.header);
    const nextSections = {} as SectionBlocksMap;
    const nextTitles = {} as SectionTitlesMap;
    const nextEyebrows = {} as SectionEyebrowsMap;
    for (const type of SECTION_ORDER) {
      nextSections[type] = parsed.sections[type].blocks;
      nextTitles[type] = parsed.sections[type].title ?? "";
      nextEyebrows[type] = parsed.sections[type].eyebrow ?? "";
    }
    setSections(nextSections);
    setSectionTitles(nextTitles);
    setSectionEyebrows(nextEyebrows);
    setImportError(null);
    const blockCount = Object.values(nextSections).reduce(
      (sum, blocks) => sum + blocks.length,
      0,
    );
    const warningCount = parsed.warnings.length;
    toast.success(
      `Prefilled · ${blockCount} block${blockCount === 1 ? "" : "s"}` +
        (warningCount ? ` · ${warningCount} warning${warningCount === 1 ? "" : "s"}` : ""),
    );
    if (warningCount > 0) {
      // Log so the editor can inspect in console — verbose detail
      // doesn't belong in the toast.
      console.warn("newsletter.import_warnings", parsed.warnings);
    }
    setImportOpen(false);
  }

  // Refs mirror the latest sections + form dirty state so the import
  // callbacks (including the react-query onSuccess closure) always read
  // current values instead of a stale render snapshot. Without this, a
  // future memoization of `useApi.usePost` could silently skip the
  // confirm dialog and overwrite unsaved edits.
  const emailSubjectInputRef = useRef<HTMLInputElement | null>(null);

  const sectionsRef = useRef(sections);
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  const isDirtyRef = useRef(form.formState.isDirty);
  useEffect(() => {
    isDirtyRef.current = form.formState.isDirty;
  }, [form.formState.isDirty]);

  function handleImportRaw(raw: string): boolean {
    if (!raw.trim()) {
      setImportError("Paste a JSON payload first");
      return false;
    }
    let parsed: ParsedNewsletterImport;
    try {
      parsed = parseNewsletterImport(raw);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not parse JSON";
      setImportError(message);
      return false;
    }
    const currentSections = sectionsRef.current;
    const hasMeaningfulSections = SECTION_ORDER.some((type) =>
      isSectionMeaningful(type, currentSections[type]),
    );
    const needsConfirm =
      isEdit || isDirtyRef.current || hasMeaningfulSections;
    if (needsConfirm) {
      setPendingImport(parsed);
      return true;
    }
    applyImport(parsed);
    return true;
  }

  const generate = usePost("/admin/newsletters/generate", {
    onSuccess: (data: { json: string }) => {
      setImportError(null);
      handleImportRaw(data.json);
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      const message =
        error.response?.data?.error ?? "Generation failed — try again.";
      setImportError(message);
      toast.error(message);
    },
  });

  function handleGenerate() {
    const raw = aiInput.trim();
    if (!raw) {
      setImportError("Paste source material first");
      return;
    }
    setImportError(null);
    generate.mutate({ input: raw });
  }

  async function handleCopyClaudePrompt() {
    try {
      await navigator.clipboard.writeText(CLAUDE_BRIEF_PROJECT_SYSTEM_PROMPT);
      toast.success(
        "System prompt copied — paste it into your Claude.ai Project's custom instructions",
      );
    } catch {
      toast.error("Could not copy the prompt");
    }
  }

  // Warn before navigating away with unsaved edits — section blocks live
  // outside react-hook-form, so isDirty alone isn't sufficient.
  const isDirty = form.formState.isDirty;
  useEffect(() => {
    function handler(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const create = usePost("/admin/newsletters", {
    onSuccess: (data: Newsletter) => {
      toast.success("Newsletter created");
      router.push(`/admin/newsletters/${data.id}`);
      router.refresh();
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error ?? "Failed to create newsletter");
    },
  });

  const update = usePut(`/admin/newsletters/${initialData?.id ?? ""}`, {
    onSuccess: (data: NewsletterWithSections) => {
      toast.success("Newsletter saved");
      form.reset({
        title: data.title,
        emailSubject: data.emailSubject ?? "",
        heroImageUrl: data.heroImageUrl ?? undefined,
        editionMode: data.editionMode as EditionModeValue,
        tournamentName: data.tournamentName ?? undefined,
        tournamentLogoUrl: data.tournamentLogoUrl ?? undefined,
        tournamentCategory: data.tournamentCategory ?? undefined,
        tournamentLocation: data.tournamentLocation ?? undefined,
        tournamentSurface: data.tournamentSurface ?? undefined,
        tournamentStartDate: toDateInput(data.tournamentStartDate),
        tournamentEndDate: toDateInput(data.tournamentEndDate),
        worldRankSnapshot: data.worldRankSnapshot ?? undefined,
        countryRankSnapshot: data.countryRankSnapshot ?? undefined,
      });
      setSections(buildSectionBlocksMap(data.sections));
      setSectionTitles(buildSectionTitlesMap(data.sections));
      setSectionEyebrows(buildSectionEyebrowsMap(data.sections));
      router.refresh();
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error ?? "Failed to save newsletter");
    },
  });

  const isPending = create.isPending || update.isPending;

  const { data: sessionData } = useSession();
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  function handleOpenTestDialog() {
    if (!testEmail && sessionData?.user.email) {
      setTestEmail(sessionData.user.email);
    }
    setTestDialogOpen(true);
  }

  const testSend = usePost("/admin/newsletters/test-send", {
    onSuccess: () => {
      toast.success("Test email sent");
      setTestDialogOpen(false);
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error ?? "Failed to send test email");
    },
  });

  function handleSendTest() {
    const athleteId = isEdit ? initialData?.athleteId : selectedAthleteId;
    if (!athleteId) {
      toast.error("Pick an athlete first");
      return;
    }
    const trimmed = testEmail.trim();
    if (!trimmed) {
      toast.error("Enter an email address");
      return;
    }
    testSend.mutate({
      athleteId,
      newsletterId: isEdit ? initialData?.id : undefined,
      header: form.getValues(),
      sections: buildSectionPayloads(),
      testEmail: trimmed,
    });
  }

  function setSectionBlocks(type: SectionTypeValue, blocks: unknown[]) {
    setSections((prev) => ({ ...prev, [type]: blocks }));
  }

  // Single chokepoint for the section payload shape — keeps test-send,
  // preview, and submit identical so an admin signing off on a preview
  // sees what publish will actually render.
  const buildSectionPayloads = (
    blocksOverrides?: Partial<Record<SectionTypeValue, unknown[]>>,
  ): Array<{
    type: SectionTypeValue;
    eyebrow: string | null;
    title: string | null;
    blocks: unknown[];
  }> =>
    SECTION_ORDER.map((type) => ({
      type,
      eyebrow: sectionEyebrows[type]?.trim() || null,
      title: sectionTitles[type]?.trim() || null,
      blocks: blocksOverrides?.[type] ?? sections[type] ?? [],
    }));

  function onSubmit(values: HeaderValues) {
    const mode = (values.editionMode ?? "WEEKLY") as EditionModeValue;
    const validatedBlocks: Partial<Record<SectionTypeValue, unknown[]>> = {};
    for (const type of SECTION_ORDER) {
      const result = validateSectionDraft(
        { type, blocks: sections[type] },
        mode,
      );
      if (!result.ok) {
        toast.error(`${SECTION_LABELS[type]}: ${result.message}`);
        if (typeof document !== "undefined") {
          document
            .getElementById(SECTION_ANCHORS[type])
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }
      validatedBlocks[type] = result.blocks;
    }
    const ordered = buildSectionPayloads(validatedBlocks);
    if (isEdit) {
      update.mutate({ ...values, sections: ordered });
    } else {
      if (!selectedAthleteId) {
        toast.error("Pick an athlete first");
        return;
      }
      create.mutate({
        athleteId: selectedAthleteId,
        ...values,
        sections: ordered,
      });
    }
  }

  const submitLabel = useMemo(() => {
    if (isPending) return "Saving…";
    return isEdit ? "Save changes" : "Create newsletter";
  }, [isEdit, isPending]);

  const canPreview = isEdit || selectedAthleteId.length > 0;

  function handlePreview() {
    const athleteId = isEdit ? initialData?.athleteId : selectedAthleteId;
    if (!athleteId) {
      toast.error("Pick an athlete first");
      return;
    }
    // handlePreview only runs on click — Date.now() here is not a
    // render call. The lint heuristic widened after F2 introduced
    // a state-closing helper; suppress narrowly rather than restructure.
    // eslint-disable-next-line react-hooks/purity
    const stashedAt = Date.now();
    const payload = {
      athleteId,
      newsletterId: isEdit ? initialData?.id : undefined,
      header: form.getValues(),
      sections: buildSectionPayloads(),
      stashedAt,
    };
    try {
      window.localStorage.setItem(
        NEWSLETTER_PREVIEW_STORAGE_KEY,
        JSON.stringify(payload),
      );
    } catch {
      toast.error("Could not stash preview data");
      return;
    }
    const opened = window.open(NEWSLETTER_PREVIEW_ROUTE, "_blank", "noopener");
    if (!opened) {
      toast.error("Allow popups to preview the newsletter");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
        <div>
          <div className="space-y-8 pb-32">
            {!isEdit ? (
              <section className="rounded-sm border border-line bg-cream-2 px-6 py-5">
                <div className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                  Athlete
                </div>
                <p className="mt-1 text-[13px] leading-snug text-ink-2">
                  Choose the athlete this edition belongs to.
                </p>
                <div className="mt-4">
                  <Select
                    value={selectedAthleteId}
                    onValueChange={setSelectedAthleteId}
                  >
                    <SelectTrigger className="w-full md:w-[420px]">
                      <SelectValue placeholder="Select an athlete…" />
                    </SelectTrigger>
                    <SelectContent>
                      {(athletes ?? []).map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.firstName} {a.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>
            ) : null}

            {/* ─── Prefill from source (AI) ─── */}
            <section className="rounded-sm border border-line bg-cream-2">
              <button
                type="button"
                onClick={() => setImportOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <div className="min-w-0">
                  <div className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                    Prefill from source
                  </div>
                  <p className="mt-1 text-[13px] leading-snug text-ink-2">
                    Generate a draft from any source material (HTML, brief,
                    transcript). Media URLs are skipped — re-upload after.
                  </p>
                </div>
                <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-ink-3">
                  {importOpen ? "Hide" : "Open"}
                </span>
              </button>
              {importOpen ? (
                <div className="space-y-3 border-t border-line px-6 py-5">
                  <textarea
                    value={aiInput}
                    onChange={(e) => {
                      setAiInput(e.target.value);
                      if (importError) setImportError(null);
                    }}
                    placeholder="Paste anything — past newsletter HTML, a written brief, a voice transcript, post-match notes…"
                    className="h-48 w-full resize-y rounded-sm border border-line bg-cream px-3 py-2 font-sans text-[12px] leading-relaxed text-ink-1 placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-accent-gold"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCopyClaudePrompt}
                      title="Copy the system prompt to install in your Claude.ai Project. Once installed, paste raw material in any conversation in that project and Claude returns a brief you can paste back here."
                    >
                      Copy Claude system prompt
                    </Button>
                    <Button
                      type="button"
                      onClick={handleGenerate}
                      disabled={generate.isPending}
                    >
                      {generate.isPending ? "Generating…" : "Generate draft"}
                    </Button>
                  </div>

                  {importError ? (
                    <div
                      role="alert"
                      className="rounded-sm border border-red-300 bg-red-50 px-3 py-2 font-sans text-[11px] leading-relaxed text-red-700"
                    >
                      <div className="font-medium uppercase tracking-[0.18em]">
                        Could not prefill
                      </div>
                      <div className="mt-1 whitespace-pre-wrap break-words">
                        {importError}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>

            {/* ─── Edition card ─── */}
            <section
              id="edition"
              className="scroll-mt-8 rounded-sm border border-line bg-cream-2"
            >
              <header className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 border-b border-line px-6 py-5 md:gap-x-7">
                <div className="font-sans text-[26px] font-semibold leading-none tracking-tight text-accent-gold">
                  00
                </div>
                <div className="min-w-0">
                  <div className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                    Edition
                  </div>
                  <p className="mt-1 text-[15px] leading-snug text-ink-2">
                    The basics of this issue — what it&apos;s called, when it
                    ships, the cover image, and the edition mode.
                  </p>
                </div>
              </header>
              <div className="space-y-6 px-6 py-6">
                <FormField
                  control={form.control}
                  name="editionMode"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-4">
                        <FormLabel className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                          Edition mode
                        </FormLabel>
                        <FormControl>
                          <div
                            role="radiogroup"
                            aria-label="Edition mode"
                            className="inline-flex overflow-hidden rounded-xs border border-line bg-cream"
                          >
                            {(["TOURNAMENT", "WEEKLY"] as const).map((opt) => {
                              const active = field.value === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  role="radio"
                                  aria-checked={active}
                                  onClick={() => field.onChange(opt)}
                                  className={[
                                    "min-h-11 px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.18em] transition-colors",
                                    active
                                      ? "bg-ink text-cream"
                                      : "text-ink-3 hover:bg-cream-3 hover:text-ink",
                                  ].join(" ")}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </FormControl>
                      </div>
                      <p className="text-[11px] text-ink-3">
                        TOURNAMENT enables match cards, hero metrics, and the
                        tournament summary. WEEKLY enables training, recovery,
                        social and media recap blocks. The Week Recap section
                        adapts to the chosen mode.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="heroImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                        Cover image
                      </FormLabel>
                      <FormControl>
                        <HeroUploader
                          value={field.value ?? null}
                          onChange={(url) => field.onChange(url || undefined)}
                          emptyTitle="Issue cover"
                          emptyHelp="Click or drop · 16:9 · used on web + email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                        Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Monte-Carlo: into the quarters"
                        />
                      </FormControl>
                      <p className="text-[11px] text-ink-3">
                        Used as the web title and as the default email
                        subject. To personalize the subject with the
                        fan&apos;s first name, fill in <strong>Email
                        subject</strong> below.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailSubject"
                  render={({ field }) => {
                    function insertMergeTag(tag: string) {
                      const el = emailSubjectInputRef.current;
                      const current = field.value ?? "";
                      // No DOM ref yet (shouldn't happen post-mount) — append at end.
                      if (!el) {
                        form.setValue("emailSubject", `${current}${tag}`, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        return;
                      }
                      const start = el.selectionStart ?? current.length;
                      const end = el.selectionEnd ?? current.length;
                      const next = `${current.slice(0, start)}${tag}${current.slice(end)}`;
                      form.setValue("emailSubject", next, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      // Place cursor right after the inserted tag on next tick,
                      // once RHF has flushed the new value into the DOM.
                      requestAnimationFrame(() => {
                        const cursor = start + tag.length;
                        el.focus();
                        el.setSelectionRange(cursor, cursor);
                      });
                    }
                    return (
                      <FormItem>
                        <FormLabel className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                          Email subject
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            ref={(el) => {
                              field.ref(el);
                              emailSubjectInputRef.current = el;
                            }}
                            value={field.value ?? ""}
                            placeholder={'{{ contact.FIRSTNAME | default: "Hey" }}, voici ma dernière newsletter'}
                          />
                        </FormControl>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-ink-3">
                            Insert:
                          </span>
                          {EMAIL_SUBJECT_MERGE_TAGS.map((tag) => (
                            <button
                              key={tag.value}
                              type="button"
                              onClick={() => insertMergeTag(tag.value)}
                              className="rounded-full border border-line bg-cream-2 px-2.5 py-0.5 text-[11px] text-ink transition-colors hover:bg-cream hover:border-ink-3"
                            >
                              + {tag.label}
                            </button>
                          ))}
                        </div>
                        <p className="text-[11px] text-ink-3">
                          Optional. Overrides the email subject only; the
                          web title is unchanged. Brevo replaces merge
                          tags with each fan&apos;s data at send time.
                        </p>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

              </div>
            </section>

            {/* ─── Tournament card (TOURNAMENT mode only) ─── */}
            {editionMode === "TOURNAMENT" ? (
            <section
              id="tournament"
              className="scroll-mt-8 rounded-sm border border-line bg-cream-2"
            >
              <header className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 border-b border-line px-6 py-5 md:gap-x-7">
                <div className="font-sans text-[26px] font-semibold leading-none tracking-tight text-accent-gold">
                  ◇
                </div>
                <div className="min-w-0">
                  <div className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                    Tournament
                  </div>
                  <p className="mt-1 text-[15px] leading-snug text-ink-2">
                    Context for the week. Required when this is a TOURNAMENT
                    edition; optional for WEEKLY editions.
                  </p>
                </div>
              </header>
              <div className="space-y-6 px-6 py-6">
                <FormField
                  control={form.control}
                  name="tournamentLogoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <CompactImageField
                          label="Tournament mark"
                          help="A small square logo or wordmark. Optional."
                          aspect="square"
                          height={80}
                          value={field.value ?? null}
                          onChange={(url) => field.onChange(url || undefined)}
                          onClear={() => field.onChange(undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tournamentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                        Tournament
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Rolex Monte-Carlo Masters"
                        />
                      </FormControl>
                      <p className="text-[11px] text-ink-3">
                        Drives the &ldquo;My week at {"{tournament}"}&rdquo;
                        line and the per-section titles.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="tournamentCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                          Category
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="ATP Masters 1000"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tournamentLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                          Location
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Monte Carlo, Monaco"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tournamentSurface"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                          Surface
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Clay"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="tournamentStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                            Starts
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              name={field.name}
                              ref={field.ref}
                              onBlur={field.onBlur}
                              value={
                                typeof field.value === "string"
                                  ? field.value
                                  : field.value instanceof Date
                                    ? field.value.toISOString().slice(0, 10)
                                    : ""
                              }
                              onChange={(e) =>
                                field.onChange(e.target.value || undefined)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tournamentEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                            Ends
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              name={field.name}
                              ref={field.ref}
                              onBlur={field.onBlur}
                              value={
                                typeof field.value === "string"
                                  ? field.value
                                  : field.value instanceof Date
                                    ? field.value.toISOString().slice(0, 10)
                                    : ""
                              }
                              onChange={(e) =>
                                field.onChange(e.target.value || undefined)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="worldRankSnapshot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                          World rank at this edition
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            value={
                              typeof field.value === "number" ? field.value : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="countryRankSnapshot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-ink-3">
                          Country rank at this edition
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            value={
                              typeof field.value === "number" ? field.value : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </section>
            ) : null}

            {/* ─── The 5 fixed sections ─── */}
            {SECTION_ORDER.map((type, idx) => {
              const number = (idx + 1).toString().padStart(2, "0");
              // No titleTemplate currently consumes the tournament name
              // (only `tournamentLabelTemplate` does). Passing null
              // avoids re-rendering all 5 section editors on every
              // tournamentName keystroke. Re-subscribe via useWatch if
              // a future titleTemplate interpolates `{tournament}`.
              const placeholder =
                getSectionTitle(type, null, DEFAULT_LOCALE) ?? "";
              const eyebrowPlaceholder =
                getNewsletterLabels(DEFAULT_LOCALE).sections[type].eyebrow;
              return (
                <SectionCard
                  key={type}
                  id={SECTION_ANCHORS[type]}
                  number={number}
                  name={SECTION_LABELS[type]}
                  description={SECTION_DESCRIPTIONS[type]}
                  eyebrow={sectionEyebrows[type]}
                  eyebrowPlaceholder={eyebrowPlaceholder}
                  onEyebrowChange={(value) =>
                    setSectionEyebrows((prev) => ({ ...prev, [type]: value }))
                  }
                  title={sectionTitles[type]}
                  titlePlaceholder={placeholder}
                  onTitleChange={(value) =>
                    setSectionTitles((prev) => ({ ...prev, [type]: value }))
                  }
                >
                  {type === "ATHLETE_REVIEW" ? (
                    <AthleteReviewFields
                      blocks={sections[type] as AthleteReviewBlock[]}
                      onChange={(next) => setSectionBlocks(type, next)}
                    />
                  ) : null}
                  {type === "WEEK_RECAP" ? (
                    <WeekRecapFields
                      blocks={
                        sections[type] as Array<
                          WeekRecapTournamentBlock | WeekRecapWeeklyBlock
                        >
                      }
                      editionMode={editionMode}
                      onChange={(next) => setSectionBlocks(type, next)}
                    />
                  ) : null}
                  {type === "COMING_UP" ? (
                    <ComingUpFields
                      blocks={sections[type] as ComingUpBlock[]}
                      onChange={(next) => setSectionBlocks(type, next)}
                    />
                  ) : null}
                  {type === "MONETISATION" ? (
                    <MonetisationFields
                      blocks={sections[type] as MonetisationBlock[]}
                      onChange={(next) => setSectionBlocks(type, next)}
                    />
                  ) : null}
                  {type === "FAN_ENGAGEMENT" ? (
                    <FanEngagementFields
                      blocks={sections[type] as FanEngagementBlock[]}
                      onChange={(next) => setSectionBlocks(type, next)}
                    />
                  ) : null}
                </SectionCard>
              );
            })}
          </div>
        </div>

        {/* ── Sticky action bar ──────────────────────────────────────── */}
        <div
          className={cn(
            "sticky bottom-0 -mx-4 mt-6 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur",
            "md:-mx-6 md:px-6",
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="hidden font-sans text-[10px] uppercase tracking-[0.22em] text-ink-3 md:block">
              {isEdit ? "Editing draft" : "New edition"} · {editionMode} ·{" "}
              {SECTION_ORDER.length} sections
            </p>
            <div className="flex flex-1 items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handlePreview}
                disabled={!canPreview}
              >
                Preview
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleOpenTestDialog}
                disabled={!canPreview}
              >
                Send test
              </Button>
              <Button type="submit" disabled={isPending}>
                {submitLabel}
              </Button>
            </div>
          </div>
        </div>
      </form>
      <Dialog
        open={pendingImport !== null}
        onOpenChange={(open) => {
          if (!open) setPendingImport(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace every field?</DialogTitle>
            <DialogDescription>
              This wipes the current header and all section blocks with the
              imported JSON. Any unsaved edits will be lost. Media URLs must be
              re-uploaded after import.
              {pendingImport && pendingImport.warnings.length > 0 ? (
                <span className="mt-2 block text-amber-700">
                  {pendingImport.warnings.length} warning
                  {pendingImport.warnings.length === 1 ? "" : "s"} during parse
                  — see browser console after import.
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPendingImport(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (pendingImport) applyImport(pendingImport);
                setPendingImport(null);
              }}
            >
              Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send test email</DialogTitle>
            <DialogDescription>
              Sends the current draft to one address via Brevo so you can
              preview it the way fans will see it. Subject is prefixed with
              [TEST].
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm" htmlFor="test-email-input">
              Recipient email
            </label>
            <Input
              id="test-email-input"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTestDialogOpen(false)}
              disabled={testSend.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendTest}
              disabled={testSend.isPending}
            >
              {testSend.isPending ? "Sending…" : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
