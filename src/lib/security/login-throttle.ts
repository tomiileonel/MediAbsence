import { ValidationError } from "@/lib/errors/domain-error";

const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

const key = (email: string) => `login:${email.trim().toLowerCase()}`;

export function assertLoginAllowed(email: string): void {
  const entry = attempts.get(key(email));
  if (entry && entry.count >= MAX_ATTEMPTS && Date.now() < entry.resetAt) {
    throw new ValidationError("Demasiados intentos fallidos. Reintentá en unos minutos.");
  }
}

export function registerFailedLogin(email: string): void {
  const now = Date.now();
  const entry = attempts.get(key(email));
  if (!entry || now >= entry.resetAt) {
    attempts.set(key(email), { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearLoginFailures(email: string): void {
  attempts.delete(key(email));
}

export function resetAllLoginThrottles(): void {
  attempts.clear();
}
