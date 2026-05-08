"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  subscribeSchema,
  type SubscribeInput,
} from "@/lib/schemas/subscription";
import useApi from "@/lib/hooks/useApi";
import { COUNTRIES } from "@/lib/data/countries";
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

interface SubscribeFormProps {
  athleteSlug: string;
  athleteFirstName: string;
}

export default function SubscribeForm({
  athleteSlug,
  athleteFirstName,
}: SubscribeFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const { usePost } = useApi();

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

  const subscribe = usePost(`/athletes/${athleteSlug}/subscribe`, {
    onSuccess: () => setSubmitted(true),
    onError: (
      error: Error & { response?: { data?: { error?: string } } },
    ) => {
      toast.error(error.response?.data?.error ?? "Could not subscribe");
    },
  });

  function onSubmit(values: SubscribeInput) {
    subscribe.mutate(values);
  }

  if (submitted) {
    return (
      <section className="px-6 pb-12">
        <div className="rounded-2xl border border-line bg-cream-2 px-8 py-12 text-center">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-gold">
            You&apos;re in
          </div>
          <h3 className="mt-3 font-serif text-[28px] font-semibold leading-tight tracking-[-0.015em] text-ink md:text-[32px]">
            Welcome to {athleteFirstName}&apos;s circle.
          </h3>
          <p className="mt-3 text-[15px] text-ink-3">
            The next edition will land in your inbox.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 pb-12">
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
              onSubmit={form.handleSubmit(onSubmit)}
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
                disabled={subscribe.isPending}
                className="w-full cursor-pointer rounded-md bg-accent-warm py-4 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink transition hover:bg-accent-gold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {subscribe.isPending ? "Signing up…" : "Sign up →"}
              </button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
