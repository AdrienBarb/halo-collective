import Anthropic from "@anthropic-ai/sdk";
import { AppError } from "@/lib/errors/AppError";
import { getRequiredEnv } from "@/lib/utils/env";

export const NEWSLETTER_MODEL = "claude-sonnet-4-6";
export const MAX_TOKENS = 8192;
export const MAX_REPAIR_ATTEMPTS = 2;

let cached: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (cached) return cached;
  cached = new Anthropic({ apiKey: getRequiredEnv("ANTHROPIC_API_KEY") });
  return cached;
}

export class AnthropicGenerationError extends AppError {
  constructor(message: string) {
    super(message, 502, "ANTHROPIC_GENERATION_FAILED");
    this.name = "AnthropicGenerationError";
  }
}
