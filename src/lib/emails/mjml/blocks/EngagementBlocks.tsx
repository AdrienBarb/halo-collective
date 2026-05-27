import { MjmlText } from "@faire/mjml-react";
import type {
  ChallengeBlock as ChallengeBlockType,
  MediaBlock as MediaBlockType,
  PollBlock as PollBlockType,
  PredictionBlock as PredictionBlockType,
  PrizeDrawBlock as PrizeDrawBlockType,
  QABlock as QABlockType,
  QuizBlock as QuizBlockType,
  SurveyBlock as SurveyBlockType,
} from "@/lib/schemas/newsletterSection";
import {
  getNewsletterLabels,
  type NewsletterLocale,
} from "@/lib/newsletter/labels";
import { parseYouTubeId } from "@/lib/newsletter/youtube";
import { palette, fonts } from "@/lib/emails/_brand/theme";
import EngagementCard from "@/lib/emails/mjml/blocks/EngagementCard";
import { safeHttpUrl } from "@/lib/emails/mjml/_brand/url";
import {
  escapeHtml,
  singleQuoteFontStack,
} from "@/lib/emails/mjml/_brand/html";

interface CommonProps {
  ctaUrl?: string;
  locale: NewsletterLocale;
}

function OptionsPreview({
  options,
}: {
  options: Array<{ label: string; emoji?: string }>;
}) {
  if (options.length === 0) return null;
  return (
    <>
      {options.map((opt, i) => (
        <MjmlText
          key={i}
          color={palette.textBody}
          fontFamily={fonts.sans}
          fontSize="13px"
          padding={i === 0 ? "10px 0 0" : "6px 0 0"}
        >
          {opt.emoji ? `${opt.emoji}  ` : "•  "}
          {opt.label}
        </MjmlText>
      ))}
    </>
  );
}

// Inline-render media within an EngagementCard column. Real MediaBlock
// can't be used here because mj-section can't be nested inside mj-column;
// for engagement context we always render image/video as a preview tile
// and skip non-visual kinds gracefully.
function InlineCardMedia({ media }: { media: MediaBlockType }) {
  if (media.kind === "image") {
    return (
      <MjmlText padding="10px 0 0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.url}
          alt={media.alt ?? ""}
          width={500}
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            borderRadius: 8,
          }}
        />
      </MjmlText>
    );
  }

  if (media.kind === "video") {
    const youtubeId = parseYouTubeId(media.url);
    const isYouTube = youtubeId !== null;
    const poster =
      media.thumbnailUrl ??
      (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null);
    const safeUrl = escapeHtml(safeHttpUrl(media.url));
    const monoFont = singleQuoteFontStack(fonts.mono);
    const label = escapeHtml(isYouTube ? "Watch on YouTube" : "Watch");
    const posterHtml = poster
      ? `<img src="${escapeHtml(poster)}" alt="" width="500" style="display:block;width:100%;height:auto;" />`
      : "";
    const ctaHtml = `<div style="background-color:${palette.panelDark};color:${palette.accent};font-family:${monoFont};font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;text-align:center;padding:${poster ? "12px 16px" : "32px 16px"};">▶ ${label}</div>`;
    const html = `
      <a href="${safeUrl}" style="display:block;border-radius:8px;overflow:hidden;text-decoration:none;">
        ${posterHtml}
        ${ctaHtml}
      </a>
    `;
    return (
      <MjmlText padding="10px 0 0">
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </MjmlText>
    );
  }

  if (media.kind === "text") {
    const sansFont = singleQuoteFontStack(fonts.sans);
    const text = escapeHtml(media.body);
    const html = `<div style="color:${palette.textBody};font-family:${sansFont};font-size:14px;line-height:1.6;">${text}</div>`;
    return (
      <MjmlText padding="10px 0 0">
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </MjmlText>
    );
  }

  // audio
  const monoFont = singleQuoteFontStack(fonts.mono);
  const sansFont = singleQuoteFontStack(fonts.sans);
  const safeUrl = escapeHtml(safeHttpUrl(media.url));
  const titleHtml = media.title ? escapeHtml(media.title) : null;
  const meta = [media.location, media.durationLabel]
    .filter((s): s is string => Boolean(s))
    .map(escapeHtml)
    .join(" · ");
  const audioHtml = `
    <a href="${safeUrl}" style="display:block;background-color:${palette.surface};border:1px solid ${palette.border};border-radius:8px;padding:12px 14px;text-decoration:none;margin-top:10px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:44px;vertical-align:middle;">
            <div style="width:36px;height:36px;line-height:36px;border-radius:18px;background-color:${palette.panelDark};color:${palette.accent};text-align:center;font-family:${monoFont};font-size:14px;">▶</div>
          </td>
          <td style="vertical-align:middle;padding-left:12px;">
            ${
              titleHtml
                ? `<div style="margin:0;color:${palette.panelDark};font-family:${sansFont};font-size:14px;font-weight:600;">${titleHtml}</div>`
                : ""
            }
            ${
              meta
                ? `<div style="margin:4px 0 0;color:${palette.textMuted};font-family:${monoFont};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;">${meta}</div>`
                : ""
            }
          </td>
        </tr>
      </table>
    </a>
  `;
  return (
    <MjmlText padding="0">
      <span dangerouslySetInnerHTML={{ __html: audioHtml }} />
    </MjmlText>
  );
}

export function PollBlock({
  block,
  ctaUrl,
  locale,
}: { block: PollBlockType } & CommonProps) {
  const labels = getNewsletterLabels(locale);
  return (
    <EngagementCard
      eyebrow={labels.engagementEyebrows.poll}
      prompt={block.question}
      ctaUrl={ctaUrl}
      ctaLabel={labels.ctas.vote}
      closesAt={block.closesAt}
    >
      <OptionsPreview options={block.options} />
    </EngagementCard>
  );
}

export function PredictionBlock({
  block,
  ctaUrl,
  locale,
}: { block: PredictionBlockType } & CommonProps) {
  const labels = getNewsletterLabels(locale);
  return (
    <EngagementCard
      eyebrow={labels.engagementEyebrows.prediction}
      prompt={block.prompt}
      ctaUrl={ctaUrl}
      ctaLabel={labels.ctas.vote}
      closesAt={block.closesAt}
    >
      <OptionsPreview options={block.options} />
    </EngagementCard>
  );
}

export function QuizBlock({
  block,
  ctaUrl,
  locale,
}: { block: QuizBlockType } & CommonProps) {
  const labels = getNewsletterLabels(locale);
  return (
    <EngagementCard
      eyebrow={labels.engagementEyebrows.quiz}
      prompt={block.question}
      ctaUrl={ctaUrl}
      ctaLabel={labels.ctas.vote}
      closesAt={block.closesAt}
    >
      <OptionsPreview
        options={block.options.map((o) => ({ label: o.label }))}
      />
    </EngagementCard>
  );
}

export function PrizeDrawBlock({
  block,
  ctaUrl,
  locale,
}: { block: PrizeDrawBlockType } & CommonProps) {
  const labels = getNewsletterLabels(locale);
  return (
    <EngagementCard
      eyebrow={labels.engagementEyebrows.prize_draw}
      prompt={block.title}
      body={block.body}
      ctaUrl={ctaUrl}
      ctaLabel={block.ctaLabel ?? labels.ctas.enterDraw}
      closesAt={block.closesAt}
    >
      {block.prizeMedia ? <InlineCardMedia media={block.prizeMedia} /> : null}
    </EngagementCard>
  );
}

export function QABlock({
  block,
  ctaUrl,
  locale,
}: { block: QABlockType } & CommonProps) {
  const labels = getNewsletterLabels(locale);
  return (
    <EngagementCard
      eyebrow={labels.engagementEyebrows.qa}
      prompt={block.prompt}
      body={block.intro}
      ctaUrl={ctaUrl}
      ctaLabel={labels.ctas.askMe}
      reassurance={block.reassurance ?? labels.reassuranceText}
    />
  );
}

export function SurveyBlock({
  block,
  ctaUrl,
  locale,
}: { block: SurveyBlockType } & CommonProps) {
  const labels = getNewsletterLabels(locale);
  const href = block.externalUrl ?? ctaUrl;
  return (
    <EngagementCard
      eyebrow={labels.engagementEyebrows.survey}
      prompt={block.title}
      body={block.body}
      ctaUrl={href}
      ctaLabel={labels.ctas.learnMore}
    />
  );
}

export function ChallengeBlock({
  block,
  locale,
}: { block: ChallengeBlockType; locale: NewsletterLocale }) {
  const labels = getNewsletterLabels(locale);
  return (
    <EngagementCard
      eyebrow={labels.engagementEyebrows.challenge}
      prompt={block.title}
      body={block.brief}
    >
      {block.media ? <InlineCardMedia media={block.media} /> : null}
    </EngagementCard>
  );
}
