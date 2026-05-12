import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties } from "react";
import { palette, fonts } from "@/lib/emails/_brand/theme";

export interface WelcomeSocialLinks {
  instagram?: string;
  x?: string;
  tiktok?: string;
  facebook?: string;
  linkedin?: string;
}

export interface WelcomeSponsor {
  id?: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
}

export interface WelcomeMessages {
  preview: string;
  greetingHeading: string;
  fallbackBody: string;
  partnersLabel: string;
  followSocial: string;
  unsubscribeLabel: string;
  footerNote: string;
}

interface WelcomeEmailProps {
  profileUrl: string;
  athleteFirstName: string;
  coverImageUrl?: string;
  welcomeMessage?: string;
  sponsors?: WelcomeSponsor[];
  socialLinks?: WelcomeSocialLinks;
  unsubscribeUrl?: string;
  messages: WelcomeMessages;
}

const CONTAINER_WIDTH = 600;
const CONTAINER_BG = palette.surface;
const CARD_BG = "#ffffff";
const HAIRLINE = "#ebebeb";

// Public Brevo/Sendinblue email-safe social icon CDN. Tracked in TODO as a
// follow-up to self-host (third-party CDN compromise = brand-hijack risk).
const SOCIAL_ICON_BASE =
  "https://creative-assets.mailinblue.com/editor/social-icons/rounded_colored";

const SOCIAL_META: Array<{
  key: keyof WelcomeSocialLinks;
  alt: string;
  icon: string;
}> = [
  { key: "instagram", alt: "Instagram", icon: `${SOCIAL_ICON_BASE}/instagram_32px.png` },
  { key: "x", alt: "X / Twitter", icon: `${SOCIAL_ICON_BASE}/twitter_32px.png` },
  { key: "tiktok", alt: "TikTok", icon: `${SOCIAL_ICON_BASE}/tiktok_32px.png` },
  { key: "facebook", alt: "Facebook", icon: `${SOCIAL_ICON_BASE}/facebook_32px.png` },
  { key: "linkedin", alt: "LinkedIn", icon: `${SOCIAL_ICON_BASE}/linkedin_32px.png` },
];

const EYEBROW_LABEL: CSSProperties = {
  margin: 0,
  fontFamily: fonts.sans,
  fontSize: 10,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: palette.textMuted,
};

const FOOTER_LABEL: CSSProperties = {
  ...EYEBROW_LABEL,
  textAlign: "center",
};

const BODY_PARAGRAPH: CSSProperties = {
  margin: 0,
  marginBottom: 16,
  fontFamily: fonts.serif,
  fontSize: 16,
  lineHeight: 1.85,
  color: palette.textBody,
  whiteSpace: "pre-line",
};

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function CoverHero({ src, alt }: { src: string; alt: string }) {
  return (
    <Section style={{ padding: 0, fontSize: 0, lineHeight: 0 }}>
      <Img
        src={src}
        alt={alt}
        width={CONTAINER_WIDTH}
        height={340}
        style={{
          width: "100%",
          maxWidth: CONTAINER_WIDTH,
          height: 340,
          objectFit: "cover",
          objectPosition: "center top",
          display: "block",
        }}
      />
    </Section>
  );
}

function SponsorsStrip({ sponsors, label }: { sponsors: WelcomeSponsor[]; label: string }) {
  return (
    <Section
      style={{
        backgroundColor: CARD_BG,
        padding: "24px 24px 28px",
        borderBottom: `1px solid ${HAIRLINE}`,
      }}
    >
      <Text
        style={{
          ...EYEBROW_LABEL,
          marginBottom: 16,
          fontSize: 10,
          letterSpacing: "0.28em",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={8}
        border={0}
        align="center"
        style={{ borderCollapse: "separate", margin: "0 auto" }}
      >
        <tbody>
          <tr>
            {sponsors.map((sponsor, i) => (
              <td
                key={sponsor.id ?? `${sponsor.name}-${i}`}
                align="center"
                valign="middle"
                width={120}
                style={{
                  width: 120,
                  height: 72,
                  border: `1px solid ${palette.borderSoft}`,
                  backgroundColor: palette.panelMuted,
                  borderRadius: 2,
                  padding: "12px 14px",
                }}
              >
                <Link
                  href={sponsor.websiteUrl}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  style={{ textDecoration: "none", display: "block" }}
                  title={sponsor.name}
                >
                  <Img
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    height={40}
                    style={{
                      maxWidth: 92,
                      maxHeight: 40,
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      display: "block",
                      margin: "0 auto",
                    }}
                  />
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

function BodyCard({
  heading,
  paragraphs,
  signatureName,
}: {
  heading: string;
  paragraphs: string[];
  signatureName: string;
}) {
  return (
    <Section style={{ backgroundColor: CARD_BG, padding: "32px 32px 28px" }}>
      <Text
        style={{
          margin: 0,
          marginBottom: 20,
          fontFamily: fonts.serif,
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1.3,
          color: palette.panelDark,
        }}
      >
        {heading}
      </Text>

      {paragraphs.map((p, i) => (
        <Text key={i} style={BODY_PARAGRAPH}>
          {p}
        </Text>
      ))}

      <Text style={{ ...BODY_PARAGRAPH, marginTop: 4, marginBottom: 0 }}>— {signatureName}</Text>
    </Section>
  );
}

function SocialRow({
  socials,
  label,
}: {
  socials: Array<{ key: keyof WelcomeSocialLinks; alt: string; icon: string; url: string }>;
  label: string;
}) {
  return (
    <Section
      style={{
        backgroundColor: CARD_BG,
        padding: "18px 32px 8px",
        borderTop: `1px solid ${HAIRLINE}`,
      }}
    >
      <Text style={{ ...FOOTER_LABEL, marginBottom: 12, fontSize: 10, letterSpacing: "0.18em" }}>
        {label}
      </Text>
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        align="center"
        style={{ margin: "0 auto", borderCollapse: "collapse" }}
      >
        <tbody>
          <tr>
            {socials.map((s) => (
              <td key={s.key} style={{ padding: "0 5px" }}>
                <Link
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <Img
                    src={s.icon}
                    alt={s.alt}
                    width={32}
                    height={32}
                    style={{ width: 32, height: 32, display: "block" }}
                  />
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

function EmailFooter({
  footerNote,
  unsubscribeLabel,
  unsubscribeHref,
}: {
  footerNote: string;
  unsubscribeLabel: string;
  unsubscribeHref: string;
}) {
  return (
    <Section
      style={{
        backgroundColor: CARD_BG,
        padding: "18px 32px 22px",
        borderTop: `1px solid ${HAIRLINE}`,
      }}
    >
      <Text style={{ ...FOOTER_LABEL, fontSize: 9, letterSpacing: "0.18em" }}>
        Powered by Halo Collective
      </Text>
      <Text
        style={{
          margin: 0,
          marginTop: 10,
          fontFamily: fonts.sans,
          fontSize: 10,
          lineHeight: 1.6,
          color: palette.textMuted,
          textAlign: "center",
        }}
      >
        {footerNote}
      </Text>
      <Text
        style={{
          margin: 0,
          marginTop: 10,
          fontFamily: fonts.sans,
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        <Link
          href={unsubscribeHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: palette.textMuted, textDecoration: "underline" }}
        >
          {unsubscribeLabel}
        </Link>
      </Text>
    </Section>
  );
}

export const WelcomeEmail = ({
  profileUrl,
  athleteFirstName,
  coverImageUrl,
  welcomeMessage,
  sponsors,
  socialLinks,
  unsubscribeUrl,
  messages,
}: WelcomeEmailProps) => {
  const paragraphs = splitParagraphs(welcomeMessage ?? "");
  if (paragraphs.length === 0) paragraphs.push(messages.fallbackBody);

  // Capture URL at filter time so the render path has no non-null assertions.
  const socials = SOCIAL_META.flatMap((meta) => {
    const url = socialLinks?.[meta.key];
    return url ? [{ ...meta, url }] : [];
  });

  const sponsorList = sponsors ?? [];
  const unsubscribeHref = unsubscribeUrl || profileUrl;

  return (
    <Html lang="en">
      <Head>
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
      </Head>
      <Preview>{messages.preview}</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: CONTAINER_BG,
          fontFamily: fonts.sans,
        }}
      >
        <Container
          style={{
            width: "100%",
            maxWidth: CONTAINER_WIDTH,
            margin: "0 auto",
            padding: 0,
          }}
        >
          {coverImageUrl ? <CoverHero src={coverImageUrl} alt={athleteFirstName} /> : null}

          {sponsorList.length > 0 ? (
            <SponsorsStrip sponsors={sponsorList} label={messages.partnersLabel} />
          ) : null}

          <BodyCard
            heading={messages.greetingHeading}
            paragraphs={paragraphs}
            signatureName={athleteFirstName}
          />

          {socials.length > 0 ? (
            <SocialRow socials={socials} label={messages.followSocial} />
          ) : null}

          <EmailFooter
            footerNote={messages.footerNote}
            unsubscribeLabel={messages.unsubscribeLabel}
            unsubscribeHref={unsubscribeHref}
          />

          <Section style={{ height: 24, backgroundColor: CONTAINER_BG, fontSize: 0, lineHeight: 0 }}>
            &nbsp;
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

WelcomeEmail.PreviewProps = {
  profileUrl: "https://halocollective.com/arthur-rinderknech",
  athleteFirstName: "Arthur",
  coverImageUrl:
    "https://img.mailinblue.com/10839939/images/content_library/original/69ccd7344ec5dc981bb4ed9c.jpg",
  welcomeMessage:
    "Voilà, je me lance. Et honnêtement, il était temps.\n\nJ'avais envie d'ouvrir un canal plus direct pour partager ce qu'on ne voit pas toujours. Les coulisses, les vrais moments, et tout ce qui se joue au-delà des images et des résultats.\n\nIci, tu pourras suivre mon parcours de plus près. Ce qui se passe sur le court, bien sûr, mais aussi tout ce qu'il y a autour : la préparation, les moments charnières, les sensations, les déplacements, le rythme du circuit, et la vie en dehors du tennis.\n\nMerci d'être là.",
  sponsors: [
    {
      id: "psycho-bunny",
      name: "Psycho Bunny",
      logoUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69ccda509acbdce6e91ba758.png",
      websiteUrl: "https://www.psychobunny.com/",
    },
    {
      id: "tecnifibre",
      name: "Tecnifibre",
      logoUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69ccda544ec5dc981bb4ef76.png",
      websiteUrl: "https://www.tecnifibre.com/",
    },
    {
      id: "extia",
      name: "Extia",
      logoUrl:
        "https://img.mailinblue.com/10839939/images/content_library/original/69ccda5a4ec5dc981bb4ef7a.png",
      websiteUrl: "https://www.extia-group.com/",
    },
  ],
  socialLinks: {
    instagram: "https://www.instagram.com/arthurrinder",
    x: "https://x.com/arthurrinder",
  },
  messages: {
    preview: "You're in. Welcome to Arthur's circle.",
    greetingHeading: "Welcome Adrien!",
    fallbackBody:
      "Thanks for stepping inside. The next edition will land here the moment I publish it — until then, the back catalogue lives on my profile.",
    partnersLabel: "Partners",
    followSocial: "Follow Arthur on socials",
    unsubscribeLabel: "Unsubscribe",
    footerNote:
      "You're receiving this because you subscribed to Arthur Rinderknech's newsletter on Halo Collective.",
  },
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
