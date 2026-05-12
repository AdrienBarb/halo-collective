import { cache } from "react";
import { NewsletterStatus, Prisma } from "@prisma/client";
import type { Athlete, Newsletter, NewsletterSection } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  CreateNewsletterOutput,
  UpdateNewsletterOutput,
} from "@/lib/schemas/newsletter";
import type {
  EditionModeValue,
  SectionTypeValue,
} from "@/lib/schemas/newsletterSection";
import { validateSectionBlocks } from "@/lib/schemas/newsletterSection";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/lib/errors/AppError";
import { createCampaign, sendCampaignNow } from "@/lib/brevo/campaigns";
import { getRequiredEnv } from "@/lib/utils/env";
import config from "@/lib/config";
import { render } from "@react-email/render";
import { getTranslations } from "next-intl/server";
import { NewsletterEmail } from "@/lib/emails/NewsletterEmail";
import { DEFAULT_LOCALE } from "@/i18n/locales";

// Cap slug-collision retries at a small number. The original 50× was
// excessive; if we collide ~5 times the slug strategy is wrong and we
// should fail loudly rather than silently retry.
const MAX_CREATE_ATTEMPTS = 5;

function logNewsletter(event: string, data: Record<string, unknown>) {
  console.log(JSON.stringify({ scope: "newsletter.service", event, ...data }));
}

// Decide whether a Prisma P2002 unique-violation refers to a specific
// constraint target. Prisma 7 with the pg driver adapter often surfaces
// `meta.target` as the Postgres constraint *name* (e.g.
// `newsletter_athleteId_editionNumber_key`) rather than a `string[]` of
// field names — and the constraint name is sometimes omitted entirely,
// leaving only the human-readable `error.message`. We scan all three so
// detection is resilient across driver versions.
function p2002Haystack(
  error: Prisma.PrismaClientKnownRequestError,
): string {
  const target = error.meta?.target;
  const targetStr = Array.isArray(target)
    ? target.join(",")
    : typeof target === "string"
      ? target
      : "";
  return `${targetStr} ${error.message}`.toLowerCase();
}

function isSlugCollision(error: Prisma.PrismaClientKnownRequestError): boolean {
  return p2002Haystack(error).includes("slug");
}

function isEditionNumberCollision(
  error: Prisma.PrismaClientKnownRequestError,
): boolean {
  return p2002Haystack(error).includes("editionnumber");
}

function logPrismaUniqueViolation(
  scope: string,
  error: Prisma.PrismaClientKnownRequestError,
  context: Record<string, unknown>,
) {
  logNewsletter("p2002_unique_violation", {
    scope,
    target: error.meta?.target ?? null,
    modelName: error.meta?.modelName ?? null,
    message: error.message,
    ...context,
  });
}

interface SectionRowInput {
  type: SectionTypeValue;
  order: number;
  blocks: Prisma.InputJsonValue;
}

/**
 * Validate every section's blocks against the per-(type, mode) schema
 * and shape them into a row payload Prisma can persist. Validation runs
 * before any DB writes; a single bad block fails the whole batch so we
 * never half-commit an edition. The single Prisma.InputJsonValue cast
 * is centralised here.
 */
function buildSectionRows(
  sections: Array<{ type: SectionTypeValue; blocks: unknown }>,
  mode: EditionModeValue,
): SectionRowInput[] {
  return sections.map((s, index) => ({
    type: s.type,
    order: index,
    // .parse() output (including Zod defaults) is what we persist —
    // keeps stored JSON canonical with the schema.
    blocks: validateSectionBlocks(s.type, mode, s.blocks) as Prisma.InputJsonValue,
  }));
}

interface HeaderFields {
  title?: string;
  emailSubject?: string | null;
  heroImageUrl?: string | null;
  editionDate?: Date | null;
  editionMode?: EditionModeValue;
  tournamentName?: string | null;
  tournamentLogoUrl?: string | null;
  tournamentCategory?: string | null;
  tournamentLocation?: string | null;
  tournamentSurface?: string | null;
  tournamentStartDate?: Date | null;
  tournamentEndDate?: Date | null;
  worldRankSnapshot?: number | null;
  countryRankSnapshot?: number | null;
}

function buildHeaderData(
  input:
    | Omit<CreateNewsletterOutput, "athleteId" | "sections" | "slug" | "editionNumber">
    | UpdateNewsletterOutput,
): HeaderFields {
  return {
    title: input.title,
    emailSubject: input.emailSubject,
    heroImageUrl: input.heroImageUrl,
    editionDate: input.editionDate,
    editionMode: input.editionMode,
    tournamentName: input.tournamentName,
    tournamentLogoUrl: input.tournamentLogoUrl,
    tournamentCategory: input.tournamentCategory,
    tournamentLocation: input.tournamentLocation,
    tournamentSurface: input.tournamentSurface,
    tournamentStartDate: input.tournamentStartDate,
    tournamentEndDate: input.tournamentEndDate,
    worldRankSnapshot: input.worldRankSnapshot,
    countryRankSnapshot: input.countryRankSnapshot,
  };
}

export const listPublishedByAthleteId = cache(async (athleteId: string) => {
  return prisma.newsletter.findMany({
    where: {
      athleteId,
      status: NewsletterStatus.PUBLISHED,
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: { sort: "desc", nulls: "last" } },
    include: { sections: { orderBy: { order: "asc" } } },
  });
});

export const getPublishedNewsletterBySlugs = cache(
  async (athleteSlug: string, editionSlug: string) => {
    return prisma.newsletter.findFirst({
      where: {
        slug: editionSlug,
        status: NewsletterStatus.PUBLISHED,
        athlete: { slug: athleteSlug },
      },
      include: {
        athlete: true,
        sections: { orderBy: { order: "asc" } },
      },
    });
  },
);

export async function listAllByAthleteId(athleteId: string) {
  return prisma.newsletter.findMany({
    where: { athleteId },
    orderBy: [{ editionNumber: "desc" }],
  });
}

export async function listAllForAdmin() {
  return prisma.newsletter.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      athlete: {
        select: { id: true, firstName: true, lastName: true, slug: true },
      },
    },
  });
}

export async function getNewsletterById(id: string) {
  return prisma.newsletter.findUnique({
    where: { id },
    include: {
      athlete: {
        select: { id: true, firstName: true, lastName: true, slug: true },
      },
      sections: { orderBy: { order: "asc" } },
    },
  });
}

export async function createNewsletter(input: CreateNewsletterOutput) {
  const { athleteId, slug: baseSlug, editionNumber, sections, title } = input;
  const editionMode: EditionModeValue = input.editionMode ?? "WEEKLY";

  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    select: { id: true },
  });
  if (!athlete) {
    throw new NotFoundError("Athlete not found");
  }

  const sectionsToCreate = buildSectionRows(sections ?? [], editionMode);

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    try {
      return await prisma.newsletter.create({
        data: {
          athleteId,
          slug,
          editionNumber,
          title,
          emailSubject: input.emailSubject,
          editionMode,
          heroImageUrl: input.heroImageUrl,
          editionDate: input.editionDate,
          tournamentName: input.tournamentName,
          tournamentLogoUrl: input.tournamentLogoUrl,
          tournamentCategory: input.tournamentCategory,
          tournamentLocation: input.tournamentLocation,
          tournamentSurface: input.tournamentSurface,
          tournamentStartDate: input.tournamentStartDate,
          tournamentEndDate: input.tournamentEndDate,
          worldRankSnapshot: input.worldRankSnapshot,
          countryRankSnapshot: input.countryRankSnapshot,
          sections: sectionsToCreate.length
            ? { create: sectionsToCreate }
            : undefined,
        },
        include: { sections: { orderBy: { order: "asc" } } },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        logPrismaUniqueViolation("createNewsletter", error, {
          athleteId,
          baseSlug,
          editionNumber,
          attempt: attempt + 1,
        });
        if (isEditionNumberCollision(error)) {
          throw new ConflictError(
            `Edition number ${editionNumber} already exists for this athlete`,
          );
        }
        if (isSlugCollision(error)) {
          logNewsletter("slug_collision_retry", {
            athleteId,
            baseSlug,
            attempt: attempt + 1,
          });
          continue;
        }
      }
      throw error;
    }
  }
  throw new ConflictError("Could not create newsletter — please retry");
}

export async function updateNewsletter(
  id: string,
  input: UpdateNewsletterOutput,
) {
  // Need the current editionMode to validate WEEK_RECAP blocks correctly
  // when the editor doesn't change it in this update.
  const existing = await prisma.newsletter.findUnique({
    where: { id },
    select: { editionMode: true },
  });
  if (!existing) {
    throw new NotFoundError("Newsletter not found");
  }
  const editionMode: EditionModeValue =
    input.editionMode ?? (existing.editionMode as EditionModeValue);

  const sectionsToReplace = input.sections
    ? buildSectionRows(input.sections, editionMode)
    : undefined;

  try {
    return await prisma.$transaction(async (tx) => {
      if (sectionsToReplace) {
        await tx.newsletterSection.deleteMany({ where: { newsletterId: id } });
        if (sectionsToReplace.length > 0) {
          await tx.newsletterSection.createMany({
            data: sectionsToReplace.map((s) => ({ ...s, newsletterId: id })),
          });
        }
      }
      return tx.newsletter.update({
        where: { id },
        data: {
          slug: input.slug,
          editionNumber: input.editionNumber,
          // Any edit invalidates the cached Brevo HTML — the next
          // publish should re-render from current data.
          renderedHtml: null,
          ...buildHeaderData(input),
        },
        include: {
          athlete: { select: { slug: true } },
          sections: { orderBy: { order: "asc" } },
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictError(
          "A newsletter with this slug or edition number already exists for this athlete",
        );
      }
      if (error.code === "P2025") {
        throw new NotFoundError("Newsletter not found");
      }
    }
    throw error;
  }
}

export async function cloneFromPreviousEdition(athleteId: string) {
  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
    const previous = await prisma.newsletter.findFirst({
      where: { athleteId },
      orderBy: { editionNumber: "desc" },
      include: { sections: { orderBy: { order: "asc" } } },
    });
    if (!previous) {
      throw new NotFoundError("No previous newsletter to clone from");
    }

    const nextEditionNumber = previous.editionNumber + 1;
    const baseSlug = `edition-${nextEditionNumber}`;
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const editionMode = previous.editionMode as EditionModeValue;

    // Re-validate every section against the *current* schema; drop
    // (and log) any whose stored shape no longer parses. Without this
    // a single legacy block would 500 the whole clone.
    const sectionsToCreate: SectionRowInput[] = [];
    let nextOrder = 0;
    for (const s of previous.sections) {
      try {
        const blocks = validateSectionBlocks(
          s.type as SectionTypeValue,
          editionMode,
          s.blocks,
        );
        sectionsToCreate.push({
          type: s.type as SectionTypeValue,
          order: nextOrder++,
          blocks: blocks as Prisma.InputJsonValue,
        });
      } catch (validationError) {
        logNewsletter("clone_dropped_section", {
          athleteId,
          previousId: previous.id,
          sectionId: s.id,
          sectionType: s.type,
          // Don't dump the full ZodError (verbose, may leak structure
          // shape) — just the kinds of issues seen.
          reason:
            validationError instanceof Error
              ? validationError.name
              : "validation_failed",
        });
      }
    }

    try {
      return await prisma.newsletter.create({
        data: {
          athleteId,
          slug,
          editionNumber: nextEditionNumber,
          title: previous.title,
          emailSubject: previous.emailSubject,
          editionMode,
          heroImageUrl: previous.heroImageUrl,
          editionDate: null,
          tournamentName: previous.tournamentName,
          tournamentLogoUrl: previous.tournamentLogoUrl,
          tournamentCategory: previous.tournamentCategory,
          tournamentLocation: previous.tournamentLocation,
          tournamentSurface: previous.tournamentSurface,
          tournamentStartDate: previous.tournamentStartDate,
          tournamentEndDate: previous.tournamentEndDate,
          worldRankSnapshot: previous.worldRankSnapshot,
          countryRankSnapshot: previous.countryRankSnapshot,
          sections: sectionsToCreate.length
            ? { create: sectionsToCreate }
            : undefined,
        },
        include: { sections: { orderBy: { order: "asc" } } },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        logPrismaUniqueViolation("cloneFromPreviousEdition", error, {
          athleteId,
          slug,
          editionNumber: nextEditionNumber,
          attempt: attempt + 1,
        });
        if (isSlugCollision(error) || isEditionNumberCollision(error)) {
          logNewsletter("clone_collision_retry", {
            athleteId,
            slug,
            editionNumber: nextEditionNumber,
            attempt: attempt + 1,
          });
          continue;
        }
      }
      throw error;
    }
  }
  throw new ConflictError("Could not clone newsletter — please retry");
}

// ── Brevo publish ─────────────────────────────────────────────────────

type NewsletterWithAthlete = Newsletter & {
  athlete: Athlete & {
    sponsors: Array<{ name: string; logoUrl: string; websiteUrl: string }>;
  };
  sections: NewsletterSection[];
};

interface BrevoConfig {
  senderEmail: string;
  replyToEmail: string;
}

function logBrevo(event: string, data: Record<string, unknown>) {
  console.log(JSON.stringify({ scope: "brevo.publish", event, ...data }));
}

function loadBrevoConfig(): BrevoConfig {
  return {
    senderEmail: getRequiredEnv("BREVO_SENDER_EMAIL"),
    replyToEmail: getRequiredEnv("BREVO_REPLY_TO_EMAIL"),
  };
}

async function loadNewsletterWithAthlete(
  id: string,
): Promise<NewsletterWithAthlete> {
  const newsletter = await prisma.newsletter.findUnique({
    where: { id },
    include: {
      // Sponsors are loaded inline (no separate query) so publish and
      // archive renders see the same set without a second round-trip.
      athlete: {
        include: {
          sponsors: {
            orderBy: { order: "asc" },
            select: { name: true, logoUrl: true, websiteUrl: true },
          },
        },
      },
      sections: { orderBy: { order: "asc" } },
    },
  });
  if (!newsletter) {
    throw new NotFoundError("Newsletter not found");
  }
  return newsletter;
}

const SLUG_PATTERN = /^[a-z0-9-]+$/;

function resolveAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BETTER_AUTH_URL ||
    config.project.url
  );
}

function buildEditionUrl(athleteSlug: string, editionSlug: string): string {
  if (!SLUG_PATTERN.test(athleteSlug) || !SLUG_PATTERN.test(editionSlug)) {
    throw new BadRequestError("Invalid athlete or edition slug");
  }
  const url = new URL(`/${athleteSlug}`, resolveAppBaseUrl());
  url.searchParams.set("edition", editionSlug);
  return url.toString();
}

function buildAskQuestionUrl(athleteSlug: string): string {
  if (!SLUG_PATTERN.test(athleteSlug)) {
    throw new BadRequestError("Invalid athlete slug");
  }
  return new URL(
    `/athletes/${athleteSlug}/feedback`,
    resolveAppBaseUrl(),
  ).toString();
}

export interface NewsletterEmailRenderInput {
  title: string;
  slug: string;
  heroImageUrl?: string | null;
  editionNumber: number;
  editionDate?: Date | string | null;
  editionMode: EditionModeValue;
  tournamentName?: string | null;
  tournamentLogoUrl?: string | null;
  tournamentCategory?: string | null;
  tournamentLocation?: string | null;
  tournamentSurface?: string | null;
  tournamentStartDate?: Date | string | null;
  tournamentEndDate?: Date | string | null;
  worldRankSnapshot?: number | null;
  countryRankSnapshot?: number | null;
  sections: Array<{
    id: string;
    type: SectionTypeValue;
    order: number;
    blocks: unknown;
  }>;
}

export type AthleteForEmail = Pick<
  Athlete,
  | "firstName"
  | "lastName"
  | "slug"
  | "countryCode"
  | "countryName"
  | "worldRank"
  | "titlesCount"
> & {
  sponsors: Array<{ name: string; logoUrl: string; websiteUrl: string }>;
};

/**
 * Defensive URL guard. The Zod schemas at the publish/admin boundary
 * reject non-https URLs at write time — this is the runtime backstop
 * in case a stale row carries a `javascript:` / `data:` href.
 */
function safeUrl(url: string | null | undefined): string {
  if (!url) return "#";
  return /^https?:\/\//i.test(url) ? url : "#";
}

async function renderEmailHtml(
  athlete: AthleteForEmail,
  input: NewsletterEmailRenderInput,
): Promise<string> {
  const editionUrl = buildEditionUrl(athlete.slug, input.slug);
  const askQuestionUrl = buildAskQuestionUrl(athlete.slug);
  const athleteName = `${athlete.firstName} ${athlete.lastName}`;
  // TODO: per-recipient locale requires splitting Brevo lists by language.
  // v1 sends every recipient the EN edition wrapper; athlete content remains as-authored.
  const locale = DEFAULT_LOCALE;
  const t = await getTranslations({ locale, namespace: "Emails.Newsletter" });
  const editionLabel = t("editionLabel", {
    n: input.editionNumber.toString().padStart(2, "0"),
  });
  return render(
    NewsletterEmail({
      title: input.title,
      heroImageUrl: safeUrl(input.heroImageUrl),
      editionMode: input.editionMode,
      athleteName,
      editionUrl,
      askQuestionUrl,
      editionNumber: input.editionNumber,
      editionDate: input.editionDate,
      countryName: athlete.countryName,
      // Per-edition snapshot wins when present, falls back to athlete profile.
      worldRank: input.worldRankSnapshot ?? athlete.worldRank,
      titlesCount: athlete.titlesCount,
      sponsors: athlete.sponsors,
      tournamentName: input.tournamentName,
      tournamentLogoUrl: safeUrl(input.tournamentLogoUrl),
      tournamentCategory: input.tournamentCategory,
      tournamentLocation: input.tournamentLocation,
      tournamentSurface: input.tournamentSurface,
      tournamentStartDate: input.tournamentStartDate,
      tournamentEndDate: input.tournamentEndDate,
      sections: input.sections,
      locale,
      messages: {
        shell: {
          editionLabel,
          footerNote: t("footerNote", { athleteName }),
          unsubscribe: t("unsubscribe"),
          viewInBrowser: t("viewInBrowser"),
        },
        identity: {
          worldAtp: t("worldAtp"),
          careerTitles: t("careerTitles"),
          myPartners: t("myPartners"),
          member: t("member"),
        },
      },
    }),
  );
}

/**
 * Single mapping from a Newsletter row → render input. Publish and
 * preview MUST both call this so they cannot drift — the publish path
 * is what gets sent, the preview is what the admin signed off on, and
 * any field present in one MUST be present in the other.
 */
export function toRenderInput(newsletter: Newsletter): NewsletterEmailRenderInput {
  return {
    title: newsletter.title,
    slug: newsletter.slug,
    heroImageUrl: newsletter.heroImageUrl,
    editionNumber: newsletter.editionNumber,
    editionDate: newsletter.editionDate,
    editionMode: newsletter.editionMode as EditionModeValue,
    tournamentName: newsletter.tournamentName,
    tournamentLogoUrl: newsletter.tournamentLogoUrl,
    tournamentCategory: newsletter.tournamentCategory,
    tournamentLocation: newsletter.tournamentLocation,
    tournamentSurface: newsletter.tournamentSurface,
    tournamentStartDate: newsletter.tournamentStartDate,
    tournamentEndDate: newsletter.tournamentEndDate,
    worldRankSnapshot: newsletter.worldRankSnapshot,
    countryRankSnapshot: newsletter.countryRankSnapshot,
    // Sections are added by the caller because preview drafts and
    // persisted rows have different section shapes.
    sections: [],
  };
}

async function renderNewsletterEmail(
  newsletter: NewsletterWithAthlete,
): Promise<string> {
  const input = toRenderInput(newsletter);
  input.sections = newsletter.sections.map((s) => ({
    id: s.id,
    type: s.type as SectionTypeValue,
    order: s.order,
    blocks: s.blocks,
  }));
  return renderEmailHtml(newsletter.athlete, input);
}

export async function renderNewsletterPreviewEmail(
  athlete: AthleteForEmail,
  input: NewsletterEmailRenderInput,
): Promise<string> {
  return renderEmailHtml(athlete, input);
}

async function claimForSending(
  id: string,
  renderedHtml: string,
): Promise<void> {
  const { count } = await prisma.newsletter.updateMany({
    where: {
      id,
      status: NewsletterStatus.DRAFT,
      brevoCampaignId: null,
    },
    data: {
      status: NewsletterStatus.SENDING,
      renderedHtml,
    },
  });
  if (count !== 1) {
    throw new ConflictError(
      "Newsletter is not in a publishable state (already sending or published)",
    );
  }
}

async function markPublished(
  id: string,
  campaignId: number,
): Promise<NewsletterWithAthlete> {
  const now = new Date();
  return prisma.newsletter.update({
    where: { id },
    data: {
      status: NewsletterStatus.PUBLISHED,
      publishedAt: now,
      brevoSentAt: now,
      brevoCampaignId: String(campaignId),
    },
    include: {
      athlete: {
        include: {
          sponsors: {
            orderBy: { order: "asc" },
            select: { name: true, logoUrl: true, websiteUrl: true },
          },
        },
      },
      sections: { orderBy: { order: "asc" } },
    },
  });
}

// Re-publishing a previously-sent edition deliberately does NOT
// re-render — `renderedHtml` is the canonical archive of what Brevo
// actually shipped. The web reader's "View in browser" link must
// serve this string verbatim, never re-render from live athlete data
// (titlesCount may have changed; sponsors may have churned). The
// editor enforces the other half of the invariant: `updateNewsletter`
// sets `renderedHtml = null` on any edit, so a stale archive can only
// exist between an edit and the next republish.
async function republishWithoutResending(
  id: string,
  previouslyPublishedAt: Date | null,
) {
  return prisma.newsletter.update({
    where: { id },
    data: {
      status: NewsletterStatus.PUBLISHED,
      publishedAt: previouslyPublishedAt ?? new Date(),
    },
    include: { athlete: { select: { slug: true } } },
  });
}

export async function publishNewsletter(id: string) {
  const newsletter = await loadNewsletterWithAthlete(id);

  if (newsletter.status === NewsletterStatus.PUBLISHED) {
    throw new ConflictError("Newsletter is already published");
  }
  if (newsletter.status === NewsletterStatus.SENDING) {
    throw new ConflictError(
      "Publish in progress or stuck — check Brevo and reset the row manually",
    );
  }
  if (newsletter.sections.length === 0) {
    throw new BadRequestError(
      "Newsletter has no sections — add at least one before publishing",
    );
  }

  if (newsletter.brevoCampaignId) {
    return republishWithoutResending(id, newsletter.publishedAt);
  }

  if (newsletter.athlete.brevoListId === null) {
    throw new BadRequestError(
      "Athlete has no Brevo list — recreate athlete or set brevoListId manually.",
    );
  }

  const brevoConfig = loadBrevoConfig();
  const athleteName = `${newsletter.athlete.firstName} ${newsletter.athlete.lastName}`;
  const renderedHtml = await renderNewsletterEmail(newsletter);

  await claimForSending(id, renderedHtml);
  logBrevo("claimed", { newsletterId: id });

  // Defense-in-depth: schema already rejects CRLF, but strip survivors
  // before handing the string to Brevo as `subject`.
  const rawSubject = newsletter.emailSubject ?? newsletter.title;
  const subject = rawSubject.replace(/[\r\n\t]+/g, " ").slice(0, 200);
  const campaignId = await createCampaign({
    name: `${athleteName} — Edition #${newsletter.editionNumber} (${newsletter.slug})`,
    subject,
    htmlContent: renderedHtml,
    sender: { name: athleteName, email: brevoConfig.senderEmail },
    listIds: [newsletter.athlete.brevoListId],
    replyTo: brevoConfig.replyToEmail,
  });
  logBrevo("campaign_created", { newsletterId: id, campaignId });

  await prisma.newsletter.update({
    where: { id },
    data: { brevoCampaignId: String(campaignId) },
  });

  await sendCampaignNow(campaignId);
  logBrevo("campaign_sent", { newsletterId: id, campaignId });

  try {
    return await markPublished(id, campaignId);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Newsletter not found");
    }
    throw error;
  }
}

export async function unpublishNewsletter(id: string) {
  const { count } = await prisma.newsletter.updateMany({
    where: { id, status: NewsletterStatus.PUBLISHED },
    data: {
      status: NewsletterStatus.DRAFT,
      publishedAt: null,
    },
  });
  if (count !== 1) {
    const existing = await prisma.newsletter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Newsletter not found");
    throw new ConflictError(
      "Newsletter is not currently published (cannot unpublish)",
    );
  }
  return prisma.newsletter.findUniqueOrThrow({
    where: { id },
    include: { athlete: { select: { slug: true } } },
  });
}

export async function deleteNewsletter(id: string) {
  try {
    return await prisma.newsletter.delete({
      where: { id },
      include: { athlete: { select: { slug: true } } },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Newsletter not found");
    }
    throw error;
  }
}
