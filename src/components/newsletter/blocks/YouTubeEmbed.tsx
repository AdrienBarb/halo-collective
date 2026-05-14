"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";

interface YouTubeEmbedProps {
  videoId: string;
  label: string;
}

export default function YouTubeEmbed({ videoId, label }: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-ink">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={label}
      className="relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-ink"
    >
      <Image
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        fill
        sizes="(max-width: 820px) 100vw, 820px"
        className="object-cover"
        unoptimized
        referrerPolicy="no-referrer"
      />
      <span
        aria-hidden="true"
        className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-action text-cream shadow-lg"
      >
        <Play className="h-7 w-7 translate-x-[2px] fill-current" aria-hidden="true" />
      </span>
      <span className="absolute bottom-3 right-3 z-10 rounded bg-ink/80 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-cream">
        YouTube
      </span>
    </button>
  );
}
