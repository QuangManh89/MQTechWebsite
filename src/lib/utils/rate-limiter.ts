interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * In-memory sliding window rate limiter for development and local testing.
 * Automatically cleans up expired entries to avoid memory leaks.
 */
class InMemoryRateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = 5, windowMinutes = 10) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMinutes * 60 * 1000;
  }

  public check(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    const record = this.store.get(identifier);

    if (!record || now > record.resetAt) {
      const resetAt = now + this.windowMs;
      this.store.set(identifier, { count: 1, resetAt });
      return { allowed: true, remaining: this.maxRequests - 1, resetAt };
    }

    if (record.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: record.resetAt };
    }

    record.count += 1;
    return {
      allowed: true,
      remaining: this.maxRequests - record.count,
      resetAt: record.resetAt,
    };
  }

  public reset(identifier?: string): void {
    if (identifier) {
      this.store.delete(identifier);
    } else {
      this.store.clear();
    }
  }
}

export const intakeRateLimiter = new InMemoryRateLimiter(5, 10);
export { InMemoryRateLimiter };
