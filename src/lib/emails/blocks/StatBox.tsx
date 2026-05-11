import { Text } from "@react-email/components";
import type { StatBox as StatBoxType } from "@/lib/schemas/newsletterSection";
import { palette, fonts } from "@/lib/emails/_brand/theme";

interface StatBoxProps {
  stat: StatBoxType;
}

export default function StatBox({ stat }: StatBoxProps) {
  return (
    <div
      style={{
        backgroundColor: palette.ink,
        padding: "14px 8px",
        textAlign: "center",
      }}
    >
      <Text
        style={{
          margin: 0,
          color: palette.cream,
          fontFamily: fonts.mono,
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        {stat.value}
      </Text>
      <Text
        style={{
          margin: "4px 0 0",
          color: palette.cream3,
          fontFamily: fonts.mono,
          fontSize: 9,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        {stat.label}
      </Text>
    </div>
  );
}
