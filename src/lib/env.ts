/**
 * Environment variable configuration and validation boundary for MQTech.
 * Enforces server-only protection for sensitive secrets, origins, and database connections.
 */

export interface AppConfig {
  appUrl: string;
  trustedOrigin: string;
  serviceArea: string;
  environment: "production" | "development" | "test" | "staging" | "unknown";
  isProduction: boolean;
  databaseUrl?: string;
  adminSessionSecret?: string;
  allowMemoryStore: boolean;
}

export function getAppConfig(): AppConfig {
  const rawEnv = (process.env.NODE_ENV || "unknown").toLowerCase();
  let environment: AppConfig["environment"] = "unknown";
  if (rawEnv === "production") environment = "production";
  else if (rawEnv === "development") environment = "development";
  else if (rawEnv === "test") environment = "test";
  else if (rawEnv === "staging") environment = "staging";

  const isProduction = environment === "production";

  // Strict Policy:
  // - test: isolated in-memory storage permitted
  // - development: permitted under explicit development configuration
  // - production: ALWAYS FORBIDDEN
  // - staging / unknown: ALWAYS FORBIDDEN by default
  let allowMemoryStore = false;
  if (environment === "test") {
    allowMemoryStore = true;
  } else if (environment === "development") {
    allowMemoryStore =
      process.env.ALLOW_MEMORY_STORE === "true" || !process.env.DATABASE_URL;
  } else {
    // production, staging, and unknown environments unconditionally forbid in-memory fallback
    allowMemoryStore = false;
  }

  // Trusted Origin: Production must specify MQTECH_PUBLIC_ORIGIN (e.g. https://mqcomputech.com)
  const defaultDevOrigin =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const trustedOrigin =
    process.env.MQTECH_PUBLIC_ORIGIN || (isProduction ? "" : defaultDevOrigin);

  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    trustedOrigin,
    serviceArea:
      process.env.NEXT_PUBLIC_SERVICE_AREA ||
      "Buôn Ma Thuột và khu vực lân cận (~15 km)",
    environment,
    isProduction,
    databaseUrl: process.env.DATABASE_URL,
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET,
    allowMemoryStore,
  };
}

/**
 * Validates that critical server secrets, trusted origins, and database configuration exist.
 * Throws in production, staging, or unknown environments if configuration violates security boundaries.
 */
export function validateServerEnv(): void {
  const config = getAppConfig();
  const env = config.environment;

  // 1. Forbid any attempt to bypass database persistence in production or staging
  if (env === "production" || env === "staging" || env === "unknown") {
    if (process.env.ALLOW_MEMORY_STORE === "true") {
      throw new Error(
        `CRITICAL SECURITY VIOLATION: ALLOW_MEMORY_STORE=true is strictly forbidden in ${env} environment.`
      );
    }
  }

  // 2. Strict validation in production
  if (env === "production") {
    const missing: string[] = [];

    // Mandatory PostgreSQL connection URL
    if (!config.databaseUrl) {
      missing.push("DATABASE_URL");
    } else if (
      !config.databaseUrl.startsWith("postgres://") &&
      !config.databaseUrl.startsWith("postgresql://")
    ) {
      throw new Error(
        "DATABASE_URL must be a valid PostgreSQL connection URI (starting with postgres:// or postgresql://)"
      );
    }

    // Mandatory administrative session signing secret
    if (!config.adminSessionSecret) {
      missing.push("ADMIN_SESSION_SECRET");
    } else if (config.adminSessionSecret.length < 32) {
      throw new Error(
        "ADMIN_SESSION_SECRET must be at least 32 characters long in production."
      );
    }

    // Mandatory trusted public origin
    if (!config.trustedOrigin) {
      missing.push("MQTECH_PUBLIC_ORIGIN");
    } else if (!config.trustedOrigin.startsWith("https://")) {
      throw new Error(
        "MQTECH_PUBLIC_ORIGIN must be a secure HTTPS origin in production (e.g. https://mqcomputech.com)."
      );
    }

    if (missing.length > 0) {
      throw new Error(
        `Critical server environment configuration missing in production: ${missing.join(", ")}`
      );
    }
  }
}
