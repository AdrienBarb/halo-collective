"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import type { SurveyBlock as SurveyBlockType } from "@/lib/schemas/newsletterSection";
import type { EngagementSnapshot } from "@/lib/services/fanEngagement";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import useApi from "@/lib/hooks/useApi";

interface SurveyBlockProps {
  block: SurveyBlockType;
  athleteSlug: string;
  newsletterId: string;
  previewMode?: boolean;
}

const TEXT_MAX = 1000;

export default function SurveyBlock({
  block,
  athleteSlug,
  newsletterId,
  previewMode = false,
}: SurveyBlockProps) {
  const tErrors = useTranslations("Errors.Generic");
  const locale = useLocale() as "en" | "fr";
  const labels = getNewsletterLabels(locale);
  const paragraphs = splitParagraphs(block.body);
  const externalUrl = block.externalUrl;

  const { useGet, usePost } = useApi();
  const queryClient = useQueryClient();
  const url = `/athletes/${athleteSlug}/newsletters/${newsletterId}/engagement/${block.id}`;
  const queryKey = ["get", { url, params: undefined }] as const;

  const { data, isLoading } = useGet(url, undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    enabled: !externalUrl && !previewMode,
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
        {labels.engagementEyebrows.survey}
      </div>
      <h4 className="text-base font-bold text-ink">{block.title}</h4>
      {paragraphs.length > 0 ? (
        <div className="space-y-2 text-sm text-ink-2">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : null}
      {externalUrl ? (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full cursor-pointer items-center justify-center rounded bg-action px-4 py-3 font-display text-[13px] font-bold uppercase tracking-[0.12em] text-cream"
        >
          {labels.ctas.learnMore}
        </a>
      ) : isLoading && !data ? (
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
            mutate({ kind: "survey", text: trimmed });
          }}
          className="space-y-3"
        >
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={labels.engagementInteractive.yourAnswerPlaceholder}
            maxLength={TEXT_MAX}
            rows={4}
          />
          <Button type="submit" disabled={isPending || text.trim().length === 0}>
            {isPending
              ? labels.engagementInteractive.submitting
              : labels.engagementInteractive.submit}
          </Button>
        </form>
      )}
    </div>
  );
}
