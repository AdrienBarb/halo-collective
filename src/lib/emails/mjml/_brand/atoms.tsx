import { MjmlButton, MjmlText } from "@faire/mjml-react";
import type { ReactNode } from "react";
import { palette, fonts } from "@/lib/emails/_brand/theme";

export function EmailButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <MjmlButton
      href={href}
      backgroundColor={palette.accent}
      color={palette.panelDark}
      fontFamily={fonts.mono}
      fontSize="12px"
      fontWeight="600"
      letterSpacing="0.22em"
      textTransform="uppercase"
      innerPadding="14px 28px"
      borderRadius="6px"
      align="center"
    >
      {children}
    </MjmlButton>
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
    <MjmlButton
      href={href}
      backgroundColor={palette.panelDark}
      color={palette.surface}
      fontFamily={fonts.mono}
      fontSize="12px"
      fontWeight="700"
      letterSpacing="0.18em"
      textTransform="uppercase"
      innerPadding="14px 20px"
      width="100%"
      align="center"
    >
      {children}
    </MjmlButton>
  );
}

export function EmailHeading({ children }: { children: ReactNode }) {
  return (
    <MjmlText
      color={palette.panelDark}
      fontFamily={fonts.serif}
      fontSize="30px"
      fontWeight="600"
      lineHeight="1.15"
      letterSpacing="-0.015em"
    >
      {children}
    </MjmlText>
  );
}

export function EmailLead({ children }: { children: ReactNode }) {
  return (
    <MjmlText
      color={palette.textBody}
      fontFamily={fonts.serif}
      fontSize="17px"
      fontStyle="italic"
      lineHeight="1.5"
      paddingTop="16px"
    >
      {children}
    </MjmlText>
  );
}

export function EmailBody({ children }: { children: ReactNode }) {
  return (
    <MjmlText
      color={palette.textBody}
      fontSize="15px"
      lineHeight="1.65"
      paddingTop="16px"
    >
      {children}
    </MjmlText>
  );
}

export function EmailParagraphs({
  paragraphs,
  gap = 10,
}: {
  paragraphs: string[];
  gap?: number;
}) {
  if (paragraphs.length === 0) return null;
  return (
    <>
      {paragraphs.map((p, i) => (
        <MjmlText
          key={i}
          color={palette.textBody}
          fontFamily={fonts.serif}
          fontSize="15px"
          fontStyle="italic"
          lineHeight="1.75"
          paddingTop={i === 0 ? "0" : `${gap}px`}
        >
          {p}
        </MjmlText>
      ))}
    </>
  );
}
