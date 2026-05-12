"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { authClient } from "@/lib/better-auth/auth-client";
import {
  resetPasswordSchema,
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
        toast.error(result.error.message ?? "Could not reset password");
        return;
      }
      toast.success("Password updated. Sign in with your new password.");
      router.push("/");
    } catch (error) {
      console.error("Reset password failed:", error);
      toast.error("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-serif text-[18px] text-ink">Invalid reset link.</p>
        <p className="text-[14px] leading-relaxed text-ink-3">
          This link is missing its token, or it has already been used.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block pt-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink underline-offset-2 hover:underline"
        >
          Request a new link
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
        <p className="text-[14px] leading-relaxed text-ink-3">
          Choose a new password for your Halo account.
        </p>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                New password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
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
                Confirm password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </Form>
  );
}
