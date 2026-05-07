import Link from "next/link";

type WordmarkProps = {
  href?: string;
  size?: "default" | "large";
  className?: string;
};

export default function Wordmark({
  href = "/",
  size = "default",
  className = "",
}: WordmarkProps) {
  const haloSize = size === "large" ? "text-[22px]" : "text-[18px]";
  const collectiveSize = size === "large" ? "text-[11px]" : "text-[10px]";

  return (
    <Link
      href={href}
      aria-label="Halo Collective home"
      className={`inline-flex items-baseline gap-1.5 ${className}`}
    >
      <span
        className={`font-serif italic font-semibold ${haloSize} tracking-[-0.02em] text-ink`}
      >
        HALO
      </span>
      <span
        className={`font-mono font-semibold ${collectiveSize} tracking-[0.22em] uppercase text-ink-3`}
      >
        COLLECTIVE
      </span>
    </Link>
  );
}
