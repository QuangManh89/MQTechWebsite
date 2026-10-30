import { createHmac, timingSafeEqual } from "node:crypto";
import { getAppConfig } from "../env.ts";

export interface AdminSession {
  username: string;
  fullName: string;
  role: "ADMIN" | "STAFF";
  expiresAt: number;
}

export const ADMIN_COOKIE_NAME = "mqtech_admin_session";
const DEFAULT_SESSION_DURATION_HOURS = 8;

function getSecret(): string {
  const config = getAppConfig();
  return (
    config.adminSessionSecret ||
    "mqtech-default-dev-secret-do-not-use-in-production-32b"
  );
}

/**
 * Creates an HMAC-SHA256 signed session token.
 */
export function createSessionToken(
  user: { username: string; fullName: string; role: "ADMIN" | "STAFF" },
  durationHours = DEFAULT_SESSION_DURATION_HOURS
): string {
  const expiresAt = Date.now() + durationHours * 60 * 60 * 1000;
  const payload: AdminSession = {
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    expiresAt,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 signed session token.
 * Returns decoded session if valid and unexpired; null otherwise.
 */
export function verifySessionToken(token: string): AdminSession | null {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [payloadB64, providedSig] = token.split(".");
  if (!payloadB64 || !providedSig) {
    return null;
  }

  const expectedSig = createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest("base64url");

  try {
    const providedBuf = Buffer.from(providedSig, "base64url");
    const expectedBuf = Buffer.from(expectedSig, "base64url");

    if (
      providedBuf.length !== expectedBuf.length ||
      !timingSafeEqual(providedBuf, expectedBuf)
    ) {
      return null;
    }

    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf8");
    const session = JSON.parse(payloadJson) as AdminSession;

    if (Date.now() > session.expiresAt) {
      return null; // Expired session
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the admin session from a Request's Cookie header.
 */
export function getAdminSessionFromRequest(req: Request): AdminSession | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );

  const token = cookies[ADMIN_COOKIE_NAME];
  if (!token) return null;

  return verifySessionToken(token);
}
