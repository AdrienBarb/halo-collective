import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type {
  Athlete,
  Newsletter,
  NewsletterSection,
  Sponsor,
} from "@prisma/client";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { formatShortDateNoYear } from "@/lib/utils/formatDate";
import {
  FaInstagram,
  FaXTwitter,
  FaTiktok,
  FaFacebook,
  FaLinkedin,
  FaHeart,
} from "react-icons/fa6";
import { flagFor } from "@/lib/athlete/flag";
import SectionRenderer, {
  type RawSection,
} from "@/components/newsletter/SectionRenderer";
import type {
  EditionModeValue,
  SectionTypeValue,
} from "@/lib/schemas/newsletterSection";
import SubscribeButton from "@/components/athlete/SubscribeButton";
import EditionTabsClient, {
  type EditionTab,
} from "@/components/athlete/EditionTabsClient";

type EditionWithSections = Newsletter & {
  sections: NewsletterSection[];
};

type AthleteWithSponsors = Athlete & { sponsors: Sponsor[] };

interface AthleteProfileProps {
  athlete: AthleteWithSponsors;
  editions: EditionWithSections[];
  selectedSlug: string | null;
  isSignedIn: boolean;
  isSubscribed: boolean;
  ipCountryCode: string | null;
  previewMode?: boolean;
}

function toRawSection(section: NewsletterSection): RawSection {
  return {
    id: section.id,
    type: section.type as SectionTypeValue,
    order: section.order,
    eyebrow: section.eyebrow,
    title: section.title,
    blocks: section.blocks,
  };
}

function toEditionTab(edition: EditionWithSections): EditionTab {
  return {
    id: edition.id,
    slug: edition.slug,
    title: edition.title,
    heroImageUrl: edition.heroImageUrl,
    editionNumber: edition.editionNumber,
    publishedAt: edition.publishedAt
      ? new Date(edition.publishedAt).toISOString()
      : null,
  };
}

export default function AthleteProfile({
  athlete,
  editions,
  selectedSlug,
  isSignedIn,
  isSubscribed,
  ipCountryCode,
  previewMode = false,
}: AthleteProfileProps) {
  const fullName = `${athlete.firstName} ${athlete.lastName}`;
  const flag = flagFor(athlete.countryCode);
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = useTranslations("Athlete.Profile");

  const defaultEdition = editions[0] ?? null;
  const selected =
    editions.find((e) => e.slug === selectedSlug) ?? defaultEdition;

  const issueMeta =
    selected && selected.publishedAt
      ? `#${selected.editionNumber.toString().padStart(2, "0")} · ${formatShortDateNoYear(
          new Date(selected.publishedAt),
          locale,
        ).toUpperCase()}`
      : null;

  // Anonymous visitors get a single-purpose gate: only the subscribe card,
  // inside the standard cream layout (navbar + footer stay).
  // Subscription requires a user account, so !isSignedIn implies !isSubscribed.
  if (!isSignedIn && !previewMode) {
    return (
      <div className="bg-cream">
        <div className="mx-auto max-w-[820px] border-x border-line bg-cream-2">
          <SubscribeButton
            athleteSlug={athlete.slug}
            athleteFirstName={athlete.firstName}
            athleteLastName={athlete.lastName}
            athleteAvatarUrl={athlete.avatarUrl}
            isSignedIn={isSignedIn}
            isSubscribed={isSubscribed}
            ipCountryCode={ipCountryCode}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-[820px] border-x border-line bg-cream-2">
        <ProfileCover
          coverUrl={selected?.heroImageUrl ?? athlete.coverImageUrl ?? null}
          flag={flag}
          issueMeta={issueMeta}
          memberBadge={t("memberBadge")}
        />

        <ProfileIdentity
          fullName={fullName}
          firstName={athlete.firstName}
          lastName={athlete.lastName}
          avatarUrl={athlete.avatarUrl}
          countryName={athlete.countryName}
          flagEmoji={flag.emoji}
        />

        {athlete.bio ? <ProfileBio bio={athlete.bio} /> : null}

        <StatsRow athlete={athlete} />

        <SponsorsStrip sponsors={athlete.sponsors} />

        {isSubscribed && selected && defaultEdition ? (
          <>
            <EditionTabsClient
              editions={editions.map(toEditionTab)}
              defaultSlug={defaultEdition.slug}
            />

            <article className="bg-cream px-6 py-10 md:py-14">
              <div className="space-y-5">
                {selected.sections.map((section, i) => (
                  <SectionRenderer
                    key={section.id}
                    section={toRawSection(section)}
                    index={i}
                    editionMode={selected.editionMode as EditionModeValue}
                    tournamentName={selected.tournamentName}
                    athleteSlug={athlete.slug}
                    newsletterId={selected.id}
                    previewMode={previewMode}
                  />
                ))}
              </div>
            </article>
          </>
        ) : null}

        {isSubscribed && !selected ? (
          <section className="px-6 py-12 md:py-16">
            <div className="rounded-2xl border border-dashed border-line bg-cream-2 px-6 py-14 text-center">
              <p className="font-serif text-[22px] leading-tight text-ink">
                {t("noEditionsTitle")}
              </p>
              <p className="mt-2 text-[14px] text-ink-3">
                {t("noEditionsBody")}
              </p>
            </div>
          </section>
        ) : null}

        <SubscribeButton
          athleteSlug={athlete.slug}
          athleteFirstName={athlete.firstName}
          isSignedIn={isSignedIn}
          isSubscribed={isSubscribed}
          ipCountryCode={ipCountryCode}
        />

        <SocialLinksStrip
          fullName={fullName}
          socialLinks={athlete.socialLinks}
        />
      </div>
    </div>
  );
}

type SocialKey =
  | "instagram"
  | "x"
  | "tiktok"
  | "facebook"
  | "linkedin"
  | "foundation";

const SOCIAL_ICONS: {
  key: SocialKey;
  label: string;
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}[] = [
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "tiktok", label: "TikTok", Icon: FaTiktok },
  { key: "x", label: "X", Icon: FaXTwitter },
  { key: "facebook", label: "Facebook", Icon: FaFacebook },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedin },
  { key: "foundation", label: "Foundation", Icon: FaHeart },
];

function SocialLinksStrip({
  fullName,
  socialLinks,
}: {
  fullName: string;
  socialLinks: Athlete["socialLinks"];
}) {
  const t = useTranslations("Athlete.Profile");

  const links =
    socialLinks && typeof socialLinks === "object" && !Array.isArray(socialLinks)
      ? (socialLinks as Record<string, string | null | undefined>)
      : null;

  if (!links) return null;

  const items = SOCIAL_ICONS.filter(({ key }) => {
    const url = links[key];
    return typeof url === "string" && url.trim().length > 0;
  });

  if (items.length === 0) return null;

  return (
    <section
      aria-label={t("follow", { fullName })}
      className="border-t border-line px-6 py-10 md:py-12"
    >
      <div className="text-center font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-ink-3">
        {t("follow", { fullName })}
      </div>
      <ul className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {items.map(({ key, label, Icon }) => {
          const displayLabel = key === "foundation" ? t("foundationLabel") : label;
          return (
            <li key={key}>
              <a
                href={links[key] as string}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("socialAria", { fullName, label: displayLabel })}
                title={displayLabel}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-cream text-ink transition-colors duration-200 hover:border-line-2 hover:bg-cream-3"
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ProfileCover({
  coverUrl,
  flag,
  issueMeta,
  memberBadge,
}: {
  coverUrl: string | null;
  flag: ReturnType<typeof flagFor>;
  issueMeta: string | null;
  memberBadge: string;
}) {
  return (
    <section className="relative w-full overflow-hidden bg-cream-3">
      <div className="relative aspect-[16/10] w-full md:aspect-[21/9]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes="(max-width: 820px) 100vw, 820px"
            className="object-cover"
            priority
            unoptimized
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(135deg,#5a6478_0%,#2c3340_100%)]"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.10)_45%,rgba(0,0,0,0.55)_100%)]"
        />
        <div className="absolute left-5 top-5 md:left-8 md:top-8">
          <FrostedBadge>{memberBadge}</FrostedBadge>
        </div>
        {issueMeta ? (
          <div className="absolute right-5 top-5 md:right-8 md:top-8">
            <FrostedBadge>{issueMeta}</FrostedBadge>
          </div>
        ) : null}
      </div>

      <div className="flex h-1 w-full">
        {flag.stripe.map((color, i) => (
          <span
            key={i}
            className="flex-1"
            style={{ background: color }}
            aria-hidden
          />
        ))}
      </div>
    </section>
  );
}

function ProfileIdentity({
  fullName,
  firstName,
  lastName,
  avatarUrl,
  countryName,
  flagEmoji,
}: {
  fullName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  countryName: string;
  flagEmoji: string;
}) {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`;
  return (
    <div className="flex flex-col items-center px-6 pb-2">
      <div className="relative -mt-[80px] h-[160px] w-[160px] overflow-hidden rounded-full border-[4px] border-cream-2 bg-[linear-gradient(135deg,#5a6478_0%,#2c3340_100%)] shadow-[0_10px_28px_rgba(0,0,0,0.22)] md:-mt-[110px] md:h-[200px] md:w-[200px]">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            fill
            sizes="200px"
            className="object-cover"
            priority
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-serif text-[56px] font-semibold tracking-[-0.02em] text-cream md:text-[72px]">
            {initials}
          </div>
        )}
      </div>

      <h1 className="mt-5 text-center font-serif text-[36px] font-semibold leading-[1.05] tracking-[-0.02em] text-ink md:text-[48px]">
        {fullName}
      </h1>

      <div className="mt-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-3">
        <span aria-hidden className="mr-1.5">
          {flagEmoji}
        </span>
        {countryName}
      </div>
    </div>
  );
}

function ProfileBio({ bio }: { bio: string }) {
  return (
    <p className="mx-auto mt-5 max-w-[560px] px-6 text-center font-serif text-[17px] leading-[1.55] text-ink-2 md:text-[18px]">
      {bio}
    </p>
  );
}

function StatsRow({ athlete }: { athlete: Athlete }) {
  const showTitles = athlete.titlesCount > 0;
  return (
    <dl
      className={`mt-6 grid border-y border-line ${showTitles ? "grid-cols-3" : "grid-cols-2"}`}
    >
      <Stat
        value={athlete.worldRank !== null ? `#${athlete.worldRank}` : "—"}
        label={athlete.tour ? `${athlete.tour} World` : "World"}
      />
      <Stat
        value={
          athlete.countryRank !== null ? `#${athlete.countryRank}` : "—"
        }
        label={athlete.countryCode}
        divider={showTitles ? "both" : "left"}
      />
      {showTitles && (
        <Stat value={athlete.titlesCount.toString()} label="Titles" />
      )}
    </dl>
  );
}

function SponsorsStrip({ sponsors }: { sponsors: Sponsor[] }) {
  const t = useTranslations("Athlete.Profile");
  if (sponsors.length === 0) return null;
  return (
    <section
      aria-label={t("partners")}
      className="border-b border-line px-6 py-5 md:py-8"
    >
      <div className="text-center font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-ink-3">
        {t("partners")}
      </div>
      <ul className="mt-3 flex flex-nowrap items-center justify-center gap-2 md:mt-4 md:gap-2.5">
        {sponsors.map((s) => (
          <li key={s.id} className="min-w-0 flex-1 max-w-[100px] md:max-w-[170px]">
            <a
              href={s.websiteUrl}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="group flex aspect-[5/3] w-full items-center justify-center rounded-sm border border-line bg-cream p-2 transition-colors duration-200 hover:border-line-2 md:p-4"
              aria-label={s.name}
              title={s.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.logoUrl}
                alt={s.name}
                loading="lazy"
                decoding="async"
                referrerPolicy="origin"
                className="h-full w-full object-contain opacity-85 mix-blend-multiply transition-opacity duration-200 group-hover:opacity-100"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FrostedBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/20 bg-ink/55 px-2.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-cream backdrop-blur-md">
      {children}
    </span>
  );
}

function Stat({
  value,
  label,
  divider,
}: {
  value: string;
  label: string;
  divider?: "both" | "left";
}) {
  const dividerClass =
    divider === "both"
      ? "border-x border-line"
      : divider === "left"
        ? "border-l border-line"
        : "";
  return (
    <div
      className={`flex flex-col items-center px-2 py-5 ${dividerClass}`}
    >
      <span className="font-serif text-[28px] font-semibold leading-none tracking-[-0.01em] text-ink md:text-[34px]">
        {value}
      </span>
      <span className="mt-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-3">
        {label}
      </span>
    </div>
  );
}
