import Image from "next/image";
import type { MediaBlock as MediaBlockType } from "@/lib/schemas/newsletterSection";

interface MediaBlockProps {
  media: MediaBlockType;
}

export default function MediaBlock({ media }: MediaBlockProps) {
  if (media.kind === "video") {
    return (
      <a
        href={media.videoUrl}
        target="_blank"
        rel="noreferrer"
        className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-ink"
      >
        {media.thumbnailUrl ? (
          <Image
            src={media.thumbnailUrl}
            alt=""
            fill
            sizes="(max-width: 820px) 100vw, 820px"
            className="object-cover"
            unoptimized
          />
        ) : null}
        <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-action text-2xl text-cream shadow-lg">
          ▶
        </span>
      </a>
    );
  }

  return (
    <a
      href={media.audioUrl}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-4 rounded-lg border border-line bg-cream-2 p-4 transition hover:border-line-2"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-action text-lg text-cream">
        ▶
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">
          {media.title}
        </span>
        <span className="mt-1 block truncate font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
          {media.location} · {media.durationLabel}
        </span>
      </span>
    </a>
  );
}
