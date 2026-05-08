import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import config from "@/lib/config";

interface EmailLayoutProps {
  preview: string;
  eyebrow?: string;
  children: ReactNode;
  footerNote?: ReactNode;
}

export function EmailLayout({
  preview,
  eyebrow,
  children,
  footerNote,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: palette.cream,
          fontFamily: fonts.sans,
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: 600,
            margin: "0 auto",
            backgroundColor: palette.cream2,
            border: `1px solid ${palette.line}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {eyebrow ? (
            <Section
              style={{
                backgroundColor: palette.ink,
                padding: "20px 32px",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  margin: 0,
                  color: palette.accentGold,
                  fontFamily: fonts.mono,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                }}
              >
                {eyebrow}
              </Text>
            </Section>
          ) : null}

          <Section style={{ padding: "32px 32px 24px" }}>{children}</Section>

          <Hr
            style={{
              borderColor: palette.line,
              margin: "0 32px",
            }}
          />

          <Section style={{ padding: "20px 32px 28px" }}>
            {footerNote ? (
              <Text
                style={{
                  margin: 0,
                  color: palette.ink3,
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                {footerNote}
              </Text>
            ) : null}
            <Text
              style={{
                margin: footerNote ? "12px 0 0" : 0,
                color: palette.ink3,
                fontFamily: fonts.mono,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              <Link
                href={config.project.url}
                style={{ color: palette.ink3, textDecoration: "none" }}
              >
                {config.project.brandName}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
