"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

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

type InterestField = "sports" | "lifestyle" | "brands";

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

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

const primaryButtonClass =
  "cursor-pointer rounded-md bg-accent-warm px-6 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink transition hover:bg-accent-gold disabled:cursor-not-allowed disabled:opacity-60";

export default function OnboardingModal({
  open,
  onClose,
}: OnboardingModalProps) {
  const router = useRouter();
  const { usePost } = useApi();

  const form = useForm<OnboardingPayload>({
    resolver: zodResolver(onboardingPayloadSchema),
    defaultValues: {
      sports: [],
      lifestyle: [],
      brands: [],
    },
  });

  // Adjust internal state when the `open` prop transitions — without this, a
  // second post-signup flow in the same session would land with stale values
  // since the component stays mounted across opens. Follows React's "Adjusting
  // state when a prop changes" pattern.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) form.reset();
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

  function onSubmit(values: OnboardingPayload) {
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
          <DialogTitle className="font-serif text-[24px] font-semibold tracking-[-0.015em] text-ink">
            Tell us what you&apos;re into
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-ink-3">
            Helps us send you the right stories, drops, and offers.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="max-h-[60vh] space-y-8 overflow-y-auto pr-1">
            {interestGroups.map((group) => (
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
            ))}
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={primaryButtonClass}
            >
              {isSubmitting ? "Finishing…" : "Finish"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
