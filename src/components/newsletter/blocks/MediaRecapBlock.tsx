import type { MediaRecapBlock as MediaRecapBlockType } from "@/lib/schemas/newsletterSection";
import MediaLinkRow from "@/components/newsletter/blocks/MediaLinkRow";

interface MediaRecapBlockProps {
  block: MediaRecapBlockType;
}

export default function MediaRecapBlock({ block }: MediaRecapBlockProps) {
  return (
    <div className="space-y-2">
      <MediaLinkGroupHeader />
      <div>
        {block.links.map((link, i) => (
          <MediaLinkRow key={i} link={link} />
        ))}
      </div>
    </div>
  );
}

export function MediaLinkGroupHeader() {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
      What they wrote
    </div>
  );
}
