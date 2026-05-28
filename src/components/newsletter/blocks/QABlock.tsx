"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import type { QABlock as QABlockType } from "@/lib/schemas/newsletterSection";
import type { EngagementSnapshot } from "@/lib/services/fanEngagement";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import useApi from "@/lib/hooks/useApi";

interface QABlockProps {
  block: QABlockType;
  athleteSlug: string;
  newsletterId: string;
  previewMode?: boolean;
}

const TEXT_MAX = 1000;

export default function QABlock({
  block,
  athleteSlug,
  newsletterId,
  previewMode = false,
}: QABlockProps) {
  const tErrors = useTranslations("Errors.Generic");
  const locale = useLocale() as "en" | "fr";
  const labels = getNewsletterLabels(locale);
  const { useGet, usePost } = useApi();
  const queryClient = useQueryClient();
  const url = `/athletes/${athleteSlug}/newsletters/${newsletterId}/engagement/${block.id}`;
  const queryKey = ["get", { url, params: undefined }] as const;

  const { data, isLoading } = useGet(url, undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    enabled: !previewMode,
  }) as {
    data: EngagementSnapshot | undefined;
    isLoading: boolean;
  };

  const [text, setText] = useState("");

  const { mutate, isPending } = usePost(url, {
    onSuccess: (next: EngagementSnapshot) => {
      queryClient.setQueryData(queryKey, next);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? tErrors("somethingWentWrong");
      toast.error(message);
    },
  });

  const submitted = data?.userResponse?.text ?? null;

  return (
    <div className="space-y-4">
      <div className="font-sans text-[10px] uppercase tracking-[0.18em] text-action">
        {labels.engagementEyebrows.qa}
      </div>
      {block.intro ? (
        <p className="text-sm text-ink-2">{block.intro}</p>
      ) : null}
      <p className="font-display text-lg italic leading-snug text-ink">
        {block.prompt}
      </p>
      {isLoading && !data ? (
        <div className="h-24 animate-pulse rounded bg-line/30" aria-hidden />
      ) : submitted ? (
        <div className="space-y-2 rounded border border-line bg-cream-2 px-4 py-3">
          <div className="font-sans text-[10px] uppercase tracking-wide text-emerald-700">
            {labels.engagementInteractive.yourAnswerRecorded}
          </div>
          <p className="text-sm text-ink">{submitted}</p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = text.trim();
            if (!trimmed) return;
            mutate({ kind: "qa", text: trimmed });
          }}
          className="space-y-3"
        >
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={labels.engagementInteractive.yourQuestionPlaceholder}
            maxLength={TEXT_MAX}
            rows={4}
          />
          <Button
            type="submit"
            size="sm"
            disabled={isPending || text.trim().length === 0}
          >
            {isPending
              ? labels.engagementInteractive.submitting
              : labels.engagementInteractive.submit}
          </Button>
        </form>
      )}
      <p className="font-sans text-[10px] uppercase tracking-wide text-ink-3">
        {block.reassurance ?? labels.reassuranceText}
      </p>
    </div>
  );
}
