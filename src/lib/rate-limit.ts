import { NextRequest, NextResponse } from "next/server";

interface BucketEntry {
  timestamps: number[];
}

const buckets = new Map<string, BucketEntry>();
const MAX_BUCKETS = 4096;

function extractClientIp(req: NextRequest): string {
  const flyIp = req.headers.get("fly-client-ip")?.trim();
  if (flyIp) return flyIp;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "127.0.0.1";
}

export function enforceRateLimit(
  req: NextRequest,
  options: {
    bucket: string;
    limit: number;
    windowMs: number;
    message?: string;
  }
): NextResponse | null {
  const now = Date.now();
  const cutoff = now - options.windowMs;
  const key = `${options.bucket}:${extractClientIp(req)}`;

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, v] of buckets.entries()) {
      const active = v.timestamps.filter((t) => t > cutoff);
      if (active.length === 0) buckets.delete(k);
    }
  }

  const entry = buckets.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= options.limit) {
    const oldest = entry.timestamps[0] ?? now;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((oldest + options.windowMs - now) / 1000)
    );
    return NextResponse.json(
      {
        error:
          options.message ||
          `Bạn thao tác quá nhanh. Vui lòng đợi ${retryAfterSec} giây rồi thử lại.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      }
    );
  }

  entry.timestamps.push(now);
  buckets.set(key, entry);
  return null;
}
