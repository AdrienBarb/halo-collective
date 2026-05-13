"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Check, Instagram, Youtube, type LucideIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChipMultiSelect from "@/components/onboarding/ChipMultiSelect";
import {
  BRANDS,
  LIFESTYLE,
  SPORTS,
  type OnboardingOption,
} from "@/lib/constants/onboarding";
import {
  onboardingPayloadSchema,
  type OnboardingPayload,
} from "@/lib/schemas/onboarding";
import useApi from "@/lib/hooks/useApi";
import { cn } from "@/lib/utils";

type Step = 1 | 2;
type InterestField = "sports" | "lifestyle" | "brands";
type SocialKey = "instagram" | "youtube";

const TOTAL_STEPS = 2;

const interestGroups: ReadonlyArray<{
  name: InterestField;
  label: string;
  options: ReadonlyArray<OnboardingOption>;
}> = [
  {
    name: "sports",
    label: "What sports do you play or follow?",
    options: SPORTS,
  },
  {
    name: "lifestyle",
    label: "What are your lifestyle interests?",
    options: LIFESTYLE,
  },
  {
    name: "brands",
    label: "Which brands do you follow?",
    options: BRANDS,
  },
];

// Step 2 — social account linking is intentionally not wired yet. The Connect
// button only toggles local UI state; no OAuth flow runs and the choice is not
// persisted. When the real implementation lands it will wire Better Auth's
// Google scope (youtube.readonly) and Meta OAuth (instagram_basic,
// pages_show_list), then hydrate halo_youtube_* / halo_instagram_* HubSpot
// properties.
const socialProviders: ReadonlyArray<{
  key: SocialKey;
  label: string;
  copy: string;
  Icon: LucideIcon;
}> = [
  {
    key: "instagram",
    label: "Instagram",
    copy: "Connect Instagram to discover other athletes on Halo.",
    Icon: Instagram,
  },
  {
    key: "youtube",
    label: "YouTube",
    copy: "Connect YouTube to get content recommendations based on what you already watch.",
    Icon: Youtube,
  },
];

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

const primaryButtonClass =
  "cursor-pointer rounded-md bg-accent-warm px-6 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink transition hover:bg-accent-gold disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "cursor-pointer rounded-md border border-line bg-cream px-6 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink-2 transition hover:bg-cream-3";

const titles: Record<Step, string> = {
  1: "Tell us what you're into",
  2: "Add your social handles",
};

const subtitles: Record<Step, string> = {
  1: "Helps us send you the right stories, drops, and offers.",
  2: "Optional. Helps us personalise your experience.",
};

export default function OnboardingModal({
  open,
  onClose,
}: OnboardingModalProps) {
  const router = useRouter();
  const { usePost } = useApi();
  const [step, setStep] = useState<Step>(1);
  const [socialConnected, setSocialConnected] = useState<
    Record<SocialKey, boolean>
  >({ instagram: false, youtube: false });

  const form = useForm<OnboardingPayload>({
    resolver: zodResolver(onboardingPayloadSchema),
    defaultValues: {
      sports: [],
      lifestyle: [],
      brands: [],
    },
  });

  // Adjust internal state when the `open` prop transitions — without this, a
  // second post-signup flow in the same session would land mid-form since the
  // component stays mounted across opens. Follows React's "Adjusting state
  // when a prop changes" pattern.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setStep(1);
      setSocialConnected({ instagram: false, youtube: false });
      form.reset();
    }
  }

  const submit = usePost("/onboarding", {
    onSuccess: () => {
      onClose();
      router.refresh();
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  function goNext() {
    setStep((current) => (current < TOTAL_STEPS ? ((current + 1) as Step) : current));
  }

  function goBack() {
    setStep((current) => (current > 1 ? ((current - 1) as Step) : current));
  }

  function onSubmit(values: OnboardingPayload) {
    // Guard: react-hook-form's handleSubmit can fire if the browser performs
    // a form submission for any reason — only persist when the user is
    // actually on the final step and pressed Finish.
    if (step !== TOTAL_STEPS) return;
    if (submit.isPending) return;
    submit.mutate(values);
  }

  const isSubmitting = submit.isPending;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-xl border-line bg-cream-2 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-gold">
            Step {step} of {TOTAL_STEPS}
          </div>
          <DialogTitle className="font-serif text-[24px] font-semibold tracking-[-0.015em] text-ink">
            {titles[step]}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-ink-3">
            {subtitles[step]}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 pt-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((dot) => (
            <span
              key={dot}
              className={cn(
                "h-1.5 flex-1 rounded-full transition",
                dot <= step ? "bg-accent-warm" : "bg-line",
              )}
            />
          ))}
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="max-h-[60vh] space-y-8 overflow-y-auto pr-1">
            {step === 1
              ? interestGroups.map((group) => (
                  <Controller
                    key={group.name}
                    control={form.control}
                    name={group.name}
                    render={({ field }) => (
                      <ChipMultiSelect
                        label={group.label}
                        options={group.options}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                ))
              : null}

            {step === 2 ? (
              <div className="space-y-3">
                {socialProviders.map((provider) => {
                  const connected = socialConnected[provider.key];
                  return (
                    <div
                      key={provider.key}
                      className={cn(
                        "flex items-start gap-4 rounded-xl border-2 bg-cream-2 p-5 transition",
                        connected ? "border-accent-warm" : "border-line",
                      )}
                    >
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-cream text-ink">
                        <provider.Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-serif text-[16px] font-semibold text-ink">
                          {provider.label}
                        </div>
                        <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
                          {provider.copy}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSocialConnected((prev) => ({
                            ...prev,
                            [provider.key]: !prev[provider.key],
                          }))
                        }
                        className={cn(
                          "shrink-0 cursor-pointer rounded-md border px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] transition",
                          connected
                            ? "border-accent-warm bg-accent-warm/15 text-ink"
                            : "border-ink bg-ink text-cream hover:bg-ink/90",
                        )}
                      >
                        {connected ? (
                          <span className="flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5" />
                            Connected
                          </span>
                        ) : (
                          "Connect"
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={isSubmitting}
                  className={secondaryButtonClass}
                >
                  Back
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-4">
              {step < TOTAL_STEPS ? (
                <button
                  key="next"
                  type="button"
                  onClick={goNext}
                  className={primaryButtonClass}
                >
                  Next
                </button>
              ) : (
                <button
                  key="finish"
                  type="submit"
                  disabled={isSubmitting}
                  className={primaryButtonClass}
                >
                  {isSubmitting ? "Finishing…" : "Finish"}
                </button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
