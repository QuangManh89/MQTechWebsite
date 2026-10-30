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
  const isTest = process.env.NODE_ENV === "test";

  // Production must ALWAYS use PostgreSQL. ALLOW_MEMORY_STORE is unconditionally FALSE in production.
  // Test environments may use isolated in-memory storage.
  // Development environments may use in-memory storage when running locally without a database.
  const allowMemoryStore = isProduction
    ? false
    : isTest ||
      process.env.ALLOW_MEMORY_STORE === "true" ||
      process.env.NODE_ENV === "development" ||
      !process.env.NODE_ENV;

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
 * Throws in production if missing, malformed, or if memory store is requested.
 */
export function validateServerEnv(): void {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    // 1. Explicitly forbid any attempt to bypass database persistence in production
    if (process.env.ALLOW_MEMORY_STORE === "true") {
      throw new Error(
        "CRITICAL SECURITY VIOLATION: ALLOW_MEMORY_STORE=true is strictly forbidden in production."
      );
    }

    const config = getAppConfig();
    const missing: string[] = [];

    // 2. Validate mandatory PostgreSQL connection URL
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

    // 3. Validate mandatory administrative session signing secret
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
