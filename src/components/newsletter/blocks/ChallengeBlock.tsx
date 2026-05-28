"use client";

import toast from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import type { ChallengeBlock as ChallengeBlockType } from "@/lib/schemas/newsletterSection";
import type { EngagementSnapshot } from "@/lib/services/fanEngagement";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import useApi from "@/lib/hooks/useApi";
import MediaBlock from "@/components/newsletter/blocks/MediaBlock";

interface ChallengeBlockProps {
  block: ChallengeBlockType;
  athleteSlug: string;
  newsletterId: string;
  previewMode?: boolean;
}

export default function ChallengeBlock({
  block,
  athleteSlug,
  newsletterId,
  previewMode = false,
}: ChallengeBlockProps) {
  const tErrors = useTranslations("Errors.Generic");
  const locale = useLocale() as "en" | "fr";
  const labels = getNewsletterLabels(locale);
  const paragraphs = splitParagraphs(block.brief);
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

  const reacted = Boolean(data?.userResponse?.reaction);
  const count = data?.aggregate?.totalResponses ?? 0;

  return (
    <div className="space-y-4">
      <div className="font-sans text-[10px] uppercase tracking-[0.18em] text-action">
        {labels.engagementEyebrows.challenge}
      </div>
      <h4 className="text-base font-bold text-ink">{block.title}</h4>
      {block.media ? <MediaBlock media={block.media} /> : null}
      <div className="space-y-2 text-sm text-ink-2">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {isLoading && !data ? (
        <div className="h-12 animate-pulse rounded bg-line/30" aria-hidden />
      ) : (
        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={reacted || isPending}
            onClick={() => mutate({ kind: "challenge", reaction: "✊" })}
            className={`inline-flex cursor-pointer items-center gap-2 rounded border px-4 py-2 text-sm font-bold uppercase tracking-wide transition disabled:cursor-not-allowed ${
              reacted
                ? "border-action bg-action/10 text-action"
                : "border-action bg-action text-cream hover:bg-action/90"
            } disabled:opacity-80`}
          >
            {reacted
              ? labels.engagementInteractive.youDidIt
              : labels.engagementInteractive.iDidIt}
          </button>
          <span className="font-sans text-xs uppercase tracking-wide text-ink-3">
            {labels.engagementInteractive.reactionCountTemplate.replace(
              "{count}",
              count.toString(),
            )}
          </span>
        </div>
      )}
    </div>
  );
}
