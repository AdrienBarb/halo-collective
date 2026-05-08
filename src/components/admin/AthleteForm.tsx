"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import slugify from "slugify";
import type { Athlete } from "@prisma/client";
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
import { COUNTRIES } from "@/lib/data/countries";

function toSlug(value: string): string {
  return slugify(value, { lower: true, strict: true, locale: "en" });
}

interface AthleteFormProps {
  initialData?: Athlete;
  mode: "create" | "edit";
}

type FormValues = CreateAthleteInput;

function toFormValues(athlete?: Athlete): Partial<FormValues> {
  if (!athlete) {
    return {
      sport: "TENNIS",
      titlesCount: 0,
    };
  }
  return {
    slug: athlete.slug,
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    sport: athlete.sport,
    tour: athlete.tour ?? undefined,
    countryCode: athlete.countryCode,
    bio: athlete.bio ?? undefined,
    avatarUrl: athlete.avatarUrl ?? undefined,
    worldRank: athlete.worldRank ?? undefined,
    countryRank: athlete.countryRank ?? undefined,
    titlesCount: athlete.titlesCount,
  };
}

export default function AthleteForm({ initialData, mode }: AthleteFormProps) {
  const router = useRouter();
  const { usePost, usePut } = useApi();

  const form = useForm<FormValues>({
    resolver: zodResolver(createAthleteSchema),
    defaultValues: toFormValues(initialData),
  });

  const firstName =
    useWatch({ control: form.control, name: "firstName" }) ?? "";
  const lastName =
    useWatch({ control: form.control, name: "lastName" }) ?? "";
  const slugManuallyEdited = useRef(mode === "edit");

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
    if (mode === "create") {
      create.mutate(values);
    } else {
      update.mutate(values);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormControl>
                <AvatarUploader
                  value={field.value}
                  onChange={(url) => field.onChange(url || undefined)}
                  initials={initials}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
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
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sport</FormLabel>
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
                <FormLabel>Tour</FormLabel>
                <FormControl>
                  <Input placeholder="ATP / WTA" {...field} value={field.value ?? ""} />
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
                <FormLabel>Country</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} value={field.value ?? ""} />
              </FormControl>
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
                <FormLabel>World rank</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={typeof field.value === "number" ? field.value : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : Number(e.target.value),
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
                <FormLabel>Country rank</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={typeof field.value === "number" ? field.value : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : Number(e.target.value),
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
                <FormLabel>Titles</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={
                      typeof field.value === "number" ? field.value : 0
                    }
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

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving…"
              : mode === "create"
                ? "Create athlete"
                : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
