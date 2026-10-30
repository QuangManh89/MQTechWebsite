/**
 * Environment variable configuration and validation boundary for MQTech.
 * Enforces server-only protection for sensitive secrets and database connections.
 */

export interface AppConfig {
  appUrl: string;
  serviceArea: string;
  isProduction: boolean;
  databaseUrl?: string;
  adminSessionSecret?: string;
  allowMemoryStore: boolean;
}

export function getAppConfig(): AppConfig {
  const isProduction = process.env.NODE_ENV === "production";
  // In-memory store is strictly prohibited in production unless explicitly permitted for synthetic tests
  const allowMemoryStore =
    !isProduction || process.env.ALLOW_MEMORY_STORE === "true";

  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    serviceArea:
      process.env.NEXT_PUBLIC_SERVICE_AREA ||
      "Buôn Ma Thuột và khu vực lân cận (~15 km)",
    isProduction,
    databaseUrl: process.env.DATABASE_URL,
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET,
    allowMemoryStore,
  };
}

/**
 * Validates that critical server secrets and database configuration exist in production.
 * Throws in production if missing or malformed.
 */
export function validateServerEnv(): void {
  const config = getAppConfig();

  if (config.isProduction) {
    const missing: string[] = [];

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

    if (!config.adminSessionSecret) {
      missing.push("ADMIN_SESSION_SECRET");
    } else if (config.adminSessionSecret.length < 32) {
      throw new Error(
        "ADMIN_SESSION_SECRET must be at least 32 characters long in production."
      );
    }

    if (missing.length > 0) {
      throw new Error(
        `Critical server environment configuration missing in production: ${missing.join(", ")}`
      );
    }
  }
}
