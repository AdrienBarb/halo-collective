"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import slugify from "slugify";
import type { Newsletter } from "@prisma/client";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import HeroUploader from "@/components/admin/HeroUploader";

interface NewsletterFormProps {
  athleteId: string;
  initialData?: Newsletter;
  mode: "create" | "edit";
}

type CreateValues = CreateNewsletterInput;
type EditValues = UpdateNewsletterInput;

function toSlug(value: string): string {
  return slugify(value, { lower: true, strict: true, locale: "en" });
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
      body: "",
      heroImageUrl: undefined,
    },
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(updateNewsletterSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      heroImageUrl: initialData?.heroImageUrl ?? undefined,
      body: initialData?.body ?? "",
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
          className="space-y-8"
        >
          <FormField
            control={createForm.control}
            name="heroImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <HeroUploader
                    value={field.value}
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
          <FormField
            control={createForm.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body</FormLabel>
                <FormControl>
                  <Textarea rows={12} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Create newsletter"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/admin/athletes/${athleteId}`)}
            >
              Cancel
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
        className="space-y-8"
      >
        <FormField
          control={editForm.control}
          name="heroImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <HeroUploader
                  value={field.value}
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
        <FormField
          control={editForm.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body</FormLabel>
              <FormControl>
                <Textarea rows={12} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
