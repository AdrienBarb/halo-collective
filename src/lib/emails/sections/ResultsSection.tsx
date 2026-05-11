import { Section, Text } from "@react-email/components";
import type { ResultsContent } from "@/lib/schemas/newsletterSection";
import { getNewsletterLabels } from "@/lib/newsletter/labels";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { EmailParagraphs } from "@/lib/emails/_brand/atoms";
import { splitParagraphs } from "@/lib/newsletter/splitParagraphs";
import MatchBlock from "@/lib/emails/blocks/MatchBlock";
import MediaBlock from "@/lib/emails/blocks/MediaBlock";
import PressLinkRow from "@/lib/emails/blocks/PressLinkRow";
import StatBox from "@/lib/emails/blocks/StatBox";

interface ResultsSectionProps {
  content: ResultsContent;
}

export default function ResultsSection({ content }: ResultsSectionProps) {
  const labels = getNewsletterLabels();

  return (
    <Section>
      {content.stats.length > 0 ? (
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "4px 0",
            marginBottom: 20,
          }}
        >
          <tbody>
            <tr>
              {content.stats.map((stat, i) => (
                <td key={i} style={{ verticalAlign: "top" }}>
                  <StatBox stat={stat} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      ) : null}

      {content.matches.length > 0 ? (
        <Section style={{ marginBottom: 20 }}>
          <Text
            style={{
              margin: 0,
              borderBottom: `2px solid ${palette.ink}`,
              paddingBottom: 8,
              color: palette.ink,
              fontFamily: fonts.mono,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Singles
          </Text>
          {content.matches.map((match, i) => (
            <MatchBlock key={i} match={match} />
          ))}
        </Section>
      ) : null}

      {content.pressLinks && content.pressLinks.length > 0 ? (
        <Section
          style={{
            borderTop: `1px solid ${palette.line}`,
            paddingTop: 16,
            marginTop: 16,
          }}
        >
          <Text
            style={{
              margin: "0 0 8px",
              color: palette.ink3,
              fontFamily: fonts.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            {labels.eyebrows.press}
          </Text>
          {content.pressLinks.map((link, i) => (
            <PressLinkRow key={i} link={link} />
          ))}
        </Section>
      ) : null}

      {content.subSection ? (
        <Section
          style={{
            borderTop: `1px solid ${palette.line}`,
            paddingTop: 16,
            marginTop: 16,
          }}
        >
          <Text
            style={{
              margin: "0 0 12px",
              color: palette.ink3,
              fontFamily: fonts.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            {content.subSection.label}
          </Text>
          {content.subSection.media ? (
            <MediaBlock media={content.subSection.media} />
          ) : null}
          <EmailParagraphs paragraphs={splitParagraphs(content.subSection.body)} />
          {content.subSection.pressLinks &&
          content.subSection.pressLinks.length > 0 ? (
            <Section style={{ marginTop: 12 }}>
              {content.subSection.pressLinks.map((link, i) => (
                <PressLinkRow key={i} link={link} />
              ))}
            </Section>
          ) : null}
        </Section>
      ) : null}
    </Section>
  );
}
