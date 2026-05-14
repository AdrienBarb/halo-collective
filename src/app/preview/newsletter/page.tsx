"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type {
  Athlete,
  Newsletter,
  NewsletterSection,
  Sponsor,
} from "@prisma/client";
import AthleteProfile from "@/components/athlete/AthleteProfile";
import useApi from "@/lib/hooks/useApi";
import {
  NEWSLETTER_PREVIEW_API_ROUTE,
  NEWSLETTER_PREVIEW_STORAGE_KEY,
} from "@/lib/newsletter/preview";
import { cn } from "@/lib/utils";

type Engine = "react-email" | "mjml";

interface PreviewPayload {
  athleteId: string;
  newsletterId?: string;
  header: Record<string, unknown>;
  sections: Array<{ type: string; blocks: unknown }>;
  stashedAt: number;
}

interface PreviewResponse {
  athlete: Athlete & { sponsors: Sponsor[] };
  newsletter: Newsletter & { sections: NewsletterSection[] };
  emailHtml: string;
}

type ViewMode = "web" | "email";

type PayloadState =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "ready"; payload: PreviewPayload }
  | { kind: "invalid" };

function readStashedPayload(): PayloadState {
  // Don't remove the entry on read — keeping it lets the user toggle the
  // ?engine=mjml query param via the toolbar without losing the payload
  // (the editor overwrites the entry on each new "Preview" click anyway).
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(NEWSLETTER_PREVIEW_STORAGE_KEY);
  } catch {
    return { kind: "missing" };
  }
  if (!raw) return { kind: "missing" };
  try {
    return { kind: "ready", payload: JSON.parse(raw) as PreviewPayload };
  } catch {
    return { kind: "invalid" };
  }
}

export default function NewsletterPreviewPage() {
  const { usePost } = useApi();
  const preview = usePost(NEWSLETTER_PREVIEW_API_ROUTE);
  const [view, setView] = useState<ViewMode>("web");
  const [payloadState, setPayloadState] = useState<PayloadState>({
    kind: "loading",
  });
  const searchParams = useSearchParams();
  const engine: Engine =
    searchParams?.get("engine") === "mjml" ? "mjml" : "react-email";

  // Defer the localStorage read to mount: reading it during render or in
  // useState's initializer would diverge between SSR ("missing") and
  // client ("ready"), producing a hydration mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPayloadState(readStashedPayload());
  }, []);

  useEffect(() => {
    if (payloadState.kind !== "ready") return;
    preview.mutate({ ...payloadState.payload, engine });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payloadState, engine]);

  const backHref =
    payloadState.kind === "ready" && payloadState.payload.newsletterId
      ? `/admin/newsletters/${payloadState.payload.newsletterId}`
      : "/admin/newsletters/new";

  const data = preview.data as PreviewResponse | undefined;
  const errorMessage =
    preview.error instanceof Error
      ? preview.error.message
      : preview.error
        ? "Preview failed"
        : null;

  const disabled =
    payloadState.kind !== "ready" ||
    preview.isPending ||
    errorMessage !== null ||
    !data;

  return (
    <div className="min-h-screen bg-cream">
      <PreviewToolbar
        view={view}
        onChange={setView}
        backHref={backHref}
        disabled={disabled}
        engine={engine}
      />
      {payloadState.kind === "missing" ? (
        <EmptyState />
      ) : payloadState.kind === "invalid" ? (
        <ErrorState message="Could not read preview data" />
      ) : errorMessage ? (
        <ErrorState message={errorMessage} />
      ) : !data ? (
        <LoadingState />
      ) : view === "web" ? (
        <WebPreview data={data} />
      ) : (
        <EmailPreview html={data.emailHtml} />
      )}
    </div>
  );
}

function WebPreview({ data }: { data: PreviewResponse }) {
  const editions = useMemo(() => {
    const n = data.newsletter;
    return [
      {
        ...n,
        publishedAt: n.publishedAt ? new Date(n.publishedAt) : null,
        editionDate: n.editionDate ? new Date(n.editionDate) : null,
        tournamentStartDate: n.tournamentStartDate
          ? new Date(n.tournamentStartDate)
          : null,
        tournamentEndDate: n.tournamentEndDate
          ? new Date(n.tournamentEndDate)
          : null,
        createdAt: new Date(n.createdAt),
        updatedAt: new Date(n.updatedAt),
        sections: n.sections.map((s) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        })),
      },
    ];
  }, [data.newsletter]);

  return (
    <AthleteProfile
      athlete={data.athlete}
      editions={editions}
      selectedSlug={data.newsletter.slug}
      isSignedIn
      isSubscribed
      ipCountryCode={null}
      previewMode
    />
  );
}

function EmailPreview({ html }: { html: string }) {
  return (
    <div className="mx-auto max-w-[820px] px-4 py-6">
      <iframe
        title="Email preview"
        srcDoc={html}
        sandbox=""
        className="h-[calc(100vh-140px)] w-full rounded-sm border border-line bg-white"
      />
    </div>
  );
}

function PreviewToolbar({
  view,
  onChange,
  backHref,
  disabled,
  engine,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
  backHref: string;
  disabled: boolean;
  engine: Engine;
}) {
  const otherEngine: Engine = engine === "mjml" ? "react-email" : "mjml";
  return (
    <div className="sticky top-0 z-50 border-b border-line bg-ink text-cream">
      <div className="mx-auto flex max-w-[820px] flex-wrap items-center justify-between gap-3 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-accent-gold px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink">
            Preview
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em]",
              engine === "mjml"
                ? "bg-cream text-ink"
                : "bg-cream/15 text-cream",
            )}
            title={`Renderer: ${engine}`}
          >
            {engine === "mjml" ? "MJML" : "React Email"}
          </span>
          <div
            role="tablist"
            aria-label="Preview surface"
            className={cn(
              "inline-flex overflow-hidden rounded-xs border border-cream/20",
              disabled && "opacity-50",
            )}
          >
            {(["web", "email"] as const).map((opt) => {
              const active = view === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled={disabled}
                  onClick={() => onChange(opt)}
                  className={cn(
                    "min-h-8 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors",
                    active
                      ? "bg-cream text-ink"
                      : "text-cream/70 hover:text-cream",
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`?engine=${otherEngine}`}
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-cream/70 transition-colors hover:text-cream"
          >
            Switch → {otherEngine === "mjml" ? "MJML" : "React Email"}
          </Link>
          <Link
            href={backHref}
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-cream/80 transition-colors hover:text-cream"
          >
            ← Back to editor
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto max-w-[820px] px-6 py-20 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
        Rendering preview…
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-[640px] px-6 py-20 text-center">
      <p className="font-serif text-[22px] text-ink">No preview data.</p>
      <p className="mt-2 text-[14px] text-ink-3">
        Open this page from the newsletter editor&apos;s Preview button.
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-[640px] px-6 py-20 text-center">
      <p className="font-serif text-[22px] text-ink">Preview failed</p>
      <p className="mt-2 break-words font-mono text-[12px] text-ink-3">
        {message}
      </p>
    </div>
  );
}
