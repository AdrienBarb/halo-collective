"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  subscribeSchema,
  type SubscribeInput,
  type SubscribeAuthInput,
} from "@/lib/schemas/subscription";
import useApi from "@/lib/hooks/useApi";
import { COUNTRIES } from "@/lib/data/countries";
import { authClient } from "@/lib/better-auth/auth-client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// OtpModal only renders on email-collision; avoid shipping its bundle
// (Dialog + better-auth client OTP plugin) to every athlete-page visitor.
const OtpModal = dynamic(() => import("@/components/auth/OtpModal"), {
  ssr: false,
});

type SubscribeError = Error & {
  response?: { data?: { error?: string; code?: string } };
};

interface SubscribeFormProps {
  athleteSlug: string;
  athleteFirstName: string;
  isSignedIn: boolean;
  isSubscribed: boolean;
}

export default function SubscribeForm({
  athleteSlug,
  athleteFirstName,
  isSignedIn,
  isSubscribed,
}: SubscribeFormProps) {
  const router = useRouter();
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const { usePost } = useApi();

  // Confirmation card whenever the server says we're subscribed OR we just
  // succeeded locally (server hasn't rerendered yet).
  const submitted = isSubscribed || justSubscribed;

  const form = useForm<SubscribeInput>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      countryCode: undefined,
      phone: "",
      partnerOffersConsent: false,
      athleteNewsletterConsent: true,
    },
  });

  const subscribeAnon = usePost(`/athletes/${athleteSlug}/subscribe`, {
    onSuccess: () => {
      setJustSubscribed(true);
      router.refresh();
    },
    onError: (error: SubscribeError) => {
      if (error.response?.data?.code === "EMAIL_EXISTS") {
        const email = form.getValues("email");
        // Fire-and-forget: open the modal immediately; the user can use the
        // "Resend the code" button inside if delivery fails.
        authClient.emailOtp
          .sendVerificationOtp({ email, type: "sign-in" })
          .catch((e: unknown) => {
            console.error("Failed to send OTP:", e);
          });
        setOtpEmail(email);
        return;
      }
      toast.error(error.response?.data?.error ?? "Could not subscribe");
    },
  });

  const subscribeAuth = usePost(`/athletes/${athleteSlug}/subscribe`, {
    onSuccess: () => {
      setJustSubscribed(true);
      router.refresh();
    },
    onError: (error: SubscribeError) => {
      toast.error(error.response?.data?.error ?? "Could not subscribe");
    },
  });

  const anyPending = subscribeAnon.isPending || subscribeAuth.isPending;

  function onAnonSubmit(values: SubscribeInput) {
    if (anyPending) return;
    subscribeAnon.mutate(values);
  }

  function onOtpSuccess() {
    if (anyPending) return;
    const v = form.getValues();
    setOtpEmail(null);
    const payload: SubscribeAuthInput = {
      partnerOffersConsent: v.partnerOffersConsent ?? false,
      source: v.source,
      firstName: v.firstName,
      lastName: v.lastName,
      countryCode: v.countryCode,
      phone: v.phone || undefined,
    };
    subscribeAuth.mutate(payload);
  }

  function onAuthClick() {
    if (anyPending) return;
    const payload: SubscribeAuthInput = { partnerOffersConsent: false };
    subscribeAuth.mutate(payload);
  }

  function onSignInSuccess() {
    setSignInOpen(false);
    // Session is now live; let the server-rendered page re-resolve isSignedIn
    // so the form switches to the one-click "Subscribe" state.
    router.refresh();
  }

  // ── State 3: signed in & already subscribed ──
  if (submitted) {
    return null;
  }

  // ── State 2: signed in, not yet subscribed to this athlete ──
  if (isSignedIn) {
    return (
      <section className="px-6 pt-10 pb-12 md:pt-12">
        <div className="overflow-hidden rounded-2xl border border-line bg-cream-2">
          <div className="bg-ink px-6 py-6 text-center md:px-10 md:py-8">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-gold">
              Join the newsletter
            </div>
            <h2 className="mt-2 font-serif text-[28px] font-semibold leading-tight tracking-[-0.015em] text-cream md:text-[34px]">
              Step inside {athleteFirstName}&apos;s season
            </h2>
          </div>

          <div className="px-6 py-8 text-center md:px-10 md:py-10">
            <p className="mb-6 text-[15px] leading-relaxed text-ink-2">
              You&apos;re signed in. Subscribe to {athleteFirstName}&apos;s
              newsletter in one click.
            </p>
            <button
              type="button"
              onClick={onAuthClick}
              disabled={anyPending}
              className="w-full cursor-pointer rounded-md bg-accent-warm py-4 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink transition hover:bg-accent-gold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {anyPending ? "Subscribing…" : "Subscribe →"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ── State 1: anonymous — full form ──
  return (
    <section className="px-6 pt-10 pb-12 md:pt-12">
      <div className="overflow-hidden rounded-2xl border border-line bg-cream-2">
        <div className="bg-ink px-6 py-6 text-center md:px-10 md:py-8">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-gold">
            Join the newsletter
          </div>
          <h2 className="mt-2 font-serif text-[28px] font-semibold leading-tight tracking-[-0.015em] text-cream md:text-[34px]">
            Step inside my season
          </h2>
        </div>

        <div className="px-6 py-8 md:px-10 md:py-10">
          <p className="mb-8 border-l-[3px] border-loss pl-4 font-serif text-[16px] italic leading-relaxed text-ink-2 md:text-[17px]">
            Every week, I share my results, behind the scenes from tournaments,
            my weekly routine, my gear and other exclusive content.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onAnonSubmit)}
              className="space-y-6"
              noValidate
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                        First name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Elise" {...field} />
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
                      <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                        Last name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Mertens" {...field} />
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
                      <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                        Country
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="– Country –" />
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-7">
                      <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                        Email <span className="text-loss">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="md:col-span-5">
                      <FormLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                        Phone <span className="text-ink-3">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <PhoneInput
                          defaultCountry="FR"
                          placeholder="6 12 34 56 78"
                          value={field.value || undefined}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4">
                <p className="mb-4 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                  My communication preferences
                </p>

                <FormField
                  control={form.control}
                  name="athleteNewsletterConsent"
                  render={({ field }) => (
                    <FormItem>
                      <label
                        className={`flex cursor-pointer gap-4 rounded-xl border-2 bg-cream-2 p-5 transition ${
                          field.value ? "border-loss" : "border-line"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="mt-1 h-4 w-4 accent-loss"
                        />
                        <div>
                          <div className="font-serif text-[16px] font-semibold text-ink">
                            {athleteFirstName}&apos;s Newsletter
                          </div>
                          <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
                            I agree to receive {athleteFirstName}&apos;s emails:
                            results, behind the scenes, weekly routine, gear,
                            exclusive content and, occasionally, selected
                            offers with their partners.
                          </p>
                        </div>
                      </label>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="partnerOffersConsent"
                  render={({ field }) => (
                    <FormItem className="mt-3">
                      <label
                        className={`flex cursor-pointer gap-4 rounded-xl border-2 bg-cream-2 p-5 transition ${
                          field.value ? "border-loss" : "border-line"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="mt-1 h-4 w-4 accent-loss"
                        />
                        <div>
                          <div className="font-serif text-[16px] font-semibold text-ink">
                            Partner offers
                          </div>
                          <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
                            I agree to receive, from time to time, offers, news
                            and benefits from {athleteFirstName}&apos;s selected
                            partners.
                          </p>
                        </div>
                      </label>
                    </FormItem>
                  )}
                />
              </div>

              <p className="text-center text-[12px] leading-relaxed text-ink-3">
                By signing up, you agree to receive the communications you have
                chosen. You can unsubscribe at any time in one click.
              </p>

              <button
                type="submit"
                disabled={anyPending}
                className="w-full cursor-pointer rounded-md bg-accent-warm py-4 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink transition hover:bg-accent-gold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {anyPending ? "Signing up…" : "Sign up →"}
              </button>

              <p className="text-center text-[12px] text-ink-3">
                Already a member?{" "}
                <button
                  type="button"
                  onClick={() => setSignInOpen(true)}
                  className="cursor-pointer font-semibold text-ink underline underline-offset-2 hover:text-accent-gold"
                >
                  Sign in
                </button>
              </p>
            </form>
          </Form>
        </div>
      </div>

      {otpEmail ? (
        <OtpModal
          open={true}
          onOpenChange={(open) => {
            if (!open) setOtpEmail(null);
          }}
          initialEmail={otpEmail}
          onSuccess={onOtpSuccess}
        />
      ) : null}

      {signInOpen ? (
        <OtpModal
          open={true}
          onOpenChange={setSignInOpen}
          onSuccess={onSignInSuccess}
        />
      ) : null}
    </section>
  );
}
