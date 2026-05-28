import Image from "next/image";
import Link from "next/link";
import type { Athlete } from "@prisma/client";
import { flagFor } from "@/lib/athlete/flag";

export type RosterAthlete = Pick<
  Athlete,
  "slug" | "firstName" | "lastName" | "tour" | "worldRank" | "countryCode" | "avatarUrl"
>;

type RosterCardProps = {
  athlete: RosterAthlete;
};

export default function RosterCard({ athlete }: RosterCardProps) {
  const fullName = `${athlete.firstName} ${athlete.lastName}`;
  const rankLabel = athlete.tour
    ? `${athlete.tour} #${athlete.worldRank}`
    : athlete.worldRank
      ? `#${athlete.worldRank}`
      : "";
  const flag = flagFor(athlete.countryCode);

  return (
    <Link
      href={`/${athlete.slug}`}
      data-slug={athlete.slug}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-cream-2 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[3px] hover:[box-shadow:0_10px_28px_rgba(0,0,0,0.10)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[linear-gradient(135deg,#5a6478_0%,#2c3340_100%)]">
        {athlete.avatarUrl ? (
          <Image
            src={athlete.avatarUrl}
            alt={fullName}
            fill
            sizes="(max-width: 620px) 100vw, (max-width: 980px) 50vw, 33vw"
            className="object-cover"
            priority
            unoptimized
          />
        ) : null}
      </div>
      <div className="flex h-1">
        {flag.stripe.map((color, i) => (
          <span
            key={i}
            className="flex-1"
            style={{ background: color }}
            aria-hidden
          />
        ))}
      </div>
      <div className="px-5 pb-5 pt-[18px]">
        <h3 className="m-0 font-display text-[22px] font-extrabold italic uppercase leading-[1.05] tracking-[-0.01em] text-ink">
          {fullName}
        </h3>
        {rankLabel ? (
          <div className="mt-1.5 font-display text-[14px] font-extrabold italic uppercase tracking-[0.02em] text-ink-3">
            {rankLabel}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
