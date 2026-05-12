import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { MediaBlock as MediaBlockType } from "@/lib/schemas/newsletterSection";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import { parseYouTubeId } from "@/lib/newsletter/youtube";

interface MediaBlockProps {
  media: MediaBlockType;
}

export default async function MediaBlock({ media }: MediaBlockProps) {
  const t = await getTranslations("Newsletter.Media");
  if (media.kind === "text") {
    const paragraphs = splitParagraphs(media.body);
    return (
      <div className="space-y-3 leading-relaxed text-ink-2">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    );
  }

  if (media.kind === "image") {
    // Empty alt is the explicit signal for decorative — Next/Image
    // still requires the prop, screen readers will skip the element.
    const alt = media.alt?.trim() ?? "";
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-cream-3">
        <Image
          src={media.url}
          alt={alt}
          fill
          sizes="(max-width: 820px) 100vw, 820px"
          className="object-cover"
          unoptimized
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (media.kind === "video") {
    const youtube = parseYouTubeId(media.url);
    const label = youtube ? t("watchOnYoutube") : t("watchVideo");
    return (
      <a
        href={media.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        referrerPolicy="no-referrer"
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
            referrerPolicy="no-referrer"
          />
        ) : null}
        <span
          aria-hidden="true"
          className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-action text-2xl text-cream shadow-lg"
        >
          ▶
        </span>
        {youtube ? (
          <span className="absolute bottom-3 right-3 z-10 rounded bg-ink/80 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-cream">
            YouTube
          </span>
        ) : null}
      </a>
    );
  }

  // audio
  const meta = [media.location, media.durationLabel].filter(Boolean).join(" · ");
  const audioLabel = t("playVoiceNote", {
    hasTitle: media.title ? "yes" : "no",
    title: media.title ?? "",
  });
  return (
    <a
      href={media.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={audioLabel}
      className="flex min-h-11 items-center gap-4 rounded-lg border border-line bg-cream-2 p-4 transition hover:border-line-2"
    >
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-action text-lg text-cream"
      >
        ▶
      </span>
      <span className="min-w-0 flex-1">
        {media.title ? (
          <span className="block truncate text-sm font-semibold text-ink">
            {media.title}
          </span>
        ) : null}
        {meta ? (
          <span className="mt-1 block truncate font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
            {meta}
          </span>
        ) : null}
      </span>
    </a>
  );
}
