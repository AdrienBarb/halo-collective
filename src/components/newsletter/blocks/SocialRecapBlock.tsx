import type { SocialRecapBlock as SocialRecapBlockType } from "@/lib/schemas/newsletterSection";

interface SocialRecapBlockProps {
  block: SocialRecapBlockType;
}

export default function SocialRecapBlock({ block }: SocialRecapBlockProps) {
  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
        Social recap
      </div>
      <ul className="space-y-2">
        {block.posts.map((post, i) => (
          <li key={i}>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded border border-line bg-cream-2 p-3 transition hover:border-line-2"
            >
              {post.caption ? (
                <span className="block text-sm text-ink">{post.caption}</span>
              ) : null}
              <span className="mt-1 block truncate font-mono text-[10px] uppercase tracking-wide text-action">
                {post.url} →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
