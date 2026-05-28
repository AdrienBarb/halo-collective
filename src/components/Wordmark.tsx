import Link from "next/link";

type WordmarkProps = {
  href?: string | null;
  size?: "default" | "large";
  className?: string;
};

export default function Wordmark({
  href = "/",
  size = "default",
  className = "",
}: WordmarkProps) {
  const haloSize = size === "large" ? "text-[24px]" : "text-[20px]";
  const collectiveSize = size === "large" ? "text-[13px]" : "text-[12px]";

  const content = (
    <>
      <span
        className={`font-display font-bold uppercase ${haloSize} tracking-[-0.005em] text-ink`}
      >
        HALO
      </span>
      <span
        className={`font-display font-normal uppercase ${collectiveSize} tracking-[0.12em] text-ink-3`}
      >
        COLLECTIVE
      </span>
    </>
  );

  if (!href) {
    return (
      <span
        aria-label="Halo Collective"
        className={`inline-flex items-baseline gap-1.5 ${className}`}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label="Halo Collective home"
      className={`inline-flex items-baseline gap-1.5 ${className}`}
    >
      {content}
    </Link>
  );
}
