"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { isLandingHidden } from "@/lib/utils/isLandingHidden";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/better-auth/auth-client";
import {
  createForgotPasswordSchema,
  type ForgotPasswordInput,
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

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth.ForgotPassword");
  const tv = useTranslations("Auth.Validation");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const forgotPasswordSchema = useMemo(
    () => createForgotPasswordSchema(tv),
    [tv],
  );

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const baseURL =
        process.env.NEXT_PUBLIC_BASE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      const result = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: `${baseURL}/reset-password`,
      });
      if (result.error) {
        console.error("requestPasswordReset error:", result.error);
      }
      setSent(true);
    } catch (error) {
      console.error("Forgot password failed:", error);
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-cream">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-lg flex-col justify-center px-6 py-12">
        <div className="overflow-hidden rounded-2xl border border-line bg-cream-2">
          <div className="bg-ink px-6 py-6 text-center md:px-10 md:py-8">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-gold">
              {t("eyebrow")}
            </div>
            <h1 className="mt-2 font-serif text-[28px] font-semibold leading-tight tracking-[-0.015em] text-cream md:text-[32px]">
              {t("title")}
            </h1>
          </div>

          <div className="px-6 py-8 md:px-10 md:py-10">
            {sent ? (
              <div className="space-y-4 text-center">
                <p className="font-serif text-[18px] text-ink">
                  {t("checkInboxTitle")}
                </p>
                <p className="text-[14px] leading-relaxed text-ink-3">
                  {t("checkInboxBody")}
                </p>
                {isLandingHidden() ? null : (
                  <Link
                    href="/"
                    className="inline-block pt-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink underline-offset-2 hover:underline"
                  >
                    {t("backToHalo")}
                  </Link>
                )}
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                  noValidate
                >
                  <p className="text-[14px] leading-relaxed text-ink-3">
                    {t("explainer")}
                  </p>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                          {t("email")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder={t("emailPlaceholder")}
                            disabled={submitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className={buttonClass}
                  >
                    {submitting ? t("sending") : t("sendResetLink")}
                  </button>

                  {isLandingHidden() ? null : (
                    <p className="text-center text-[12px] text-ink-3">
                      {t("remembered")}{" "}
                      <Link
                        href="/"
                        className="font-semibold text-ink underline underline-offset-2 hover:text-accent-gold"
                      >
                        {t("backToHalo")}
                      </Link>
                    </p>
                  )}
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
