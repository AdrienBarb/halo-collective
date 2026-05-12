import { Img, Link, Section } from "@react-email/components";
import { EmailLayout } from "@/lib/emails/_brand/EmailLayout";
import { EmailButton } from "@/lib/emails/_brand/atoms";
import { palette } from "@/lib/emails/_brand/theme";
import SectionRenderer, {
  type EmailRawSection,
} from "@/lib/emails/SectionRenderer";
import IdentityBlock, {
  type IdentityBlockSponsor,
} from "@/lib/emails/blocks/IdentityBlock";
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
      eyebrow={`${athleteName} · ${messages.shell.editionLabel}`}
      viewInBrowser={{ url: editionUrl, label: messages.shell.viewInBrowser }}
      bodyPadding="0"
      footerNote={
        <>
          {messages.shell.footerNote}{" "}
          <Link
            href={unsubscribeUrl}
            style={{ color: palette.textMuted, textDecoration: "underline" }}
          >
            {messages.shell.unsubscribe}
          </Link>
        </>
      }
    >
      {heroImageUrl ? (
        <Section
          className="force-light-bg"
          style={{ padding: 0, fontSize: 0, lineHeight: 0 }}
        >
          <Img
            src={heroImageUrl}
            alt={athleteName}
            width="600"
            style={{
              display: "block",
              width: "100%",
              maxWidth: 600,
              height: "auto",
            }}
          />
        </Section>
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
        />
      ))}

      <Section
        className="force-light-bg"
        style={{ padding: "20px 32px 8px", textAlign: "center" }}
      >
        <EmailButton href={editionUrl}>
          {messages.shell.viewInBrowser}
        </EmailButton>
      </Section>
    </EmailLayout>
  );
};

const samplePreviewSections: EmailRawSection[] = [
  {
    id: "preview-athlete-review",
    type: "ATHLETE_REVIEW" satisfies SectionTypeValue,
    order: 0,
    blocks: [
      {
        kind: "text",
        body:
          "Tough week on clay. Lost a tight one in the second round but I'm taking the lessons forward.\n\nThe serve held up. The forehand didn't. Back to work.",
      },
    ],
  },
  {
    id: "preview-week-recap",
    type: "WEEK_RECAP" satisfies SectionTypeValue,
    order: 1,
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
  {
    id: "preview-coming-up",
    type: "COMING_UP" satisfies SectionTypeValue,
    order: 2,
    blocks: [
      {
        kind: "text",
        body: "Quick turnaround. Back on hard courts next week.",
      },
      {
        kind: "schedule_item",
        dateRange: "Apr 22–28",
        title: "Madrid Open",
        description: "Singles main draw, qualifier TBD.",
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
