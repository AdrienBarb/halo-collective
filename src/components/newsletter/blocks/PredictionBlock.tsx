"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import type { PredictionBlock as PredictionBlockType } from "@/lib/schemas/newsletterSection";
import type { EngagementSnapshot } from "@/lib/services/fanEngagement";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import useApi from "@/lib/hooks/useApi";

interface PredictionBlockProps {
  block: PredictionBlockType;
  athleteSlug: string;
  newsletterId: string;
  previewMode?: boolean;
}

export default function PredictionBlock({
  block,
  athleteSlug,
  newsletterId,
  previewMode = false,
}: PredictionBlockProps) {
  const tErrors = useTranslations("Errors.Generic");
  const locale = useLocale() as "en" | "fr";
  const labels = getNewsletterLabels(locale);
  const { useGet, usePost } = useApi();
  const queryClient = useQueryClient();
  const url = `/athletes/${athleteSlug}/newsletters/${newsletterId}/engagement/${block.id}`;
  const queryKey = ["get", { url, params: undefined }] as const;

  const hasOptions = block.options.length > 0;

  const { data, isLoading } = useGet(url, undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    enabled: hasOptions && !previewMode,
  }) as {
    data: EngagementSnapshot | undefined;
    isLoading: boolean;
  };
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const { mutate } = usePost(url, {
    onSuccess: (next: EngagementSnapshot) => {
      queryClient.setQueryData(queryKey, next);
      setPendingIndex(null);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? tErrors("somethingWentWrong");
      toast.error(message);
      setPendingIndex(null);
    },
  });

  function vote(optionIndex: number) {
    setPendingIndex(optionIndex);
    mutate({ kind: "prediction", optionIndex });
  }

  const userOptionIndex = data?.userResponse?.optionIndex ?? null;
  const counts =
    data?.aggregate?.optionCounts ?? new Array(block.options.length).fill(0);
  const total = data?.aggregate?.totalResponses ?? 0;
  const hasVoted = userOptionIndex !== null;
  const isClosed = Boolean(data?.isClosed);
  const anyPending = pendingIndex !== null;

  return (
    <div className="space-y-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-action">
        {labels.engagementEyebrows.prediction}
      </div>
      <p className="font-serif text-lg italic leading-snug text-ink">
        {block.prompt}
      </p>
      {!hasOptions ? null : isLoading && !data ? (
        <div className="h-24 animate-pulse rounded bg-line/30" aria-hidden />
      ) : (
        <div className="space-y-3">
          <ul className="space-y-2">
            {block.options.map((opt, i) => {
              const count = counts[i] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const isSelected = userOptionIndex === i;
              const isThisPending = pendingIndex === i;

              if (hasVoted) {
                return (
                  <li
                    key={i}
                    className={`relative overflow-hidden rounded border px-4 py-3 ${
                      isSelected
                        ? "border-action bg-action/5"
                        : "border-line bg-cream-2"
                    }`}
                  >
                    <div
                      aria-hidden
                      className={`absolute inset-y-0 left-0 ${
                        isSelected ? "bg-action/15" : "bg-line/30"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm text-ink">
                        {opt.emoji ? <span aria-hidden>{opt.emoji}</span> : null}
                        <span>{opt.label}</span>
                      </span>
                      <span className="font-mono text-xs text-ink-2">{pct}%</span>
                    </div>
                  </li>
                );
              }

              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => vote(i)}
                    disabled={isClosed || anyPending}
                    aria-busy={isThisPending}
                    className="flex w-full cursor-pointer items-center gap-3 rounded border border-line bg-cream-2 px-4 py-3 text-left transition hover:border-action disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {opt.emoji ? (
                      <span aria-hidden className="text-base">
                        {opt.emoji}
                      </span>
                    ) : null}
                    <span className="text-sm text-ink">{opt.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wide text-ink-3">
            <span>
              {labels.engagementInteractive.votesCountTemplate.replace(
                "{count}",
                total.toString(),
              )}
            </span>
            {isClosed ? <span>{labels.engagementInteractive.closed}</span> : null}
          </div>
        </div>
      )}
    </div>
  );
}
