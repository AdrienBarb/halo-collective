import {
  MjmlColumn,
  MjmlImage,
  MjmlSection,
} from "@faire/mjml-react";
import { EmailLayout } from "@/lib/emails/mjml/_brand/EmailLayout";
import { EmailButton } from "@/lib/emails/mjml/_brand/atoms";
import IdentityBlock, {
  type IdentityBlockSponsor,
} from "@/lib/emails/mjml/blocks/IdentityBlock";
import SectionRenderer, {
  type EmailRawSection,
} from "@/lib/emails/mjml/SectionRenderer";
import { palette } from "@/lib/emails/_brand/theme";
import { safeUnsubscribeUrl } from "@/lib/emails/mjml/_brand/url";
import type {
  EditionModeValue,
  SectionTypeValue,
} from "@/lib/schemas/newsletterSection";
import type { Locale } from "@/i18n/locales";

export interface NewsletterMessages {
  shell: {
    editionLabel: string;
    footerNote: string;
    unsubscribe: string;
    viewInBrowser: string;
  };
  identity: {
    worldAtp: string;
    careerTitles: string;
    myPartners: string;
    member: string;
  };
}

interface NewsletterEmailProps {
  title: string;
  heroImageUrl?: string | null;
  editionMode: EditionModeValue;
  athleteName: string;
  editionUrl: string;
  askQuestionUrl?: string | null;
  editionNumber: number;
  editionDate?: Date | string | null;
  countryName?: string | null;
  worldRank?: number | null;
  titlesCount?: number | null;
  sponsors?: IdentityBlockSponsor[];
  tournamentName?: string | null;
  tournamentLogoUrl?: string | null;
  tournamentCategory?: string | null;
  tournamentLocation?: string | null;
  tournamentSurface?: string | null;
  tournamentStartDate?: Date | string | null;
  tournamentEndDate?: Date | string | null;
  sections: EmailRawSection[];
  previewText?: string;
  unsubscribeUrl?: string;
  locale: Locale;
  messages: NewsletterMessages;
}

export const NewsletterEmail = ({
  title,
  heroImageUrl,
  editionMode,
  athleteName,
  editionUrl,
  askQuestionUrl,
  editionNumber,
  editionDate,
  countryName,
  worldRank,
  titlesCount,
  sponsors,
  tournamentName,
  tournamentLogoUrl,
  sections,
  previewText,
  unsubscribeUrl = "{{ unsubscribe }}",
  locale,
  messages,
}: NewsletterEmailProps) => {
  const orderedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <EmailLayout
      preview={previewText ?? title}
      title={title}
      eyebrow={`${athleteName} · ${messages.shell.editionLabel}`}
      viewInBrowser={{ url: editionUrl, label: messages.shell.viewInBrowser }}
      footerNote={
        <>
          {messages.shell.footerNote}{" "}
          <a
            href={safeUnsubscribeUrl(unsubscribeUrl)}
            style={{ color: palette.textMuted, textDecoration: "underline" }}
          >
            {messages.shell.unsubscribe}
          </a>
        </>
      }
    >
      {heroImageUrl ? (
        <MjmlSection padding="0" backgroundColor={palette.panel}>
          <MjmlColumn padding="0">
            <MjmlImage
              src={heroImageUrl}
              alt={athleteName}
              width="600px"
              padding="0"
            />
          </MjmlColumn>
        </MjmlSection>
      ) : null}

      <IdentityBlock
        editionNumber={editionNumber}
        editionDate={editionDate}
        subtitle={title}
        tournamentName={tournamentName}
        tournamentLogoUrl={tournamentLogoUrl}
        athleteName={athleteName}
        countryName={countryName}
        worldRank={worldRank}
        titlesCount={titlesCount}
        sponsors={sponsors}
        locale={locale}
        messages={messages.identity}
      />

      {orderedSections.map((section, index) => (
        <SectionRenderer
          key={section.id}
          section={section}
          index={index}
          editionMode={editionMode}
          tournamentName={tournamentName}
          editionUrl={editionUrl}
          askQuestionUrl={askQuestionUrl}
          locale={locale}
        />
      ))}

      <MjmlSection
        backgroundColor={palette.panel}
        cssClass="force-light-bg"
        padding="20px 32px 8px"
      >
        <MjmlColumn>
          <EmailButton href={editionUrl}>
            {messages.shell.viewInBrowser}
          </EmailButton>
        </MjmlColumn>
      </MjmlSection>
    </EmailLayout>
  );
};

const samplePreviewSections: EmailRawSection[] = [
  {
    id: "preview-week-recap",
    type: "WEEK_RECAP" satisfies SectionTypeValue,
    order: 0,
    eyebrow: null,
    title: null,
    blocks: [
      { kind: "hero_metric", value: "1-1", label: "W/L" },
      { kind: "hero_metric", value: "78%", label: "1st serve" },
      { kind: "hero_metric", value: "12", label: "Aces" },
      {
        kind: "match_card",
        result: "W",
        roundName: "Round 1",
        opponentName: "J. Doe",
        opponentRank: "ATP #45",
        opponentCountry: "FRA",
        score: "6-3 7-5",
        date: "Apr 9",
      },
    ],
  },
];

NewsletterEmail.PreviewProps = {
  title: "Monte Carlo: the comeback nobody saw",
  heroImageUrl: null,
  editionMode: "TOURNAMENT" as EditionModeValue,
  athleteName: "Flavio Cobolli",
  editionUrl: "https://halocollective.co/flavio-cobolli?edition=monte-carlo-comeback",
  askQuestionUrl: "https://halocollective.co/athletes/flavio-cobolli/feedback",
  editionNumber: 1,
  editionDate: new Date("2026-04-13"),
  countryName: "Italy",
  worldRank: 32,
  titlesCount: 1,
  sponsors: [],
  tournamentName: "Monte Carlo",
  tournamentLogoUrl: null,
  tournamentCategory: "ATP Masters 1000",
  tournamentLocation: "Monte Carlo, Monaco",
  tournamentSurface: "Clay",
  tournamentStartDate: null,
  tournamentEndDate: null,
  sections: samplePreviewSections,
  previewText: "The comeback nobody saw",
  locale: "en",
  messages: {
    shell: {
      editionLabel: "Edition #01",
      footerNote:
        "You're receiving this because you subscribed to Flavio Cobolli's edition on Halo Collective.",
      unsubscribe: "Unsubscribe",
      viewInBrowser: "Read in browser →",
    },
    identity: {
      worldAtp: "World ATP",
      careerTitles: "Career titles",
      myPartners: "My partners",
      member: "Exclusive member",
    },
  },
} satisfies NewsletterEmailProps;

export default NewsletterEmail;
