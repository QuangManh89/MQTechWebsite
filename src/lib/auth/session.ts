import { createHmac, timingSafeEqual } from "node:crypto";
import { getAppConfig } from "../env.ts";
import { adminService } from "./admin-service.ts";

export interface AdminSession {
  username: string;
  fullName: string;
  role: "ADMIN" | "STAFF";
  tokenVersion: number;
  expiresAt: number;
}

export const ADMIN_COOKIE_NAME = "mqtech_admin_session";
const DEFAULT_SESSION_DURATION_HOURS = 8;

function getSecret(): string {
  const config = getAppConfig();
  if (config.isProduction) {
    if (!config.adminSessionSecret || config.adminSessionSecret.length < 32) {
      throw new Error(
        "ADMIN_SESSION_SECRET must be configured with at least 32 characters in production."
      );
    }
    return config.adminSessionSecret;
  }
  return (
    config.adminSessionSecret ||
    "mqtech-default-dev-secret-do-not-use-in-production-32b"
  );
}

/**
 * Creates an HMAC-SHA256 signed session token containing the user's tokenVersion.
 */
export function createSessionToken(
  user: {
    username: string;
    fullName: string;
    role: "ADMIN" | "STAFF";
    tokenVersion?: number;
  },
  durationHours = DEFAULT_SESSION_DURATION_HOURS
): string {
  const expiresAt = Date.now() + durationHours * 60 * 60 * 1000;
  const payload: AdminSession = {
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    tokenVersion: user.tokenVersion || 1,
    expiresAt,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies HMAC-SHA256 signature and expiration of session token.
 * Returns decoded session if cryptographically valid and unexpired; null otherwise.
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
 * Validates cryptographic signature, expiration, active account state, and matching tokenVersion.
 * Fails closed on any database or lookup error.
 */
export async function getAdminSessionFromRequest(
  req: Request
): Promise<AdminSession | null> {
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

  // 1. Verify cryptographic HMAC signature & expiry
  const session = verifySessionToken(token);
  if (!session) return null;

  // 2. Fail-closed account state and token_version check
  try {
    const user = await adminService.findByUsername(session.username);
    if (!user) {
      return null; // Account no longer exists
    }

    if (!user.isActive) {
      return null; // Account is disabled
    }

    if (user.tokenVersion !== session.tokenVersion) {
      return null; // Token version mismatch (revoked by logout, password change, or role change)
    }

    return {
      username: user.username,
      fullName: user.fullName,
      role: user.role, // Always use authoritative database role
      tokenVersion: user.tokenVersion,
      expiresAt: session.expiresAt,
    };
  } catch {
    // Fail closed on database or lookup failure
    return null;
  }
}
