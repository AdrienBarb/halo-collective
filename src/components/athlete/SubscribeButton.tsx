"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import useApi from "@/lib/hooks/useApi";

const AuthModal = dynamic(() => import("@/components/auth/AuthModal"), {
  ssr: false,
});

type SubscribeError = Error & {
  response?: { data?: { error?: string; code?: string } };
};

interface SubscribeButtonProps {
  athleteSlug: string;
  athleteFirstName: string;
  athleteLastName?: string;
  athleteAvatarUrl?: string | null;
  isSignedIn: boolean;
  isSubscribed: boolean;
  ipCountryCode: string | null;
}

export default function SubscribeButton({
  athleteSlug,
  athleteFirstName,
  athleteLastName,
  athleteAvatarUrl,
  isSignedIn,
  isSubscribed,
  ipCountryCode,
}: SubscribeButtonProps) {
  const router = useRouter();
  const t = useTranslations("Athlete.Subscribe");
  const tErrors = useTranslations("Errors.Generic");
  const { usePost } = useApi();

  const [newsletterConsent, setNewsletterConsent] = useState(true);
  const [partnerOffersConsent, setPartnerOffersConsent] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  const subscribe = usePost(`/athletes/${athleteSlug}/subscribe`, {
    onSuccess: () => {
      setJustSubscribed(true);
      router.refresh();
    },
    onError: (error: SubscribeError) => {
      toast.error(error.response?.data?.error ?? tErrors("somethingWentWrong"));
    },
  });

  if (isSubscribed || justSubscribed) {
    return null;
  }

  function onSubscribeClick() {
    if (!newsletterConsent) {
      setConsentError(t("tickBoxError"));
      return;
    }
    setConsentError(null);

    if (isSignedIn) {
      subscribe.mutate({
        partnerOffersConsent,
      });
      return;
    }

    setAuthOpen(true);
  }

  // After auth completes, we *don't* subscribe automatically — that's the
  // user's next explicit action. We just close the modal and refresh so the
  // page rerenders in its signed-in state (one-click subscribe ready). The
  // post-signup onboarding modal is mounted globally in the root layout and
  // gated on the DB flag, so it pops automatically here too.
  function onAuthSuccess() {
    setAuthOpen(false);
    router.refresh();
  }

  const submitting = subscribe.isPending;

  return (
    <section className="px-6 pt-10 pb-12 md:pt-12">
      <div className="overflow-hidden rounded-2xl border border-line bg-cream-2">
        <div className="bg-ink px-6 py-8 text-center md:px-10 md:py-10">
          {athleteAvatarUrl !== undefined ? (
            <div className="relative mx-auto mb-5 h-20 w-20 overflow-hidden rounded-full border-2 border-cream/20 bg-[linear-gradient(135deg,#5a6478_0%,#2c3340_100%)] md:h-24 md:w-24">
              {athleteAvatarUrl ? (
                <Image
                  src={athleteAvatarUrl}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-2xl font-semibold text-cream">
                  {(athleteFirstName[0] ?? "") + (athleteLastName?.[0] ?? "")}
                </div>
              )}
            </div>
          ) : null}
          <div className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-accent-gold">
            {t("eyebrow")}
          </div>
          <h2 className="mt-2 font-display text-[28px] font-bold uppercase leading-tight tracking-[-0.005em] text-cream md:text-[34px]">
            {t("title", { athleteFirstName })}
          </h2>
        </div>

        <div className="px-6 py-8 md:px-10 md:py-10">
          <div className="space-y-3">
            <label
              className={`flex cursor-pointer gap-4 rounded-xl border-2 bg-cream-2 p-5 transition ${
                newsletterConsent ? "border-loss" : "border-line"
              }`}
            >
              <input
                type="checkbox"
                checked={newsletterConsent}
                onChange={(e) => {
                  setNewsletterConsent(e.target.checked);
                  if (e.target.checked) setConsentError(null);
                }}
                className="mt-1 h-4 w-4 accent-loss"
              />
              <div>
                <div className="font-display text-[16px] font-semibold text-ink">
                  {t("newsletterHeading", { athleteFirstName })}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
                  {t("newsletterConsent", { athleteFirstName })}
                </p>
              </div>
            </label>

            <label
              className={`flex cursor-pointer gap-4 rounded-xl border-2 bg-cream-2 p-5 transition ${
                partnerOffersConsent ? "border-loss" : "border-line"
              }`}
            >
              <input
                type="checkbox"
                checked={partnerOffersConsent}
                onChange={(e) => setPartnerOffersConsent(e.target.checked)}
                className="mt-1 h-4 w-4 accent-loss"
              />
              <div>
                <div className="font-display text-[16px] font-semibold text-ink">
                  {t("partnerOffersHeading")}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
                  {t("partnerOffersConsent", { athleteFirstName })}
                </p>
              </div>
            </label>
          </div>

          {consentError ? (
            <p className="mt-4 text-center text-[12px] text-loss">
              {consentError}
            </p>
          ) : null}

          <button
            type="button"
            onClick={onSubscribeClick}
            disabled={submitting}
            className="mt-4 w-full cursor-pointer rounded-md bg-accent-warm py-4 font-display text-[14px] font-bold uppercase tracking-[0.12em] text-ink transition hover:bg-accent-gold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? t("subscribing") : t("subscribeCta")}
          </button>

          <p className="mt-6 text-center text-[12px] leading-relaxed text-ink-3">
            {t("finePrint")}
          </p>
        </div>
      </div>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialMode="signup"
        onSuccess={onAuthSuccess}
        ipCountryCode={ipCountryCode}
      />
    </section>
  );
}
