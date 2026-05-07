import Image from "next/image";
import Link from "next/link";
import type { Athlete } from "@/data/athletes";

type RosterCardProps = {
  athlete: Athlete;
};

export default function RosterCard({ athlete }: RosterCardProps) {
  return (
    <Link
      href={`/${athlete.slug}`}
      data-slug={athlete.slug}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-cream-2 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[3px] hover:[box-shadow:0_10px_28px_rgba(0,0,0,0.10)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[linear-gradient(135deg,#5a6478_0%,#2c3340_100%)]">
        <Image
          src={athlete.hero}
          alt={athlete.name}
          fill
          sizes="(max-width: 620px) 100vw, (max-width: 980px) 50vw, 33vw"
          className="object-cover"
          style={{ objectPosition: athlete.heroFocus }}
          priority
        />
      </div>
      <div className="flex h-1">
        {athlete.flag.map((color, i) => (
          <span
            key={i}
            className="flex-1"
            style={{ background: color }}
            aria-hidden
          />
        ))}
      </div>
      <div className="px-5 pb-5 pt-[18px]">
        <h3 className="m-0 font-serif text-[22px] font-semibold leading-[1.1] tracking-[-0.015em] text-ink">
          {athlete.name}
        </h3>
        <div className="mt-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-3">
          {athlete.rank}
        </div>
      </div>
    </Link>
  );
}
