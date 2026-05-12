"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { authClient } from "@/lib/better-auth/auth-client";
import {
  createResetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/schemas/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const buttonClass =
  "w-full cursor-pointer rounded-md bg-accent-warm py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink transition hover:bg-accent-gold disabled:cursor-not-allowed disabled:opacity-60";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [submitting, setSubmitting] = useState(false);
  const t = useTranslations("Auth.ResetPassword");
  const tv = useTranslations("Auth.Validation");

  const resetPasswordSchema = useMemo(
    () => createResetPasswordSchema(tv),
    [tv],
  );

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordInput) {
    if (!token) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });
      if (result.error) {
        toast.error(result.error.message ?? t("couldNotReset"));
        return;
      }
      toast.success(t("successToast"));
      router.push("/");
    } catch (error) {
      console.error("Reset password failed:", error);
      toast.error(t("somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-serif text-[18px] text-ink">{t("invalidTitle")}</p>
        <p className="text-[14px] leading-relaxed text-ink-3">
          {t("invalidBody")}
        </p>
        <Link
          href="/forgot-password"
          className="inline-block pt-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink underline-offset-2 hover:underline"
        >
          {t("requestNewLink")}
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        <p className="text-[14px] leading-relaxed text-ink-3">{t("lead")}</p>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                {t("newPassword")}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("newPasswordPlaceholder")}
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                {t("confirmPassword")}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("confirmPasswordPlaceholder")}
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? t("updating") : t("updatePassword")}
        </button>
      </form>
    </Form>
  );
}
