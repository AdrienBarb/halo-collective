"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useApi from "@/lib/hooks/useApi";
import { useConfirm } from "@/components/providers/ConfirmProvider";

type NewsletterStatus = "DRAFT" | "SENDING" | "PUBLISHED";

interface PublishToggleProps {
  newsletterId: string;
  status: NewsletterStatus;
  updatedAt: string;
}

interface PolledStatus {
  status?: NewsletterStatus;
  updatedAt?: string;
}

// Show the Retry button once the row has been SENDING this long.
// Mirrors `RETRY_MIN_AGE_MS` in the retry route — the server rejects
// earlier retries with a 409, so the UI hides the button to match.
const RETRY_THRESHOLD_MS = 6 * 60 * 1000;

// While SENDING we poll the status endpoint so the toggle updates as
// soon as `after()` (or a retry) finishes the Brevo work.
const SENDING_POLL_INTERVAL_MS = 5_000;

// Tick interval for the elapsed-time display. The retry threshold is
// in minutes, so coarse updates are fine.
const ELAPSED_TICK_INTERVAL_MS = 30_000;

export default function PublishToggle({
  newsletterId,
  status: initialStatus,
  updatedAt: initialUpdatedAt,
}: PublishToggleProps) {
  const router = useRouter();
  const { useGet, usePost } = useApi();
  const confirm = useConfirm();

  const { data: polledRow } = useGet(
    `/admin/newsletters/${newsletterId}/status`,
    undefined,
    {
      enabled: initialStatus === "SENDING",
      refetchInterval:
        initialStatus === "SENDING" ? SENDING_POLL_INTERVAL_MS : false,
      refetchIntervalInBackground: false,
    },
  );
  const polled = polledRow as PolledStatus | undefined;

  // Authoritative status combines server-rendered prop + poll. Poll
  // wins once we have one — it's strictly newer than props (which
  // only refresh on router.refresh).
  const status: NewsletterStatus = polled?.status ?? initialStatus;
  const sendingSince = polled?.updatedAt ?? initialUpdatedAt;

  // Toast + refresh when the row leaves SENDING.
  const prevStatusRef = useRef<NewsletterStatus>(initialStatus);
  useEffect(() => {
    const prev = prevStatusRef.current;
    if (prev === status) return;
    prevStatusRef.current = status;
    if (prev === "SENDING" && status === "PUBLISHED") {
      toast.success("Newsletter sent");
      router.refresh();
    } else if (prev === "SENDING" && status === "DRAFT") {
      toast.error("Send failed — newsletter returned to draft");
      router.refresh();
    }
  }, [status, router]);

  // Elapsed-time tick. Only runs while SENDING; React Query handles
  // poll cadence, this just keeps the "(N min)" label fresh enough
  // to flip the Retry button on once we cross the threshold.
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (status !== "SENDING") return;
    const interval = setInterval(
      () => forceTick((t) => t + 1),
      ELAPSED_TICK_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, [status]);

  const publish = usePost(`/admin/newsletters/${newsletterId}/publish`, {
    onSuccess: (data: { status?: NewsletterStatus }) => {
      if (data?.status === "PUBLISHED") {
        toast.success("Newsletter published");
      } else {
        toast.success(
          "Newsletter sending — editing is locked until it completes",
        );
      }
      router.refresh();
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error ?? "Failed to publish");
    },
  });

  const retry = usePost(`/admin/newsletters/${newsletterId}/publish/retry`, {
    onSuccess: () => {
      toast.success("Retry started — checking status");
      router.refresh();
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error ?? "Retry failed");
    },
  });

  const unpublish = usePost(`/admin/newsletters/${newsletterId}/unpublish`, {
    onSuccess: () => {
      toast.success("Moved back to draft");
      router.refresh();
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error ?? "Failed to unpublish");
    },
  });

  if (status === "SENDING") {
    // Intentional re-read on every render — `forceTick` above keeps
    // this fresh on a 30s interval so the elapsed-minutes label and
    // the Retry-button gate cross the threshold without a manual
    // refresh.
    // eslint-disable-next-line react-hooks/purity
    const elapsedMs = Date.now() - new Date(sendingSince).getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 60_000);
    const canRetry = elapsedMs >= RETRY_THRESHOLD_MS;

    return (
      <div
        className="inline-flex items-center gap-3"
        role="status"
        aria-live="polite"
      >
        <button
          type="button"
          disabled
          aria-busy="true"
          className="inline-flex items-center gap-2 rounded-md border border-line bg-cream-2 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-3 disabled:cursor-progress"
        >
          Sending…
          {elapsedMinutes > 0 ? (
            <span className="text-ink-3/70">({elapsedMinutes} min)</span>
          ) : null}
        </button>
        {canRetry ? (
          <button
            type="button"
            onClick={() => retry.mutate({})}
            disabled={retry.isPending}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-line bg-cream px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-2 transition-colors duration-200 ease-out hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
            title="Send appears stuck. Retry safely — the worker is idempotent."
          >
            {retry.isPending ? "Retrying…" : "Retry send"}
          </button>
        ) : null}
      </div>
    );
  }

  if (status === "DRAFT") {
    return (
      <button
        type="button"
        onClick={() => publish.mutate({})}
        disabled={publish.isPending}
        className="group inline-flex cursor-pointer items-center gap-2 rounded-md bg-ink px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-cream transition-[background-color,transform] duration-200 ease-out hover:bg-banner disabled:cursor-not-allowed disabled:opacity-60"
      >
        {publish.isPending ? "Publishing…" : "Publish edition"}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="-mr-1 transition-transform duration-200 ease-out group-hover:translate-x-[2px]"
          aria-hidden
        >
          <path d="M5 12h14" />
          <path d="m13 5 7 7-7 7" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        confirm({
          title: "Unpublish this edition?",
          description:
            "Move this published edition back to draft? It will disappear from the live site.",
          confirmText: "Unpublish",
          variant: "destructive",
          onConfirm: async () => {
            try {
              await unpublish.mutateAsync({});
            } catch {
              // Error already surfaced by mutation's onError toast.
            }
          },
        });
      }}
      disabled={unpublish.isPending}
      className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-line bg-cream-2 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-2 transition-colors duration-200 ease-out hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
    >
      {unpublish.isPending ? "Unpublishing…" : "Unpublish"}
    </button>
  );
}
