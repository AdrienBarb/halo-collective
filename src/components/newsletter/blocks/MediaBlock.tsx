import Image from "next/image";
import { useTranslations } from "next-intl";
import type { MediaBlock as MediaBlockType } from "@/lib/schemas/newsletterSection";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import { parseYouTubeId } from "@/lib/newsletter/youtube";
import YouTubeEmbed from "@/components/newsletter/blocks/YouTubeEmbed";
import VoiceNotePlayer from "@/components/newsletter/blocks/VoiceNotePlayer";

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
      <div className="overflow-hidden rounded-lg bg-cream-3">
        <Image
          src={media.url}
          alt={alt}
          width={820}
          height={1000}
          sizes="(max-width: 820px) 100vw, 820px"
          className="h-auto w-full"
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
  return <VoiceNotePlayer media={media} />;
}
