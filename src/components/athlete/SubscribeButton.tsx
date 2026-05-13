"use client";

import { useState } from "react";
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
  isSignedIn: boolean;
  isSubscribed: boolean;
  ipCountryCode: string | null;
}

export default function SubscribeButton({
  athleteSlug,
  athleteFirstName,
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
  // page rerenders in its signed-in state (one-click subscribe ready).
  function onAuthSuccess() {
    setAuthOpen(false);
    router.refresh();
  }

  const submitting = subscribe.isPending;

  return (
    <section className="px-6 pt-10 pb-12 md:pt-12">
      <div className="overflow-hidden rounded-2xl border border-line bg-cream-2">
        <div className="bg-ink px-6 py-6 text-center md:px-10 md:py-8">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-gold">
            {t("eyebrow")}
          </div>
          <h2 className="mt-2 font-serif text-[28px] font-semibold leading-tight tracking-[-0.015em] text-cream md:text-[34px]">
            {t("title", { athleteFirstName })}
          </h2>
        </div>

        <div className="px-6 py-8 md:px-10 md:py-10">
          <p className="mb-8 border-l-[3px] border-loss pl-4 font-serif text-[16px] italic leading-relaxed text-ink-2 md:text-[17px]">
            {t("lead", { athleteFirstName })}
          </p>

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
                <div className="font-serif text-[16px] font-semibold text-ink">
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
                <div className="font-serif text-[16px] font-semibold text-ink">
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

          <p className="mt-6 text-center text-[12px] leading-relaxed text-ink-3">
            {t("finePrint")}
          </p>

          <button
            type="button"
            onClick={onSubscribeClick}
            disabled={submitting}
            className="mt-4 w-full cursor-pointer rounded-md bg-accent-warm py-4 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink transition hover:bg-accent-gold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? t("subscribing") : t("subscribeCta")}
          </button>

          {!isSignedIn ? (
            <p className="mt-4 text-center text-[12px] text-ink-3">
              {t("authPrompt")}
            </p>
          ) : null}
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
