"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useApi from "@/lib/hooks/useApi";
import { useConfirm } from "@/components/providers/ConfirmProvider";

interface PublishToggleProps {
  newsletterId: string;
  status: "DRAFT" | "SENDING" | "PUBLISHED";
}

export default function PublishToggle({
  newsletterId,
  status,
}: PublishToggleProps) {
  const router = useRouter();
  const { usePost } = useApi();
  const confirm = useConfirm();

  const publish = usePost(`/admin/newsletters/${newsletterId}/publish`, {
    onSuccess: () => {
      toast.success("Newsletter published");
      router.refresh();
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error ?? "Failed to publish");
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
    return (
      <span className="inline-flex items-center gap-2 rounded-md border border-line bg-cream-2 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-3">
        Send in progress
      </span>
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
              // Error is already surfaced via the mutation's onError toast.
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
