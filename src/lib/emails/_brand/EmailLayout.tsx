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

// Lock the palette across Gmail/Outlook/Apple dark modes. Without this,
// Gmail's "dark theme" silently re-colours both backgrounds and text
// (often inverting only one side) which destroys contrast on the dark
// section headers. The targeted selectors here:
//   - color-scheme / supported-color-schemes meta → opt out of auto
//     inversion in Apple Mail and Outlook.com
//   - [data-ogsc] / [data-ogsb]                  → Outlook.com
//     dark-mode hooks (one for foreground, one for background)
//   - @media (prefers-color-scheme: dark)        → Apple Mail / iOS
//   - u + #body .force-dark / .force-light       → Gmail iOS workaround
// We don't try to *support* dark mode — we just force the brand colours
// to render the same way everywhere.
const DARK_MODE_LOCK_CSS = `
  :root {
    color-scheme: light only;
    supported-color-schemes: light only;
  }
  [data-ogsc] .force-dark-bg, [data-ogsb] .force-dark-bg { background-color: ${palette.ink} !important; }
  [data-ogsc] .force-dark-fg { color: ${palette.cream} !important; }
  [data-ogsc] .force-dark-fg-muted { color: ${palette.cream3} !important; }
  [data-ogsc] .force-light-bg, [data-ogsb] .force-light-bg { background-color: ${palette.cream2} !important; }
  [data-ogsc] .force-light-fg { color: ${palette.ink} !important; }
  [data-ogsc] .force-light-fg-muted { color: ${palette.ink3} !important; }
  @media (prefers-color-scheme: dark) {
    .force-dark-bg { background-color: ${palette.ink} !important; }
    .force-dark-fg { color: ${palette.cream} !important; }
    .force-dark-fg-muted { color: ${palette.cream3} !important; }
    .force-light-bg { background-color: ${palette.cream2} !important; }
    .force-light-fg { color: ${palette.ink} !important; }
    .force-light-fg-muted { color: ${palette.ink3} !important; }
  }
  /* Gmail mobile dark mode — wraps the body in <u> */
  u + #body .force-dark-bg { background-color: ${palette.ink} !important; }
  u + #body .force-dark-fg { color: ${palette.cream} !important; }
  u + #body .force-dark-fg-muted { color: ${palette.cream3} !important; }
  u + #body .force-light-bg { background-color: ${palette.cream2} !important; }
  u + #body .force-light-fg { color: ${palette.ink} !important; }
  u + #body .force-light-fg-muted { color: ${palette.ink3} !important; }
`;

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
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        <style dangerouslySetInnerHTML={{ __html: DARK_MODE_LOCK_CSS }} />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        id="body"
        className="force-light-bg force-light-fg"
        style={{
          backgroundColor: palette.cream,
          color: palette.ink,
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
              className="force-dark-bg"
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
