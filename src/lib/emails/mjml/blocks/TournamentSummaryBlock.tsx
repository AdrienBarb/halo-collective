import {
  MjmlColumn,
  MjmlImage,
  MjmlSection,
  MjmlText,
} from "@faire/mjml-react";
import type { TournamentSummaryBlock as TournamentSummaryBlockType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { safeHttpUrl } from "@/lib/emails/mjml/_brand/url";

interface TournamentSummaryBlockProps {
  summary: TournamentSummaryBlockType;
}

export default function TournamentSummaryBlock({
  summary,
}: TournamentSummaryBlockProps) {
  const meta = [
    summary.category,
    summary.location,
    summary.surface,
    summary.dateRange,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <MjmlSection
      backgroundColor={palette.panel}
      cssClass="force-light-bg"
      padding="0 32px 16px 32px"
      borderBottom={`1px solid ${palette.border}`}
    >
      {summary.logoUrl ? (
        <MjmlColumn width="64px" verticalAlign="middle" padding="0">
          <MjmlImage
            src={safeHttpUrl(summary.logoUrl)}
            alt=""
            width="56px"
            height="56px"
            borderRadius="4px"
            padding="0 12px 0 0"
            align="left"
          />
        </MjmlColumn>
      ) : null}
      <MjmlColumn verticalAlign="middle" padding="0">
        <MjmlText
          color={palette.panelDark}
          fontFamily={fonts.sans}
          fontSize="16px"
          fontWeight="700"
          padding="0"
        >
          {summary.name}
        </MjmlText>
        {meta ? (
          <MjmlText
            color={palette.textMuted}
            fontFamily={fonts.mono}
            fontSize="10px"
            letterSpacing="0.12em"
            textTransform="uppercase"
            padding="4px 0 0"
          >
            {meta}
          </MjmlText>
        ) : null}
      </MjmlColumn>
    </MjmlSection>
  );
}
