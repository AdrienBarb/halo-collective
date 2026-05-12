"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import type { PrizeDrawBlock as PrizeDrawBlockType } from "@/lib/schemas/newsletterSection";
import type { EngagementSnapshot } from "@/lib/services/fanEngagement";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import { Button } from "@/components/ui/button";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import useApi from "@/lib/hooks/useApi";
import MediaBlock from "@/components/newsletter/blocks/MediaBlock";

interface PrizeDrawBlockProps {
  block: PrizeDrawBlockType;
  athleteSlug: string;
  newsletterId: string;
  previewMode?: boolean;
}

export default function PrizeDrawBlock({
  block,
  athleteSlug,
  newsletterId,
  previewMode = false,
}: PrizeDrawBlockProps) {
  const tErrors = useTranslations("Errors.Generic");
  const locale = useLocale() as "en" | "fr";
  const labels = getNewsletterLabels(locale);
  const paragraphs = splitParagraphs(block.body);
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
  const [consent, setConsent] = useState(false);

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

  const isClosed = Boolean(data?.isClosed);
  const isEntered = Boolean(data?.userResponse?.consentGiven);
  const ctaLabel = block.ctaLabel ?? labels.engagementInteractive.enterDraw;

  return (
    <div className="space-y-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-action">
        {labels.engagementEyebrows.prize_draw}
      </div>
      {block.prizeMedia ? <MediaBlock media={block.prizeMedia} /> : null}
      <h4 className="text-base font-bold text-ink">{block.title}</h4>
      {paragraphs.length > 0 ? (
        <div className="space-y-2 text-sm text-ink-2">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : null}
      {isLoading && !data ? (
        <div className="h-20 animate-pulse rounded bg-line/30" aria-hidden />
      ) : isClosed ? (
        <div className="rounded border border-line bg-cream-2 px-4 py-3 font-mono text-[10px] uppercase tracking-wide text-ink-3">
          {labels.engagementInteractive.drawClosed}
        </div>
      ) : isEntered ? (
        <div className="rounded border border-emerald-300 bg-emerald-50 px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-emerald-800">
          {labels.engagementInteractive.inDraw}
        </div>
      ) : (
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 cursor-pointer rounded border-line"
            />
            <span>{labels.engagementInteractive.drawConsent}</span>
          </label>
          <Button
            type="button"
            disabled={!consent || isPending}
            onClick={() => mutate({ kind: "prize_draw", consentGiven: true })}
            className="w-full"
          >
            {isPending ? labels.engagementInteractive.submitting : ctaLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
