import {
  NewsletterStatus,
  type Newsletter,
  type NewsletterSection,
} from "@prisma/client";
import { z } from "zod";
import { NotFoundError } from "@/lib/errors/AppError";
import { prisma } from "@/lib/db/prisma";
import {
  renderNewsletterPreviewEmail,
  toRenderInput,
} from "@/lib/services/newsletter";
import { getAthleteBySlug } from "@/lib/services/athlete";
import {
  editionModeSchema,
  optionalSectionTitle,
  sectionTypeSchema,
  type EditionModeValue,
  type SectionTypeValue,
} from "@/lib/schemas/newsletterSection";
import { toSlug } from "@/lib/newsletter/slug";

export const draftPayloadSchema = z.object({
  athleteId: z.string().min(1),
  newsletterId: z.string().optional(),
  header: z.object({
    title: z.string().optional(),
    emailSubject: z.string().optional().nullable(),
    slug: z.string().optional(),
    heroImageUrl: z.string().optional().nullable(),
    editionNumber: z.coerce.number().int().positive().optional(),
    editionDate: z.string().optional().nullable(),
    editionMode: editionModeSchema.optional(),
    tournamentName: z.string().optional().nullable(),
    tournamentLogoUrl: z.string().optional().nullable(),
    tournamentCategory: z.string().optional().nullable(),
    tournamentLocation: z.string().optional().nullable(),
    tournamentSurface: z.string().optional().nullable(),
    tournamentStartDate: z.string().optional().nullable(),
    tournamentEndDate: z.string().optional().nullable(),
    worldRankSnapshot: z.coerce.number().int().positive().optional().nullable(),
    countryRankSnapshot: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .nullable(),
  }),
  sections: z.array(
    z.object({
      type: sectionTypeSchema,
      // Reuse the persisted-write schema so preview/test-send and publish
      // normalise titles identically — the toRenderInput invariant says
      // the preview MUST match what Brevo would send.
      title: optionalSectionTitle,
      blocks: z.unknown(),
    }),
  ),
});

export type DraftPayload = z.infer<typeof draftPayloadSchema>;

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

interface DraftPreviewAthleteRow {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
}

export interface DraftPreviewResult {
  athleteRow: DraftPreviewAthleteRow;
  athlete: NonNullable<Awaited<ReturnType<typeof getAthleteBySlug>>>;
  newsletter: Newsletter & { sections: NewsletterSection[] };
  emailHtml: string;
  title: string;
}

export async function buildDraftPreview(
  parsed: DraftPayload,
): Promise<DraftPreviewResult> {
  const athleteRow = await prisma.athlete.findUnique({
    where: { id: parsed.athleteId },
    select: { id: true, slug: true, firstName: true, lastName: true },
  });
  if (!athleteRow) throw new NotFoundError("Athlete not found");

  const athlete = await getAthleteBySlug(athleteRow.slug);
  if (!athlete) throw new NotFoundError("Athlete not found");

  const editionMode: EditionModeValue = parsed.header.editionMode ?? "WEEKLY";
  const rawTitle = parsed.header.title?.replace(/[\r\n\t]+/g, " ").trim();
  const title = (rawTitle && rawTitle.length > 0
    ? rawTitle
    : "Untitled draft"
  ).slice(0, 200);
  const slug =
    toSlug(parsed.header.slug ?? "") || toSlug(title) || "preview-draft";
  const editionNumber = parsed.header.editionNumber ?? 1;
  const now = new Date();
  const editionDate = toDate(parsed.header.editionDate) ?? now;
  const newsletterId = parsed.newsletterId ?? "preview";

  const sectionRows: NewsletterSection[] = parsed.sections.map((s, i) => ({
    id: `preview-section-${i}`,
    newsletterId,
    order: i,
    type: s.type as SectionTypeValue,
    title: s.title ?? null,
    blocks: s.blocks as NewsletterSection["blocks"],
    createdAt: now,
    updatedAt: now,
  }));

  const newsletter: Newsletter & { sections: NewsletterSection[] } = {
    id: newsletterId,
    athleteId: parsed.athleteId,
    editionNumber,
    editionDate,
    editionMode,
    title,
    emailSubject: parsed.header.emailSubject ?? null,
    slug,
    heroImageUrl: parsed.header.heroImageUrl ?? null,
    tournamentName: parsed.header.tournamentName ?? null,
    tournamentLogoUrl: parsed.header.tournamentLogoUrl ?? null,
    tournamentCategory: parsed.header.tournamentCategory ?? null,
    tournamentLocation: parsed.header.tournamentLocation ?? null,
    tournamentSurface: parsed.header.tournamentSurface ?? null,
    tournamentStartDate: toDate(parsed.header.tournamentStartDate),
    tournamentEndDate: toDate(parsed.header.tournamentEndDate),
    worldRankSnapshot: parsed.header.worldRankSnapshot ?? null,
    countryRankSnapshot: parsed.header.countryRankSnapshot ?? null,
    status: NewsletterStatus.DRAFT,
    publishedAt: null,
    renderedHtml: null,
    brevoCampaignId: null,
    brevoSentAt: null,
    createdAt: now,
    updatedAt: now,
    sections: sectionRows,
  };

  // toRenderInput is the single mapping shared with the publish path —
  // any header field added to one MUST flow through the other so admins
  // never approve a preview that diverges from what Brevo ships.
  const input = toRenderInput(newsletter);
  input.title = title;
  input.slug = slug;
  input.editionNumber = editionNumber;
  input.editionMode = editionMode;
  input.sections = sectionRows.map((s) => ({
    id: s.id,
    type: s.type as SectionTypeValue,
    order: s.order,
    title: s.title,
    blocks: s.blocks,
  }));
  const emailHtml = await renderNewsletterPreviewEmail(athlete, input);

  return { athleteRow, athlete, newsletter, emailHtml, title };
}
