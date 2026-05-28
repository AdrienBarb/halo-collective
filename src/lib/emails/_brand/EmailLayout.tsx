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
import { darkModeLockCss } from "@/lib/emails/_brand/darkModeLock";
import config from "@/lib/config";

interface EmailLayoutProps {
  preview: string;
  eyebrow?: string;
  /**
   * Optional right-side link in the top dark band. Renders as a small
   * "Read in browser →" affordance — the canonical email best-practice
   * placement, and the only thing that saves the reader if any inline
   * image fails to load (image proxies, expired CDN tokens, etc.).
   */
  viewInBrowser?: { url: string; label: string };
  /**
   * Override the body padding. The default keeps the 32px gutter for
   * simple emails (welcome, OTP, reset). The newsletter sets this to
   * "0" so the hero portrait can bleed edge-to-edge while each inner
   * section applies its own gutter.
   */
  bodyPadding?: string;
  children: ReactNode;
  footerNote?: ReactNode;
}

export function EmailLayout({
  preview,
  eyebrow,
  viewInBrowser,
  bodyPadding = "32px 32px 24px",
  children,
  footerNote,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        <style dangerouslySetInnerHTML={{ __html: darkModeLockCss }} />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        id="body"
        className="force-light-bg force-light-fg"
        style={{
          backgroundColor: palette.surface,
          color: palette.textPrimary,
          fontFamily: fonts.sans,
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: 600,
            margin: "0 auto",
            backgroundColor: palette.panel,
            border: `1px solid ${palette.border}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {eyebrow || viewInBrowser ? (
            <Section
              className="force-dark-bg"
              style={{
                backgroundColor: palette.panelDark,
                padding: "16px 32px",
              }}
            >
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                border={0}
                width="100%"
                style={{ borderCollapse: "collapse" }}
              >
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: "middle" }}>
                      {eyebrow ? (
                        <Text
                          className="force-dark-fg"
                          style={{
                            margin: 0,
                            color: palette.textOnDark,
                            fontFamily: fonts.sans,
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                          }}
                        >
                          {eyebrow}
                        </Text>
                      ) : null}
                    </td>
                    {viewInBrowser ? (
                      <td
                        align="right"
                        style={{ verticalAlign: "middle", whiteSpace: "nowrap" }}
                      >
                        <Link
                          href={viewInBrowser.url}
                          className="force-dark-fg"
                          style={{
                            color: palette.textOnDark,
                            fontFamily: fonts.sans,
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                          }}
                        >
                          {viewInBrowser.label}
                        </Link>
                      </td>
                    ) : null}
                  </tr>
                </tbody>
              </table>
            </Section>
          ) : null}

          <Section style={{ padding: bodyPadding }}>{children}</Section>

          <Hr
            style={{
              borderColor: palette.border,
              margin: "0 32px",
            }}
          />

          <Section
            className="force-light-bg force-light-fg"
            style={{ padding: "20px 32px 28px" }}
          >
            {footerNote ? (
              <Text
                style={{
                  margin: 0,
                  color: palette.textMuted,
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
                color: palette.textMuted,
                fontFamily: fonts.sans,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              <Link
                href={config.project.url}
                style={{ color: palette.textMuted, textDecoration: "none" }}
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
