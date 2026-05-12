"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import type { PollBlock as PollBlockType } from "@/lib/schemas/newsletterSection";
import type { EngagementSnapshot } from "@/lib/services/fanEngagement";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import useApi from "@/lib/hooks/useApi";

interface PollBlockProps {
  block: PollBlockType;
  athleteSlug: string;
  newsletterId: string;
  previewMode?: boolean;
}

export default function PollBlock({
  block,
  athleteSlug,
  newsletterId,
  previewMode = false,
}: PollBlockProps) {
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
    mutate({ kind: "poll", optionIndex });
  }

  const userOptionIndex = data?.userResponse?.optionIndex ?? null;
  const counts =
    data?.aggregate?.optionCounts ?? new Array(block.options.length).fill(0);
  const total = data?.aggregate?.totalResponses ?? 0;
  const hasVoted = userOptionIndex !== null;
  const isClosed = Boolean(data?.isClosed);
  const anyPending = pendingIndex !== null;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <p className="font-serif text-[18px] font-medium leading-snug tracking-[-0.01em] text-ink">
        {block.question}
      </p>
      {isLoading && !data ? (
        <div className="h-24 animate-pulse rounded-xl bg-line/30" aria-hidden />
      ) : (
        <div className="space-y-3">
          <ul className="space-y-2">
            {block.options.map((opt, i) => {
              const count = counts[i] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const isSelected = userOptionIndex === i;
              const isPicked = selectedIndex === i;

              if (hasVoted) {
                return (
                  <li
                    key={i}
                    className={`relative overflow-hidden rounded-xl border px-4 py-3 ${
                      isSelected
                        ? "border-action bg-action/5"
                        : "border-line bg-cream"
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
                      <span className="flex items-center gap-3 text-[14px] text-ink">
                        {opt.emoji ? (
                          <span
                            aria-hidden
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream-3 text-[14px]"
                          >
                            {opt.emoji}
                          </span>
                        ) : null}
                        <span>{opt.label}</span>
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-ink-2">
                        {pct}%
                      </span>
                    </div>
                  </li>
                );
              }

              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setSelectedIndex(i)}
                    disabled={isClosed || anyPending}
                    aria-pressed={isPicked}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition hover:border-line-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                      isPicked
                        ? "border-action bg-action/5"
                        : opt.isHighlighted
                          ? "border-line-2 bg-cream"
                          : "border-line bg-cream"
                    }`}
                  >
                    {opt.emoji ? (
                      <span
                        aria-hidden
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream-3 text-[14px]"
                      >
                        {opt.emoji}
                      </span>
                    ) : null}
                    <span className="text-[14px] text-ink">{opt.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {!hasVoted ? (
            <button
              type="button"
              onClick={() => {
                if (selectedIndex !== null) vote(selectedIndex);
              }}
              disabled={isClosed || anyPending || selectedIndex === null}
              className="block w-full rounded-xl bg-action px-4 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-cream transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {anyPending
                ? labels.engagementInteractive.submitting
                : labels.engagementInteractive.submit}
            </button>
          ) : null}

          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
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
