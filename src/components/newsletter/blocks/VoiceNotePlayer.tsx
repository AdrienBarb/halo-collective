"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AudioMedia } from "@/lib/schemas/newsletterSection";

interface VoiceNotePlayerProps {
  media: AudioMedia;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VoiceNotePlayer({ media }: VoiceNotePlayerProps) {
  const t = useTranslations("Newsletter.Media");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      void audio.play().then(() => setIsPlaying(true));
    }
  };

  const progressPct =
    duration && duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const timeLabel = duration
    ? `${formatTime(currentTime)} / ${formatTime(duration)}`
    : media.durationLabel ?? null;

  const meta = [media.location, timeLabel].filter(Boolean).join(" · ");
  const buttonLabel = isPlaying
    ? t("pauseVoiceNote", {
        hasTitle: media.title ? "yes" : "no",
        title: media.title ?? "",
      })
    : t("playVoiceNote", {
        hasTitle: media.title ? "yes" : "no",
        title: media.title ?? "",
      });

  return (
    <div className="flex min-h-11 items-center gap-4 rounded-lg border border-line bg-cream-2 p-4">
      <audio ref={audioRef} src={media.url} preload="metadata" />
      <button
        type="button"
        onClick={toggle}
        aria-label={buttonLabel}
        aria-pressed={isPlaying}
        className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-action text-cream transition hover:bg-action/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-cream-2"
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 fill-current" aria-hidden="true" />
        ) : (
          <Play className="h-5 w-5 translate-x-[1px] fill-current" aria-hidden="true" />
        )}
      </button>
      <div className="min-w-0 flex-1">
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
        {duration && duration > 0 ? (
          <div
            aria-hidden="true"
            className="mt-2 h-1 w-full overflow-hidden rounded-full bg-line"
          >
            <div
              className="h-full bg-action transition-[width] duration-150"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
