import { AppError } from "@/lib/errors/AppError";

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new AppError(`${name} is not configured`, 500);
  }
  return value;
}

export function getRequiredEnvInt(name: string): number {
  const raw = getRequiredEnv(name);
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) {
    throw new AppError(`${name} must be an integer (got "${raw}")`, 500);
  }
  return parsed;
}
