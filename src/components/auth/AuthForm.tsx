"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { authClient } from "@/lib/better-auth/auth-client";
import { syncLocaleFromUser } from "@/lib/actions/syncLocaleFromUser";
import {
  createSignInSchema,
  createSignUpSchema,
  type SignInInput,
  type SignUpInput,
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

type Mode = "signin" | "signup";

interface AuthFormProps {
  mode: Mode;
  onSuccess: () => void;
  onModeChange?: (mode: Mode) => void;
  redirectAfter?: string;
  ipCountryCode?: string | null;
}

const buttonClass =
  "w-full cursor-pointer rounded-md bg-accent-warm py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink transition hover:bg-accent-gold disabled:cursor-not-allowed disabled:opacity-60";

const googleButtonClass =
  "w-full cursor-pointer rounded-md border border-line bg-cream py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink transition hover:bg-cream-3 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-3";

function GoogleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.1 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function AuthForm({
  mode,
  onSuccess,
  onModeChange,
  redirectAfter,
  ipCountryCode,
}: AuthFormProps) {
  const t = useTranslations("Auth.Form");
  const tv = useTranslations("Auth.Validation");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const signInSchema = useMemo(() => createSignInSchema(tv), [tv]);
  const signUpSchema = useMemo(() => createSignUpSchema(tv), [tv]);

  const signinForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  async function onSignIn(values: SignInInput) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });
      if (result.error) {
        console.error("signIn.email error:", result.error);
        toast.error(t("invalidCredentials"));
        return;
      }
      // syncLocaleFromUser is best-effort — a failure must not block the
      // post-auth handoff (otherwise the user is signed in but the modal
      // stays open and the onboarding gate never fires until next nav).
      try {
        await syncLocaleFromUser();
      } catch (error) {
        console.error("syncLocaleFromUser failed (signin):", error);
      }
      onSuccess();
    } catch (error) {
      console.error("Sign in failed:", error);
      toast.error(t("somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogle() {
    if (googleLoading) return;
    setGoogleLoading(true);
    const callbackURL =
      redirectAfter ??
      (typeof window !== "undefined" ? window.location.pathname : "/");
    try {
      // better-auth returns { data, error } — it does NOT throw on failure.
      // Without re-checking, googleLoading stays true and disables every input
      // (busy = submitting || googleLoading), locking the user out of the form.
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
      if (result?.error) {
        console.error("Google sign-in failed:", result.error);
        toast.error(t("couldNotStartGoogle"));
        setGoogleLoading(false);
      }
      // On success the browser is redirecting away — leave loading set.
    } catch (error) {
      console.error("Google sign-in failed:", error);
      toast.error(t("couldNotStartGoogle"));
      setGoogleLoading(false);
    }
  }

  const busy = submitting || googleLoading;

  const googleBlock = (
    <>
      <button
        type="button"
        onClick={onGoogle}
        disabled={busy}
        className={googleButtonClass}
      >
        <GoogleIcon />
        {googleLoading ? t("redirecting") : t("continueWithGoogle")}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-line" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-cream-2 px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
            {t("or")}
          </span>
        </div>
      </div>
    </>
  );

  async function onSignUp(values: SignUpInput) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`.trim(),
        firstName: values.firstName,
        lastName: values.lastName,
        ...(ipCountryCode ? { countryCode: ipCountryCode } : {}),
      });
      if (result.error) {
        console.error("signUp.email error:", result.error);
        toast.error(t("couldNotCreateAccount"));
        return;
      }
      try {
        await syncLocaleFromUser();
      } catch (error) {
        console.error("syncLocaleFromUser failed (signup):", error);
      }
      onSuccess();
    } catch (error) {
      console.error("Sign up failed:", error);
      toast.error(t("somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === "signup") {
    return (
      <div key={mode} className="space-y-5">
        {googleBlock}
        <Form {...signupForm}>
          <form
            onSubmit={signupForm.handleSubmit(onSignUp)}
            className="space-y-4"
            noValidate
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={signupForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                      {t("firstName")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="given-name"
                        placeholder={t("firstNamePlaceholder")}
                        disabled={busy}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                      {t("lastName")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="family-name"
                        placeholder={t("lastNamePlaceholder")}
                        disabled={busy}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={signupForm.control}
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
                      disabled={busy}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={signupForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                    {t("password")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder={t("passwordPlaceholderSignUp")}
                      disabled={busy}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button type="submit" disabled={busy} className={buttonClass}>
              {submitting ? t("creatingAccount") : t("createAccount")}
            </button>

            <p className="text-center text-[12px] text-ink-3">
              {t.rich("alreadyHaveAccount", {
                link: (chunks) => (
                  <button
                    type="button"
                    onClick={() => onModeChange?.("signin")}
                    className="cursor-pointer font-semibold text-ink underline underline-offset-2 hover:text-accent-gold"
                  >
                    {chunks}
                  </button>
                ),
              })}
            </p>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div key={mode} className="space-y-5">
      {googleBlock}
      <Form {...signinForm}>
        <form
          onSubmit={signinForm.handleSubmit(onSignIn)}
          className="space-y-4"
          noValidate
        >
          <FormField
            control={signinForm.control}
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
                    disabled={busy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={signinForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                  <span>{t("password")}</span>
                  <Link
                    href="/forgot-password"
                    className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3 underline-offset-2 hover:text-ink hover:underline"
                  >
                    {t("forgot")}
                  </Link>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder={t("passwordPlaceholderSignIn")}
                    disabled={busy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <button type="submit" disabled={busy} className={buttonClass}>
            {submitting ? t("signingIn") : t("signIn")}
          </button>

          <p className="text-center text-[12px] text-ink-3">
            {t.rich("newHere", {
              link: (chunks) => (
                <button
                  type="button"
                  onClick={() => onModeChange?.("signup")}
                  className="cursor-pointer font-semibold text-ink underline underline-offset-2 hover:text-accent-gold"
                >
                  {chunks}
                </button>
              ),
            })}
          </p>
        </form>
      </Form>
    </div>
  );
}
