import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { errorMessages } from "@/lib/constants/errorMessage";
import { BadRequestError, NotFoundError } from "@/lib/errors/AppError";
import {
  fanEngagementBlockSchema,
  type FanEngagementBlock,
} from "@/lib/schemas/newsletterSection";
import type { EngagementResponseOutput } from "@/lib/schemas/engagementResponse";

type AggregateKindWithCounts = "poll" | "prediction" | "quiz";

export interface EngagementAggregate {
  kind: FanEngagementBlock["kind"];
  optionCounts?: number[];
  totalResponses: number;
  /** Only set for quiz; null when the block has no isCorrect option. */
  correctOptionIndex?: number | null;
}

export interface UserEngagementResponse {
  optionIndex: number | null;
  isCorrect: boolean | null;
  reaction: string | null;
  rating: number | null;
  text: string | null;
  consentGiven: boolean | null;
  updatedAt: string;
}

export interface EngagementSnapshot {
  kind: FanEngagementBlock["kind"];
  isClosed: boolean;
  closesAt: string | null;
  aggregate: EngagementAggregate | null;
  userResponse: UserEngagementResponse | null;
}

/**
 * Parse a free-form `closesAt` string. Returns null when:
 *  - empty / undefined, or
 *  - not a valid Date.
 * A warning is logged for non-empty unparseable values so admin typos surface.
 */
function parseClosesAt(value: string | undefined | null): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    console.warn(
      JSON.stringify({
        scope: "fanEngagement.closesAt_unparseable",
        value: trimmed,
      }),
    );
    return null;
  }
  return date;
}

function isClosedNow(closesAt: Date | null): boolean {
  if (!closesAt) return false;
  return closesAt.getTime() <= Date.now();
}

/**
 * Walk FAN_ENGAGEMENT sections only. Filtering by section type avoids
 * accidental cross-section UUID collisions.
 */
function findBlockInSections(
  sections: { blocks: Prisma.JsonValue; type: string }[],
  blockId: string,
): FanEngagementBlock | null {
  for (const section of sections) {
    if (section.type !== "FAN_ENGAGEMENT") continue;
    if (!Array.isArray(section.blocks)) continue;
    for (const raw of section.blocks) {
      if (
        !raw ||
        typeof raw !== "object" ||
        Array.isArray(raw) ||
        (raw as { id?: unknown }).id !== blockId
      ) {
        continue;
      }
      const parsed = fanEngagementBlockSchema.safeParse(raw);
      if (parsed.success) return parsed.data;
    }
  }
  return null;
}

interface ResolvedNewsletter {
  newsletterId: string;
  block: FanEngagementBlock;
}

async function resolvePublishedBlock(
  athleteSlug: string,
  newsletterId: string,
  blockId: string,
): Promise<ResolvedNewsletter> {
  const newsletter = await prisma.newsletter.findUnique({
    where: { id: newsletterId },
    select: {
      id: true,
      status: true,
      athlete: { select: { slug: true } },
      sections: { select: { blocks: true, type: true } },
    },
  });

  if (
    !newsletter ||
    newsletter.status !== "PUBLISHED" ||
    newsletter.athlete.slug !== athleteSlug
  ) {
    throw new NotFoundError(errorMessages.NOT_FOUND);
  }

  const block = findBlockInSections(newsletter.sections, blockId);
  if (!block) {
    throw new NotFoundError(errorMessages.BLOCK_NOT_FOUND);
  }

  return { newsletterId: newsletter.id, block };
}

function getClosesAt(block: FanEngagementBlock): Date | null {
  if (
    block.kind === "poll" ||
    block.kind === "prediction" ||
    block.kind === "prize_draw"
  ) {
    return parseClosesAt(block.closesAt);
  }
  return null;
}

async function aggregateForBlock(
  newsletterId: string,
  blockId: string,
  block: FanEngagementBlock,
): Promise<EngagementAggregate | null> {
  if (
    block.kind === "qa" ||
    block.kind === "survey" ||
    block.kind === "prize_draw"
  ) {
    return null;
  }

  if (block.kind === "challenge") {
    const total = await prisma.fanEngagementResponse.count({
      where: { newsletterId, blockId, blockKind: "challenge" },
    });
    return { kind: "challenge", totalResponses: total };
  }

  const optionCount = block.options.length;
  const counts = new Array<number>(optionCount).fill(0);

  const grouped = await prisma.fanEngagementResponse.groupBy({
    by: ["optionIndex"],
    where: {
      newsletterId,
      blockId,
      blockKind: block.kind satisfies AggregateKindWithCounts,
      optionIndex: { not: null },
    },
    _count: { _all: true },
  });

  let total = 0;
  for (const row of grouped) {
    if (row.optionIndex === null || row.optionIndex === undefined) continue;
    if (row.optionIndex < 0 || row.optionIndex >= optionCount) continue;
    counts[row.optionIndex] = row._count._all;
    total += row._count._all;
  }

  const aggregate: EngagementAggregate = {
    kind: block.kind,
    optionCounts: counts,
    totalResponses: total,
  };

  if (block.kind === "quiz") {
    const correctIdx = block.options.findIndex((o) => o.isCorrect);
    aggregate.correctOptionIndex = correctIdx >= 0 ? correctIdx : null;
  }

  return aggregate;
}

async function loadUserResponse(
  newsletterId: string,
  blockId: string,
  userId: string,
): Promise<UserEngagementResponse | null> {
  const row = await prisma.fanEngagementResponse.findUnique({
    where: {
      newsletterId_blockId_userId: { newsletterId, blockId, userId },
    },
    select: {
      optionIndex: true,
      isCorrect: true,
      reaction: true,
      rating: true,
      text: true,
      consentGiven: true,
      updatedAt: true,
    },
  });
  if (!row) return null;
  return {
    optionIndex: row.optionIndex,
    isCorrect: row.isCorrect,
    reaction: row.reaction,
    rating: row.rating,
    text: row.text,
    consentGiven: row.consentGiven,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getBlockEngagement(args: {
  athleteSlug: string;
  newsletterId: string;
  blockId: string;
  userId: string;
}): Promise<EngagementSnapshot> {
  const { athleteSlug, newsletterId, blockId, userId } = args;
  const { block } = await resolvePublishedBlock(athleteSlug, newsletterId, blockId);

  const closesAt = getClosesAt(block);
  const [aggregate, userResponse] = await Promise.all([
    aggregateForBlock(newsletterId, blockId, block),
    loadUserResponse(newsletterId, blockId, userId),
  ]);

  return {
    kind: block.kind,
    isClosed: isClosedNow(closesAt),
    closesAt: closesAt ? closesAt.toISOString() : null,
    aggregate,
    userResponse,
  };
}

interface ColumnValues {
  optionIndex: number | null;
  isCorrect: boolean | null;
  reaction: string | null;
  rating: number | null;
  text: string | null;
  consentGiven: boolean | null;
}

const EMPTY_COLUMNS: ColumnValues = {
  optionIndex: null,
  isCorrect: null,
  reaction: null,
  rating: null,
  text: null,
  consentGiven: null,
};

/**
 * Project a validated payload into typed columns. The caller guarantees
 * `block.kind === payload.kind` (see submitEngagementResponse).
 */
function buildColumns(
  block: FanEngagementBlock,
  payload: EngagementResponseOutput,
): ColumnValues {
  switch (payload.kind) {
    case "poll":
    case "prediction": {
      if (block.kind !== payload.kind) throw new BadRequestError(errorMessages.INVALID_BLOCK_KIND);
      if (payload.optionIndex >= block.options.length) {
        throw new BadRequestError(errorMessages.INVALID_PAYLOAD);
      }
      return { ...EMPTY_COLUMNS, optionIndex: payload.optionIndex };
    }
    case "quiz": {
      if (block.kind !== "quiz") throw new BadRequestError(errorMessages.INVALID_BLOCK_KIND);
      if (payload.optionIndex >= block.options.length) {
        throw new BadRequestError(errorMessages.INVALID_PAYLOAD);
      }
      const isCorrect = Boolean(block.options[payload.optionIndex]?.isCorrect);
      return { ...EMPTY_COLUMNS, optionIndex: payload.optionIndex, isCorrect };
    }
    case "qa":
    case "survey":
      return { ...EMPTY_COLUMNS, text: payload.text };
    case "prize_draw":
      return { ...EMPTY_COLUMNS, consentGiven: payload.consentGiven };
    case "challenge":
      return { ...EMPTY_COLUMNS, reaction: payload.reaction };
  }
}

export async function submitEngagementResponse(args: {
  athleteSlug: string;
  newsletterId: string;
  blockId: string;
  userId: string;
  payload: EngagementResponseOutput;
}): Promise<EngagementSnapshot> {
  const { athleteSlug, newsletterId, blockId, userId, payload } = args;
  const { block } = await resolvePublishedBlock(athleteSlug, newsletterId, blockId);

  if (block.kind !== payload.kind) {
    throw new BadRequestError(errorMessages.INVALID_BLOCK_KIND);
  }

  const closesAt = getClosesAt(block);
  if (isClosedNow(closesAt)) {
    throw new BadRequestError(errorMessages.BLOCK_CLOSED);
  }

  const cols = buildColumns(block, payload);

  // Strip `kind` from the persisted payload — `blockKind` is the trusted column.
  const { kind: _kind, ...rest } = payload;
  void _kind;

  await prisma.fanEngagementResponse.upsert({
    where: {
      newsletterId_blockId_userId: { newsletterId, blockId, userId },
    },
    create: {
      newsletterId,
      blockId,
      blockKind: block.kind,
      userId,
      ...cols,
      payload: rest as unknown as Prisma.InputJsonValue,
    },
    update: {
      blockKind: block.kind,
      ...cols,
      payload: rest as unknown as Prisma.InputJsonValue,
    },
  });

  const [aggregate, userResponse] = await Promise.all([
    aggregateForBlock(newsletterId, blockId, block),
    loadUserResponse(newsletterId, blockId, userId),
  ]);

  return {
    kind: block.kind,
    isClosed: isClosedNow(closesAt),
    closesAt: closesAt ? closesAt.toISOString() : null,
    aggregate,
    userResponse,
  };
}
