import { Text } from "@react-email/components";
import type { HeroMetricBlock as HeroMetricBlockType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface HeroMetricBlockProps {
  metric: HeroMetricBlockType;
}

export default function HeroMetricBlock({ metric }: HeroMetricBlockProps) {
  return (
    <div
      style={{
        backgroundColor: palette.panelDark,
        padding: "14px 8px",
        textAlign: "center",
      }}
    >
      <Text
        style={{
          margin: 0,
          color: palette.surface,
          fontFamily: fonts.display,
          fontSize: 20,
          fontStyle: "italic",
          fontWeight: 800,
          letterSpacing: "-0.005em",
        }}
      >
        {metric.value}
      </Text>
      <Text
        style={{
          margin: "4px 0 0",
          color: palette.panelMuted,
          fontFamily: fonts.sans,
          fontSize: 9,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        {metric.label}
      </Text>
    </div>
  );
}
