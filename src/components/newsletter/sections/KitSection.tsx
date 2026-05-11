import Image from "next/image";
import type { KitContent } from "@/lib/schemas/newsletterSection";

interface KitSectionProps {
  content: KitContent;
}

export default function KitSection({ content }: KitSectionProps) {
  return (
    <div className="space-y-6">
      {content.imageUrl ? (
        <Image
          src={content.imageUrl}
          alt=""
          width={1200}
          height={630}
          className="h-auto w-full rounded"
          unoptimized
        />
      ) : null}

      {content.body ? (
        <div className="space-y-3 text-[15px] leading-[1.75] text-ink-2">
          {content.body.split(/\n{2,}/).map((p, i) => (
            <p key={i} className="font-serif italic">
              {p.trim()}
            </p>
          ))}
        </div>
      ) : null}

      {content.cta && content.cta.url ? (
        <a
          href={content.cta.url}
          target="_blank"
          rel="noreferrer"
          className="block bg-action px-6 py-4 text-center font-mono text-xs font-bold uppercase tracking-[0.18em] text-cream"
        >
          {content.cta.label} →
        </a>
      ) : null}
    </div>
  );
}
