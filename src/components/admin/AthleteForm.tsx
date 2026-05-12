"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import slugify from "slugify";
import type { Athlete, Sponsor } from "@prisma/client";
import {
  createAthleteSchema,
  type CreateAthleteInput,
} from "@/lib/schemas/athlete";
import useApi from "@/lib/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import AvatarUploader from "@/components/admin/AvatarUploader";
import HeroUploader from "@/components/admin/HeroUploader";
import SectionCard from "@/components/admin/sections/SectionCard";
import SponsorRow from "@/components/admin/sections/SponsorRow";
import { COUNTRIES } from "@/lib/data/countries";
import { cn } from "@/lib/utils";

const SOCIAL_FIELDS = [
  { key: "instagram", label: "Instagram" },
  { key: "x", label: "X / Twitter" },
  { key: "tiktok", label: "TikTok" },
  { key: "facebook", label: "Facebook" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "foundation", label: "Foundation" },
] as const;

function toSlug(value: string): string {
  return slugify(value, { lower: true, strict: true, locale: "en" });
}

// Maps form field names to the section anchor that should scroll into view
// when a validation error fires. Mirrors NewsletterForm's SECTION_ANCHORS pattern.
const FIELD_TO_ANCHOR: Record<string, string> = {
  coverImageUrl: "identity",
  avatarUrl: "identity",
  firstName: "identity",
  lastName: "identity",
  slug: "identity",
  sport: "identity",
  tour: "identity",
  countryCode: "identity",
  bio: "profile",
  worldRank: "profile",
  countryRank: "profile",
  titlesCount: "profile",
  sponsors: "sponsors",
  socialLinks: "social",
};

function firstErrorKey(errors: FieldErrors): string | undefined {
  for (const key of Object.keys(errors)) {
    if (errors[key]) return key;
  }
  return undefined;
}

interface AthleteFormProps {
  initialData?: Athlete;
  initialSponsors?: Sponsor[];
  mode: "create" | "edit";
}

type FormValues = CreateAthleteInput;

function toFormValues(
  athlete?: Athlete,
  sponsors?: Sponsor[],
): Partial<FormValues> {
  const sponsorValues = (sponsors ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    logoUrl: s.logoUrl,
    websiteUrl: s.websiteUrl,
  }));

  if (!athlete) {
    return {
      sport: "TENNIS",
      titlesCount: 0,
      socialLinks: {},
      sponsors: [],
    };
  }
  const social =
    athlete.socialLinks &&
    typeof athlete.socialLinks === "object" &&
    !Array.isArray(athlete.socialLinks)
      ? (athlete.socialLinks as Record<string, string | undefined>)
      : {};
  return {
    slug: athlete.slug,
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    sport: athlete.sport,
    tour: athlete.tour ?? undefined,
    countryCode: athlete.countryCode,
    bio: athlete.bio ?? undefined,
    avatarUrl: athlete.avatarUrl ?? undefined,
    coverImageUrl: athlete.coverImageUrl ?? undefined,
    worldRank: athlete.worldRank ?? undefined,
    countryRank: athlete.countryRank ?? undefined,
    titlesCount: athlete.titlesCount,
    socialLinks: {
      instagram: social.instagram,
      x: social.x,
      tiktok: social.tiktok,
      facebook: social.facebook,
      linkedin: social.linkedin,
      foundation: social.foundation,
    },
    sponsors: sponsorValues,
  };
}

export default function AthleteForm({
  initialData,
  initialSponsors,
  mode,
}: AthleteFormProps) {
  const router = useRouter();
  const { usePost, usePut } = useApi();
  const isEdit = mode === "edit";

  const form = useForm<FormValues>({
    resolver: zodResolver(createAthleteSchema),
    defaultValues: toFormValues(initialData, initialSponsors),
  });

  const sponsors = useFieldArray({
    control: form.control,
    name: "sponsors",
    keyName: "_arrayKey",
  });

  const firstName =
    useWatch({ control: form.control, name: "firstName" }) ?? "";
  const lastName =
    useWatch({ control: form.control, name: "lastName" }) ?? "";
  const slugManuallyEdited = useRef(isEdit);

  useEffect(() => {
    if (slugManuallyEdited.current) return;
    const next = toSlug(`${firstName} ${lastName}`.trim());
    form.setValue("slug", next, { shouldValidate: !!next });
  }, [firstName, lastName, form]);

  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`;

  const create = usePost("/admin/athletes", {
    onSuccess: (data: Athlete) => {
      toast.success("Athlete created");
      router.push(`/admin/athletes/${data.id}`);
      router.refresh();
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error ?? "Failed to create athlete");
    },
  });

  const update = usePut(`/admin/athletes/${initialData?.id ?? ""}`, {
    onSuccess: () => {
      toast.success("Athlete updated");
      router.refresh();
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error ?? "Failed to update athlete");
    },
  });

  const isPending = create.isPending || update.isPending;

  function onSubmit(values: FormValues) {
    if (isEdit) {
      update.mutate(values);
    } else {
      create.mutate(values);
    }
  }

  function onInvalid(errors: FieldErrors<FormValues>) {
    const key = firstErrorKey(errors);
    if (!key) return;
    const anchor = FIELD_TO_ANCHOR[key];
    if (anchor && typeof document !== "undefined") {
      document
        .getElementById(anchor)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Focus the first invalid field after the scroll kicks off.
    setTimeout(() => {
      try {
        form.setFocus(key as Parameters<typeof form.setFocus>[0]);
      } catch {
        // setFocus throws for nested array fields without a ref — non-fatal.
      }
    }, 50);
    toast.error("Please fix the highlighted fields");
  }

  const submitLabel = useMemo(() => {
    if (isPending) return "Saving…";
    return isEdit ? "Save changes" : "Create athlete";
  }, [isEdit, isPending]);

  const sponsorCount = sponsors.fields.length;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="relative"
      >
        <div className="space-y-8 pb-32">
          {/* ─── 00 · Identity ─── */}
          <SectionCard
            id="identity"
            number="00"
            name="Identity"
            description="Who the athlete is — the surface a fan recognizes before anything else."
          >
            <div className="relative pb-[80px] md:pb-[100px]">
              <FormField
                control={form.control}
                name="coverImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <HeroUploader
                        value={field.value}
                        onChange={(url) => field.onChange(url || undefined)}
                        emptyTitle="Profile cover"
                        emptyHelp="Click or drop · 21:9 · shown on the profile when no newsletter"
                        aspectClassName="aspect-[16/10] md:aspect-[21/9]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-0">
                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <AvatarUploader
                          value={field.value}
                          onChange={(url) => field.onChange(url || undefined)}
                          initials={initials}
                          sizeClassName="h-[160px] w-[160px] md:h-[200px] md:w-[200px]"
                          monogramClassName="text-[56px] md:text-[72px]"
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
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                      First name
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                      Last name
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                    URL slug
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        slugManuallyEdited.current = true;
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <p className="text-[11px] text-ink-3">
                    Lives at <span className="font-mono">/{field.value || "your-slug"}</span>. Auto-generated from the name until you edit it.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="sport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                      Sport
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? "TENNIS"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TENNIS">Tennis</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                      Tour
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ATP / WTA"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                      Country
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[min(300px,60vh)]">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SectionCard>

          {/* ─── 01 · Profile ─── */}
          <SectionCard
            id="profile"
            number="01"
            name="Profile"
            description="The story behind the name — bio, current standing, career titles."
          >
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                    Bio
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <p className="text-[11px] text-ink-3">
                    A short editorial paragraph — shown on the athlete hub and in the newsletter footer.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="worldRank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                      World rank
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
                name="countryRank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                      Country rank
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
                name="titlesCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                      Career titles
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={typeof field.value === "number" ? field.value : 0}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SectionCard>

          {/* ─── 02 · Sponsors ─── */}
          <SectionCard
            id="sponsors"
            number="02"
            name="Sponsors"
            description="The brands attached to the athlete. Drag-free reorder with the arrows — order shown on the hub follows this list."
          >
            {sponsors.fields.length === 0 ? (
              <div className="rounded-sm border border-dashed border-line bg-cream px-6 py-10 text-center">
                <p className="font-serif text-[15px] italic text-ink-2">
                  No sponsors yet — add the first one below.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sponsors.fields.map((field, index) => (
                  <SponsorRow
                    key={field._arrayKey}
                    index={index}
                    onRemove={() => sponsors.remove(index)}
                    onMoveUp={() => sponsors.move(index, index - 1)}
                    onMoveDown={() => sponsors.move(index, index + 1)}
                    canMoveUp={index > 0}
                    canMoveDown={index < sponsors.fields.length - 1}
                  />
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                sponsors.append({ name: "", logoUrl: "", websiteUrl: "" })
              }
            >
              + Add sponsor
            </Button>
          </SectionCard>

          {/* ─── 03 · Social ─── */}
          <SectionCard
            id="social"
            number="03"
            name="Social"
            description="Public-facing links. Surfaced on the athlete hub and in newsletter footers."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {SOCIAL_FIELDS.map((social) => (
                <FormField
                  key={social.key}
                  control={form.control}
                  name={`socialLinks.${social.key}` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                        {social.label}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </SectionCard>
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
              {isEdit ? "Editing athlete" : "New athlete"} ·{" "}
              {sponsorCount} {sponsorCount === 1 ? "sponsor" : "sponsors"}
            </p>
            <div className="flex flex-1 items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/admin/athletes")}
              >
                {isEdit ? "Back to athletes" : "Cancel"}
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
