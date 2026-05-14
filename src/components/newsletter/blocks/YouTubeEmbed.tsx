interface YouTubeEmbedProps {
  videoId: string;
  label: string;
}

export default function YouTubeEmbed({ videoId, label }: YouTubeEmbedProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-ink">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={label}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
