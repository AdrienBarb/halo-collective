import {
  Mjml,
  MjmlAll,
  MjmlAttributes,
  MjmlBody,
  MjmlButton,
  MjmlColumn,
  MjmlDivider,
  MjmlHead,
  MjmlPreview,
  MjmlRaw,
  MjmlSection,
  MjmlStyle,
  MjmlText,
  MjmlTitle,
} from "@faire/mjml-react";
import type { ReactNode } from "react";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import { darkModeLockCss } from "@/lib/emails/_brand/darkModeLock";
import { safeHttpUrl } from "@/lib/emails/mjml/_brand/url";
import config from "@/lib/config";

interface EmailLayoutProps {
  preview: string;
  title?: string;
  eyebrow?: string;
  viewInBrowser?: { url: string; label: string };
  children: ReactNode;
  footerNote?: ReactNode;
}

export function EmailLayout({
  preview,
  title,
  eyebrow,
  viewInBrowser,
  children,
  footerNote,
}: EmailLayoutProps) {
  return (
    <Mjml>
      <MjmlHead>
        <MjmlTitle>{title ?? preview}</MjmlTitle>
        <MjmlPreview>{preview}</MjmlPreview>
        <MjmlAttributes>
          <MjmlAll fontFamily={fonts.sans} />
          <MjmlText
            color={palette.textPrimary}
            fontSize="15px"
            lineHeight="1.6"
            padding="0"
          />
          <MjmlSection padding="0" />
          <MjmlButton
            backgroundColor={palette.accent}
            color={palette.panelDark}
            fontFamily={fonts.mono}
            fontSize="12px"
            fontWeight="600"
            letterSpacing="0.22em"
            textTransform="uppercase"
            innerPadding="14px 28px"
            borderRadius="6px"
          />
        </MjmlAttributes>
        <MjmlStyle>{darkModeLockCss}</MjmlStyle>
        <MjmlRaw>
          <meta name="color-scheme" content="light only" />
          <meta name="supported-color-schemes" content="light" />
        </MjmlRaw>
      </MjmlHead>

      <MjmlBody backgroundColor={palette.surface} width={600}>
        {(eyebrow || viewInBrowser) && (
          <MjmlSection
            backgroundColor={palette.panelDark}
            padding="16px 32px"
            cssClass="force-dark-bg"
          >
            <MjmlColumn verticalAlign="middle">
              {eyebrow ? (
                <MjmlText
                  cssClass="force-dark-fg"
                  align="left"
                  color={palette.textOnDark}
                  fontFamily={fonts.mono}
                  fontSize="11px"
                  fontWeight="600"
                  letterSpacing="0.22em"
                  textTransform="uppercase"
                >
                  {eyebrow}
                </MjmlText>
              ) : null}
            </MjmlColumn>
            {viewInBrowser ? (
              <MjmlColumn verticalAlign="middle">
                <MjmlText
                  cssClass="force-dark-fg"
                  align="right"
                  color={palette.textOnDark}
                  fontFamily={fonts.mono}
                  fontSize="10px"
                  fontWeight="700"
                  letterSpacing="0.18em"
                  textTransform="uppercase"
                >
                  <a
                    href={safeHttpUrl(viewInBrowser.url)}
                    style={{
                      color: palette.textOnDark,
                      textDecoration: "none",
                    }}
                  >
                    {viewInBrowser.label}
                  </a>
                </MjmlText>
              </MjmlColumn>
            ) : null}
          </MjmlSection>
        )}

        {children}

        <MjmlSection
          padding="0 32px"
          backgroundColor={palette.panel}
          cssClass="force-light-bg"
        >
          <MjmlColumn>
            <MjmlDivider
              borderColor={palette.border}
              borderWidth="1px"
              padding="0"
            />
          </MjmlColumn>
        </MjmlSection>

        <MjmlSection
          padding="20px 32px 28px"
          backgroundColor={palette.panel}
          cssClass="force-light-bg force-light-fg"
        >
          <MjmlColumn>
            {footerNote ? (
              <MjmlText
                color={palette.textMuted}
                fontSize="12px"
                lineHeight="1.6"
                paddingBottom="12px"
              >
                {footerNote}
              </MjmlText>
            ) : null}
            <MjmlText
              color={palette.textMuted}
              fontFamily={fonts.mono}
              fontSize="10px"
              fontWeight="600"
              letterSpacing="0.18em"
              textTransform="uppercase"
            >
              <a
                href={safeHttpUrl(config.project.url)}
                style={{ color: palette.textMuted, textDecoration: "none" }}
              >
                {config.project.brandName}
              </a>
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  );
}
