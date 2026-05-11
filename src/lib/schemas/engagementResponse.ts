import { z } from "zod";

const TEXT_MAX = 1000;

const trimmedText = z
  .string()
  .trim()
  .min(1, "Required")
  .max(TEXT_MAX, `Must be ${TEXT_MAX} characters or fewer`);

const optionIndex = z.number().int().nonnegative();

export const pollResponseSchema = z.object({
  kind: z.literal("poll"),
  optionIndex,
});

export const predictionResponseSchema = z.object({
  kind: z.literal("prediction"),
  optionIndex,
});

export const quizResponseSchema = z.object({
  kind: z.literal("quiz"),
  optionIndex,
});

export const qaResponseSchema = z.object({
  kind: z.literal("qa"),
  text: trimmedText,
});

export const surveyResponseSchema = z.object({
  kind: z.literal("survey"),
  text: trimmedText,
});

export const prizeDrawResponseSchema = z.object({
  kind: z.literal("prize_draw"),
  consentGiven: z.literal(true),
});

export const challengeResponseSchema = z.object({
  kind: z.literal("challenge"),
  reaction: z.enum(["✊"]),
});

export const engagementResponseSchema = z.discriminatedUnion("kind", [
  pollResponseSchema,
  predictionResponseSchema,
  quizResponseSchema,
  qaResponseSchema,
  surveyResponseSchema,
  prizeDrawResponseSchema,
  challengeResponseSchema,
]);

export type EngagementResponseInput = z.input<typeof engagementResponseSchema>;
export type EngagementResponseOutput = z.output<typeof engagementResponseSchema>;
export type EngagementResponseKind = EngagementResponseOutput["kind"];
