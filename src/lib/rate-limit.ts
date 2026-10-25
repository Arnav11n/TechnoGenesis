type Entry = { count: number; resetAt: number };

const hits = new Map<string, Entry>();

/**
 * Very simple in-memory limiter: allows `limit` attempts per `windowMs`.
 * Good for a single server (local PC or one Replit instance).
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}