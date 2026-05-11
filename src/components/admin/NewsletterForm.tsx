"use client";

import { useEffect, useMemo, useState } from "react";
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
import DebriefFields from "@/components/admin/sections/DebriefFields";
import ResultsFields from "@/components/admin/sections/ResultsFields";
import WhatsNextFields from "@/components/admin/sections/WhatsNextFields";
import KitFields from "@/components/admin/sections/KitFields";
import EngagementFields from "@/components/admin/sections/EngagementFields";
import {
  validateSectionDraft,
  type SectionDraft,
} from "@/components/admin/sections/SectionEditor";
import {
  SECTION_DESCRIPTIONS,
  SECTION_LABELS,
  SECTION_ORDER,
  emptyContentFor,
} from "@/components/admin/sections/sectionDefaults";
import {
  isSectionMeaningful,
  type DebriefContent,
  type EngagementContent,
  type KitContent,
  type ResultsContent,
  type SectionTypeValue,
  type WhatsNextContent,
} from "@/lib/schemas/newsletterSection";
import {
  NEWSLETTER_JSON_EXAMPLE,
  parseNewsletterImport,
} from "@/lib/newsletter/importJson";
import { toSlug } from "@/lib/newsletter/slug";
import { cn } from "@/lib/utils";

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
type SectionDraftMap = Record<SectionTypeValue, SectionDraft>;

// Anchor ids used to scroll the offending section into view on validation errors.
const SECTION_ANCHORS: Record<SectionTypeValue, string> = {
  DEBRIEF: "debrief",
  RESULTS: "results",
  WHATS_NEXT: "whats-next",
  KIT: "kit",
  ENGAGEMENT: "engagement",
};

function toDateInput(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

// Build the 5-section draft map, falling back to type-defaults for any
// section the database hasn't seen yet. This is what lets the form
// always render a fixed 5-card shape, regardless of legacy data.
function buildSectionMap(
  initial: NewsletterSection[] | undefined,
): SectionDraftMap {
  const byType = new Map<SectionTypeValue, NewsletterSection>();
  for (const s of initial ?? []) {
    const t = s.type as SectionTypeValue;
    if (!byType.has(t)) byType.set(t, s);
  }
  const map = {} as SectionDraftMap;
  for (const type of SECTION_ORDER) {
    const found = byType.get(type);
    map[type] = {
      type,
      content: found ? (found.content as unknown) : emptyContentFor(type),
    };
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
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    athleteId ?? "",
  );

  const form = useForm<HeaderValues>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      heroImageUrl: initialData?.heroImageUrl ?? undefined,
      editionNumber: initialData?.editionNumber ?? 1,
      editionDate: toDateInput(initialData?.editionDate),
      tournamentName: initialData?.tournamentName ?? undefined,
      tournamentLogoUrl: initialData?.tournamentLogoUrl ?? undefined,
      tournamentContext: initialData?.tournamentContext ?? undefined,
      worldRankSnapshot: initialData?.worldRankSnapshot ?? undefined,
      countryRankSnapshot: initialData?.countryRankSnapshot ?? undefined,
    },
  });

  const [sections, setSections] = useState<SectionDraftMap>(() =>
    buildSectionMap(initialData?.sections),
  );

  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [showSchema, setShowSchema] = useState(false);

  function handleImport() {
    const raw = importText.trim();
    if (!raw) {
      setImportError("Paste a JSON payload first");
      return;
    }
    let parsed;
    try {
      parsed = parseNewsletterImport(raw);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not parse JSON";
      setImportError(message);
      return;
    }
    // Replacing existing content is destructive — confirm if there's
    // anything meaningful to lose. In create mode an untouched form is
    // safe to overwrite without asking.
    const hasMeaningfulSections = SECTION_ORDER.some((type) =>
      isSectionMeaningful(type, sections[type].content),
    );
    const needsConfirm =
      isEdit || form.formState.isDirty || hasMeaningfulSections;
    if (
      needsConfirm &&
      typeof window !== "undefined" &&
      !window.confirm(
        "Replace every field with this JSON? Any unsaved edits will be lost.",
      )
    ) {
      return;
    }
    form.reset(parsed.header);
    const nextSections = {} as SectionDraftMap;
    for (const type of SECTION_ORDER) {
      nextSections[type] = { type, content: parsed.sections[type] };
    }
    setSections(nextSections);
    setImportError(null);
    toast.success("Prefilled — review fields and re-upload any media");
    setImportOpen(false);
  }

  const titleValue = useWatch({ control: form.control, name: "title" }) ?? "";

  useEffect(() => {
    if (isEdit) return;
    form.setValue("slug", toSlug(titleValue), {
      shouldValidate: !!titleValue,
    });
  }, [titleValue, isEdit, form]);

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
        slug: data.slug,
        heroImageUrl: data.heroImageUrl ?? undefined,
        editionNumber: data.editionNumber,
        editionDate: toDateInput(data.editionDate),
        tournamentName: data.tournamentName ?? undefined,
        tournamentLogoUrl: data.tournamentLogoUrl ?? undefined,
        tournamentContext: data.tournamentContext ?? undefined,
        worldRankSnapshot: data.worldRankSnapshot ?? undefined,
        countryRankSnapshot: data.countryRankSnapshot ?? undefined,
      });
      setSections(buildSectionMap(data.sections));
      router.refresh();
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error ?? "Failed to save newsletter");
    },
  });

  const isPending = create.isPending || update.isPending;

  function setSectionContent(type: SectionTypeValue, content: unknown) {
    setSections((prev) => ({ ...prev, [type]: { ...prev[type], content } }));
  }

  function onSubmit(values: HeaderValues) {
    const ordered: Array<{
      type: SectionTypeValue;
      content: unknown;
    }> = [];
    for (const type of SECTION_ORDER) {
      const draft = sections[type];
      const result = validateSectionDraft(draft);
      if (!result.ok) {
        toast.error(`${SECTION_LABELS[type]}: ${result.message}`);
        // Scroll to the offending section so the editor can fix it.
        if (typeof document !== "undefined") {
          document
            .getElementById(SECTION_ANCHORS[type])
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }
      ordered.push({
        type,
        content: result.content,
      });
    }
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
        <div>
          <div className="space-y-8 pb-32">
            {!isEdit ? (
              <section className="rounded-sm border border-line bg-cream-2 px-6 py-5">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                  Athlete
                </div>
                <p className="mt-1 font-serif text-[13px] italic leading-snug text-ink-2">
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

            {/* ─── Import from JSON ─── */}
            <section className="rounded-sm border border-line bg-cream-2">
              <button
                type="button"
                onClick={() => setImportOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <div className="min-w-0">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                    Import from JSON
                  </div>
                  <p className="mt-1 font-serif text-[13px] italic leading-snug text-ink-2">
                    Paste an LLM-generated payload to prefill every field at
                    once. Media URLs are skipped — re-upload after.
                  </p>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
                  {importOpen ? "Hide" : "Open"}
                </span>
              </button>
              {importOpen ? (
                <div className="space-y-3 border-t border-line px-6 py-5">
                  <textarea
                    value={importText}
                    onChange={(e) => {
                      setImportText(e.target.value);
                      if (importError) setImportError(null);
                    }}
                    placeholder='{"title": "...", "sections": { "DEBRIEF": {...} }}'
                    className="h-48 w-full resize-y rounded-sm border border-line bg-cream px-3 py-2 font-mono text-[12px] leading-relaxed text-ink-1 placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-accent-gold"
                  />
                  {importError ? (
                    <div
                      role="alert"
                      className="rounded-sm border border-red-300 bg-red-50 px-3 py-2 font-mono text-[11px] leading-relaxed text-red-700"
                    >
                      <div className="font-semibold uppercase tracking-[0.18em]">
                        Could not parse
                      </div>
                      <div className="mt-1 whitespace-pre-wrap break-words">
                        {importError}
                      </div>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" onClick={handleImport}>
                      Prefill form
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowSchema((v) => !v)}
                    >
                      {showSchema ? "Hide example" : "Show example"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(NEWSLETTER_JSON_EXAMPLE)
                          .then(() => toast.success("Example copied"))
                          .catch(() => toast.error("Copy failed"));
                      }}
                    >
                      Copy example
                    </Button>
                  </div>
                  {showSchema ? (
                    <pre className="max-h-72 overflow-auto rounded-sm border border-line bg-cream px-3 py-2 font-mono text-[11px] leading-relaxed text-ink-2">
                      {NEWSLETTER_JSON_EXAMPLE}
                    </pre>
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
                <div className="font-mono text-[26px] font-semibold leading-none tracking-tight text-accent-gold">
                  00
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                    Edition
                  </div>
                  <p className="mt-1 font-serif text-[15px] italic leading-snug text-ink-2">
                    The basics of this issue — what it&apos;s called, when it ships,
                    and the cover image.
                  </p>
                </div>
              </header>
              <div className="space-y-6 px-6 py-6">
                <FormField
                  control={form.control}
                  name="heroImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
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
                      <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                        Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Roland-Garros: the long way in"
                        />
                      </FormControl>
                      <p className="text-[11px] text-ink-3">
                        Used as the email subject line and the issue&apos;s
                        display title on the web.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr_1fr]">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                          URL slug
                        </FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="editionNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                          Issue #
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
                    name="editionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                          Date
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
            </section>

            {/* ─── Tournament card ─── */}
            <section
              id="tournament"
              className="scroll-mt-8 rounded-sm border border-line bg-cream-2"
            >
              <header className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 border-b border-line px-6 py-5 md:gap-x-7">
                <div className="font-mono text-[26px] font-semibold leading-none tracking-tight text-accent-gold">
                  ◇
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                    Tournament
                  </div>
                  <p className="mt-1 font-serif text-[15px] italic leading-snug text-ink-2">
                    Context for the week — the event, how it&apos;s framed, and
                    where the athlete stood going in.
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
                      <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                        Tournament
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Roland-Garros"
                        />
                      </FormControl>
                      <p className="text-[11px] text-ink-3">
                        Drives the &ldquo;My week in {"{tournament}"}&rdquo; line and the per-section titles.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tournamentContext"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                        Context line
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Runner-up · Round of 16 · First time on clay this year"
                        />
                      </FormControl>
                      <p className="text-[11px] text-ink-3">
                        One short editorial line — the headline framing for the
                        week.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="worldRankSnapshot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
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
                        <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
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

            {/* ─── The 5 fixed sections ─── */}
            {SECTION_ORDER.map((type, idx) => {
              const number = (idx + 1).toString().padStart(2, "0");
              const draft = sections[type];
              return (
                <SectionCard
                  key={type}
                  id={SECTION_ANCHORS[type]}
                  number={number}
                  name={SECTION_LABELS[type]}
                  description={SECTION_DESCRIPTIONS[type]}
                >
                  {type === "DEBRIEF" ? (
                    <DebriefFields
                      content={draft.content as DebriefContent}
                      onChange={(next) => setSectionContent(type, next)}
                    />
                  ) : null}
                  {type === "RESULTS" ? (
                    <ResultsFields
                      content={draft.content as ResultsContent}
                      onChange={(next) => setSectionContent(type, next)}
                    />
                  ) : null}
                  {type === "WHATS_NEXT" ? (
                    <WhatsNextFields
                      content={draft.content as WhatsNextContent}
                      onChange={(next) => setSectionContent(type, next)}
                    />
                  ) : null}
                  {type === "KIT" ? (
                    <KitFields
                      content={draft.content as KitContent}
                      onChange={(next) => setSectionContent(type, next)}
                    />
                  ) : null}
                  {type === "ENGAGEMENT" ? (
                    <EngagementFields
                      content={draft.content as EngagementContent}
                      onChange={(next) => setSectionContent(type, next)}
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
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3 md:block">
              {isEdit ? "Editing draft" : "New edition"} ·{" "}
              {SECTION_ORDER.length} sections
            </p>
            <div className="flex flex-1 items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/admin/newsletters")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {submitLabel}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
