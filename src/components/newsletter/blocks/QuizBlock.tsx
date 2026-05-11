"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { QuizBlock as QuizBlockType } from "@/lib/schemas/newsletterSection";
import type { EngagementSnapshot } from "@/lib/services/fanEngagement";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import useApi from "@/lib/hooks/useApi";

interface QuizBlockProps {
  block: QuizBlockType;
  athleteSlug: string;
  newsletterId: string;
  previewMode?: boolean;
}

export default function QuizBlock({
  block,
  athleteSlug,
  newsletterId,
  previewMode = false,
}: QuizBlockProps) {
  const labels = getNewsletterLabels();
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
          ?.error ?? "Something went wrong";
      toast.error(message);
      setPendingIndex(null);
    },
  });

  function vote(optionIndex: number) {
    setPendingIndex(optionIndex);
    mutate({ kind: "quiz", optionIndex });
  }

  const userOptionIndex = data?.userResponse?.optionIndex ?? null;
  const userCorrect = data?.userResponse?.isCorrect;
  const correctIndex = data?.aggregate?.correctOptionIndex ?? null;
  const counts =
    data?.aggregate?.optionCounts ?? new Array(block.options.length).fill(0);
  const total = data?.aggregate?.totalResponses ?? 0;
  const hasAnswered = userOptionIndex !== null;
  const anyPending = pendingIndex !== null;

  return (
    <div className="space-y-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-action">
        {labels.engagementEyebrows.quiz}
      </div>
      <p className="font-serif text-lg italic leading-snug text-ink">
        {block.question}
      </p>
      {isLoading && !data ? (
        <div className="h-24 animate-pulse rounded bg-line/30" aria-hidden />
      ) : (
        <div className="space-y-3">
          <ul className="space-y-2">
            {block.options.map((opt, i) => {
              const count = counts[i] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const isSelected = userOptionIndex === i;
              const isCorrectOption = correctIndex === i;

              if (hasAnswered) {
                // No correct option configured → neutral display with the
                // user's pick subtly highlighted.
                const tone =
                  correctIndex === null
                    ? isSelected
                      ? "border-action bg-action/5"
                      : "border-line bg-cream-2"
                    : isCorrectOption
                      ? "border-emerald-500 bg-emerald-50"
                      : isSelected
                        ? "border-red-500 bg-red-50"
                        : "border-line bg-cream-2";
                return (
                  <li
                    key={i}
                    className={`relative overflow-hidden rounded border px-4 py-3 ${tone}`}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-y-0 left-0 bg-line/20"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex items-center justify-between gap-3">
                      <span className="text-sm text-ink">{opt.label}</span>
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
                    disabled={anyPending}
                    className="flex w-full cursor-pointer items-center gap-3 rounded border border-line bg-cream-2 px-4 py-3 text-left transition hover:border-action disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="text-sm text-ink">{opt.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {hasAnswered && correctIndex !== null ? (
            <div
              className={`font-mono text-[10px] uppercase tracking-wide ${
                userCorrect ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {userCorrect
                ? labels.engagementInteractive.correctAnswer
                : labels.engagementInteractive.incorrectAnswer}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
