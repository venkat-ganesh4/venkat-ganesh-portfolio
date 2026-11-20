import { randomBytes, createHash } from "node:crypto";

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export const SESSION_COOKIE = "portfolio_session";

export const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days