import type { NewsletterStatus } from "@prisma/client";

const TONE: Record<NewsletterStatus, string> = {
  PUBLISHED: "border-ok/30 bg-ok/10 text-ok",
  SENDING: "border-accent-gold/30 bg-accent-gold/10 text-accent-gold",
  DRAFT: "border-line bg-cream-3 text-ink-2",
};

const DOT: Record<NewsletterStatus, string> = {
  PUBLISHED: "bg-ok",
  SENDING: "bg-accent-gold",
  DRAFT: "bg-ink-3",
};

const LABEL: Record<NewsletterStatus, string> = {
  PUBLISHED: "Published",
  SENDING: "Sending",
  DRAFT: "Draft",
};

export default function NewsletterStatusPill({
  status,
}: {
  status: NewsletterStatus;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-pill border px-3 py-1.5",
        "font-sans text-[10px] font-medium uppercase tracking-[0.22em]",
        TONE[status],
      ].join(" ")}
    >
      <span
        aria-hidden
        className={["h-1.5 w-1.5 rounded-full", DOT[status]].join(" ")}
      />
      {LABEL[status]}
    </span>
  );
}
