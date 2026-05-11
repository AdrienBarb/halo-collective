import { Section, Text } from "@react-email/components";
import {
  debriefContentSchema,
  engagementContentSchema,
  isSectionMeaningful,
  kitContentSchema,
  resultsContentSchema,
  whatsNextContentSchema,
  type SectionTypeValue,
} from "@/lib/schemas/newsletterSection";
import {
  getNewsletterLabels,
  getSectionTitle,
} from "@/lib/newsletter/labels";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import DebriefSection from "@/lib/emails/sections/DebriefSection";
import EngagementSection from "@/lib/emails/sections/EngagementSection";
import KitSection from "@/lib/emails/sections/KitSection";
import ResultsSection from "@/lib/emails/sections/ResultsSection";
import WhatsNextSection from "@/lib/emails/sections/WhatsNextSection";

export interface EmailRawSection {
  id: string;
  type: SectionTypeValue;
  order: number;
  content: unknown;
}

interface SectionRendererProps {
  section: EmailRawSection;
  index: number;
  tournamentName?: string | null;
  askQuestionUrl?: string | null;
}

function renderBody(
  section: EmailRawSection,
  askQuestionUrl: string | null | undefined,
): React.ReactNode {
  switch (section.type) {
    case "DEBRIEF": {
      const parsed = debriefContentSchema.safeParse(section.content);
      return parsed.success ? <DebriefSection content={parsed.data} /> : null;
    }
    case "RESULTS": {
      const parsed = resultsContentSchema.safeParse(section.content);
      return parsed.success ? <ResultsSection content={parsed.data} /> : null;
    }
    case "WHATS_NEXT": {
      const parsed = whatsNextContentSchema.safeParse(section.content);
      return parsed.success ? (
        <WhatsNextSection content={parsed.data} />
      ) : null;
    }
    case "KIT": {
      const parsed = kitContentSchema.safeParse(section.content);
      return parsed.success ? <KitSection content={parsed.data} /> : null;
    }
    case "ENGAGEMENT": {
      const parsed = engagementContentSchema.safeParse(section.content);
      return parsed.success ? (
        <EngagementSection
          content={parsed.data}
          askQuestionUrl={askQuestionUrl}
        />
      ) : null;
    }
    default:
      return null;
  }
}

export default function SectionRenderer({
  section,
  index,
  tournamentName,
  askQuestionUrl,
}: SectionRendererProps) {
  if (!isSectionMeaningful(section.type, section.content)) return null;

  const body = renderBody(section, askQuestionUrl);
  if (body === null) return null;

  const labels = getNewsletterLabels();
  const eyebrow = labels.sections[section.type].eyebrow;
  const number = (index + 1).toString().padStart(2, "0");
  const title = getSectionTitle(section.type, tournamentName);

  return (
    <Section style={{ marginTop: 24 }}>
      <Section
        style={{
          backgroundColor: palette.ink,
          padding: "14px 18px",
        }}
      >
        <Text
          style={{
            margin: 0,
            color: palette.cream3,
            fontFamily: fonts.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {number}&nbsp;&nbsp;|&nbsp;&nbsp;{eyebrow}
        </Text>
        {title ? (
          <Text
            style={{
              margin: "4px 0 0",
              color: palette.cream,
              fontFamily: fonts.sans,
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {title}
          </Text>
        ) : null}
      </Section>
      <Section
        style={{
          backgroundColor: palette.cream2,
          padding: "20px 18px",
        }}
      >
        {body}
      </Section>
    </Section>
  );
}
