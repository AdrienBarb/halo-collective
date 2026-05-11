import { Button, Heading, Text } from "@react-email/components";
import type { ReactNode } from "react";
import { palette, fonts } from "@/lib/emails/_brand/theme";

export function EmailParagraphs({
  paragraphs,
  firstMarginTop = 0,
  gap = 10,
}: {
  paragraphs: string[];
  firstMarginTop?: number;
  gap?: number;
}) {
  if (paragraphs.length === 0) return null;
  return (
    <>
      {paragraphs.map((p, i) => (
        <Text
          key={i}
          style={{
            margin: i === 0 ? `${firstMarginTop}px 0 0` : `${gap}px 0 0`,
            color: palette.ink2,
            fontFamily: fonts.serif,
            fontSize: 15,
            fontStyle: "italic",
            lineHeight: 1.75,
          }}
        >
          {p}
        </Text>
      ))}
    </>
  );
}

export function EmailCtaButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Button
      href={href}
      style={{
        display: "block",
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: palette.ink,
        color: palette.cream,
        fontFamily: fonts.mono,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        textDecoration: "none",
        padding: "14px 20px",
        textAlign: "center",
      }}
    >
      {children}
    </Button>
  );
}

export function EmailHeading({ children }: { children: ReactNode }) {
  return (
    <Heading
      as="h1"
      style={{
        margin: 0,
        color: palette.ink,
        fontFamily: fonts.serif,
        fontSize: 30,
        fontWeight: 600,
        lineHeight: 1.15,
        letterSpacing: "-0.015em",
      }}
    >
      {children}
    </Heading>
  );
}

export function EmailLead({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        margin: "16px 0 0",
        color: palette.ink2,
        fontFamily: fonts.serif,
        fontSize: 17,
        fontStyle: "italic",
        lineHeight: 1.5,
      }}
    >
      {children}
    </Text>
  );
}

export function EmailBody({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        margin: "16px 0 0",
        color: palette.ink2,
        fontSize: 15,
        lineHeight: 1.65,
      }}
    >
      {children}
    </Text>
  );
}

export function EmailButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Button
      href={href}
      style={{
        display: "inline-block",
        marginTop: 24,
        backgroundColor: palette.accentWarm,
        color: palette.ink,
        fontFamily: fonts.mono,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        textDecoration: "none",
        padding: "14px 28px",
        borderRadius: 6,
      }}
    >
      {children}
    </Button>
  );
}
