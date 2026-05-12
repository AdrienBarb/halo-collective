import Image from "next/image";
import { useTranslations } from "next-intl";
import type { MediaBlock as MediaBlockType } from "@/lib/schemas/newsletterSection";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import { parseYouTubeId } from "@/lib/newsletter/youtube";
import YouTubeEmbed from "@/components/newsletter/blocks/YouTubeEmbed";

interface MediaBlockProps {
  media: MediaBlockType;
}

export default function MediaBlock({ media }: MediaBlockProps) {
  const t = useTranslations("Newsletter.Media");
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
    const youtubeId = parseYouTubeId(media.url);
    if (youtubeId) {
      return (
        <YouTubeEmbed
          videoId={youtubeId}
          thumbnailUrl={media.thumbnailUrl}
          label={t("watchOnYoutube")}
        />
      );
    }

    return (
      <video
        src={media.url}
        controls
        playsInline
        poster={media.thumbnailUrl ?? undefined}
        preload="metadata"
        className="aspect-video w-full overflow-hidden rounded-lg bg-ink"
        aria-label={t("watchVideo")}
      />
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
