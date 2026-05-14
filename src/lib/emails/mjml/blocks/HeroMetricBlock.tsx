import { MjmlText } from "@faire/mjml-react";
import type { HeroMetricBlock as HeroMetricBlockType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface HeroMetricBlockProps {
  metric: HeroMetricBlockType;
}

// Renders the inside of an MjmlColumn — the column owns the dark background
// and padding so the hero-metric row in WeekRecapSection lays out as one
// MjmlSection > N×MjmlColumn (auto-stacks on mobile).
export default function HeroMetricBlock({ metric }: HeroMetricBlockProps) {
  return (
    <>
      <MjmlText
        align="center"
        color={palette.surface}
        fontFamily={fonts.mono}
        fontSize="16px"
        fontWeight="700"
        padding="0"
      >
        {metric.value}
      </MjmlText>
      <MjmlText
        align="center"
        color={palette.panelMuted}
        fontFamily={fonts.mono}
        fontSize="9px"
        letterSpacing="0.15em"
        textTransform="uppercase"
        padding="4px 0 0"
      >
        {metric.label}
      </MjmlText>
    </>
  );
}
