"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  useWatch,
  type Control,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import slugify from "slugify";
import type { DebriefSection, Newsletter } from "@prisma/client";
import {
  createNewsletterSchema,
  updateNewsletterSchema,
  type CreateNewsletterInput,
  type UpdateNewsletterInput,
} from "@/lib/schemas/newsletter";
import useApi from "@/lib/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import HeroUploader from "@/components/admin/HeroUploader";
import AudioUploader from "@/components/admin/AudioUploader";

type NewsletterWithDebrief = Newsletter & {
  debriefSection: DebriefSection | null;
};

interface NewsletterFormProps {
  athleteId: string;
  initialData?: NewsletterWithDebrief;
  mode: "create" | "edit";
}

type CreateValues = CreateNewsletterInput;
type EditValues = UpdateNewsletterInput;

type DebriefValues = NonNullable<CreateValues["debrief"]>;

function toSlug(value: string): string {
  return slugify(value, { lower: true, strict: true, locale: "en" });
}

function emptyDebrief(): DebriefValues {
  return {
    body: "",
    pullQuote: undefined,
    pullQuoteContext: undefined,
    voiceNoteUrl: undefined,
    voiceNoteDurationSec: undefined,
    voiceNoteLabel: undefined,
    voiceNoteLocation: undefined,
  };
}

function debriefFromInitial(
  section: DebriefSection | null | undefined,
): DebriefValues {
  if (!section) return emptyDebrief();
  return {
    body: section.body,
    pullQuote: section.pullQuote ?? undefined,
    pullQuoteContext: section.pullQuoteContext ?? undefined,
    voiceNoteUrl: section.voiceNoteUrl ?? undefined,
    voiceNoteDurationSec: section.voiceNoteDurationSec ?? undefined,
    voiceNoteLabel: section.voiceNoteLabel ?? undefined,
    voiceNoteLocation: section.voiceNoteLocation ?? undefined,
  };
}

export default function NewsletterForm({
  athleteId,
  initialData,
  mode,
}: NewsletterFormProps) {
  const router = useRouter();
  const { usePost, usePut } = useApi();

  const isEdit = mode === "edit";

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createNewsletterSchema),
    defaultValues: {
      athleteId,
      title: "",
      slug: "",
      heroImageUrl: undefined,
      debrief: emptyDebrief(),
    },
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(updateNewsletterSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      heroImageUrl: initialData?.heroImageUrl ?? undefined,
      debrief: debriefFromInitial(initialData?.debriefSection),
    },
  });

  const createTitle =
    useWatch({ control: createForm.control, name: "title" }) ?? "";

  useEffect(() => {
    if (isEdit) return;
    createForm.setValue("slug", toSlug(createTitle), {
      shouldValidate: !!createTitle,
    });
  }, [createTitle, isEdit, createForm]);

  const create = usePost("/admin/newsletters", {
    onSuccess: (data: Newsletter) => {
      toast.success("Newsletter created");
      router.push(`/admin/athletes/${athleteId}/newsletters/${data.id}`);
      router.refresh();
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error ?? "Failed to create newsletter");
    },
  });

  const update = usePut(`/admin/newsletters/${initialData?.id ?? ""}`, {
    onSuccess: () => {
      toast.success("Newsletter updated");
      router.refresh();
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error ?? "Failed to update newsletter");
    },
  });

  const isPending = create.isPending || update.isPending;

  if (!isEdit) {
    return (
      <Form {...createForm}>
        <form
          onSubmit={createForm.handleSubmit((values) => create.mutate(values))}
          className="space-y-10"
        >
          <FormField
            control={createForm.control}
            name="heroImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <HeroUploader
                    value={field.value ?? null}
                    onChange={(url) => field.onChange(url || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={createForm.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DebriefFields
            control={createForm.control as unknown as Control<DebriefHostValues>}
            form={createForm as unknown as UseFormReturn<DebriefHostValues>}
          />
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/admin/athletes/${athleteId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Create newsletter"}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form {...editForm}>
      <form
        onSubmit={editForm.handleSubmit((values) => update.mutate(values))}
        className="space-y-10"
      >
        <FormField
          control={editForm.control}
          name="heroImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <HeroUploader
                  value={field.value ?? null}
                  onChange={(url) => field.onChange(url || undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={editForm.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DebriefFields
          control={editForm.control as unknown as Control<DebriefHostValues>}
          form={editForm as unknown as UseFormReturn<DebriefHostValues>}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

type DebriefHostValues = { debrief: DebriefValues };

interface DebriefFieldsProps {
  control: Control<DebriefHostValues>;
  form: UseFormReturn<DebriefHostValues>;
}

function DebriefFields({ control, form }: DebriefFieldsProps) {
  return (
    <section className="space-y-6 rounded-2xl border border-line bg-cream p-6">
      <header>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-gold">
          Section · Debrief
        </p>
        <h2 className="mt-1 font-serif text-[22px] font-semibold text-ink">
          The athlete&apos;s take
        </h2>
      </header>

      <FormField
        control={control}
        name="debrief.body"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Body</FormLabel>
            <FormControl>
              <Textarea rows={12} {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>
              Use blank lines to separate paragraphs.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="debrief.pullQuote"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pull quote (optional)</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="debrief.pullQuoteContext"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pull quote context (optional)</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="e.g. Between sets — Monte Carlo, R3"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4 rounded-xl border border-line bg-cream-2 p-5">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-3">
          Voice note (optional)
        </p>

        <FormField
          control={control}
          name="debrief.voiceNoteUrl"
          render={({ field }) => {
            const duration = form.getValues("debrief.voiceNoteDurationSec");
            return (
              <FormItem>
                <FormControl>
                  <AudioUploader
                    url={field.value ?? null}
                    durationSec={duration ?? null}
                    onChange={({ url, durationSec }) => {
                      field.onChange(url);
                      form.setValue(
                        "debrief.voiceNoteDurationSec",
                        durationSec ?? undefined,
                        { shouldDirty: true },
                      );
                    }}
                    onClear={() => {
                      field.onChange(undefined);
                      form.setValue(
                        "debrief.voiceNoteDurationSec",
                        undefined,
                        { shouldDirty: true },
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="debrief.voiceNoteLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Voice note"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="debrief.voiceNoteLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Locker room · Monte Carlo"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </section>
  );
}
