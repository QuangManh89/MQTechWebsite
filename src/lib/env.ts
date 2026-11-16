/**
 * Environment variable configuration and validation boundary for MQTech.
 * Enforces server-only protection for sensitive secrets, origins, and database connections.
 */

export interface AppConfig {
  appUrl: string;
  trustedOrigin: string;
  serviceArea: string;
  environment: "production" | "development" | "test" | "staging" | "unknown";
  deploymentEnv?: "staging" | "production" | "development" | "test";
  isProduction: boolean;
  databaseUrl?: string;
  migrationDatabaseUrl?: string;
  adminSessionSecret?: string;
  allowMemoryStore: boolean;
  // Cloudflare R2 Media, Attachments & Backup Configuration (Three Distinct Buckets)
  r2AccountId?: string;
  r2AccessKeyId?: string;
  r2SecretAccessKey?: string;
  r2MediaBucket: string;
  r2AttachmentsBucket: string;
  r2BackupBucket: string;
  mediaPublicBaseUrl?: string;
}

export function getAppConfig(): AppConfig {
  const rawNodeEnv = (process.env.NODE_ENV || "unknown").toLowerCase();
  const rawDeployEnv = (process.env.MQTECH_DEPLOYMENT_ENV || "").toLowerCase();

  let deploymentEnv: AppConfig["deploymentEnv"];
  if (
    rawDeployEnv === "staging" ||
    rawDeployEnv === "production" ||
    rawDeployEnv === "development" ||
    rawDeployEnv === "test"
  ) {
    deploymentEnv = rawDeployEnv;
  }

  let environment: AppConfig["environment"] = "unknown";
  // In a production-built container (NODE_ENV=production), MQTECH_DEPLOYMENT_ENV allows labeling as staging
  if (deploymentEnv === "staging") {
    environment = "staging";
  } else if (rawNodeEnv === "production") {
    environment = "production";
  } else if (rawNodeEnv === "development") {
    environment = "development";
  } else if (rawNodeEnv === "test") {
    environment = "test";
  } else if (rawNodeEnv === "staging") {
    environment = "staging";
  }

  const isProduction = environment === "production";

  // Strict Policy:
  // - test: isolated in-memory storage permitted
  // - development: memory storage permitted ONLY when ALLOW_MEMORY_STORE=true is explicitly configured.
  //   Missing DATABASE_URL does NOT silently imply permission to use in-memory storage.
  // - staging: ALWAYS FORBIDDEN
  // - production: ALWAYS FORBIDDEN
  // - unknown: ALWAYS FORBIDDEN
  let allowMemoryStore = false;
  if (environment === "test") {
    allowMemoryStore = true;
  } else if (environment === "development") {
    allowMemoryStore = process.env.ALLOW_MEMORY_STORE === "true";
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
    deploymentEnv,
    isProduction,
    databaseUrl: process.env.DATABASE_URL,
    migrationDatabaseUrl: process.env.MIGRATION_DATABASE_URL,
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET,
    allowMemoryStore,
    r2AccountId: process.env.R2_ACCOUNT_ID,
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    r2MediaBucket: process.env.R2_MEDIA_BUCKET || "mqtech-media-staging",
    r2AttachmentsBucket: process.env.R2_ATTACHMENTS_BUCKET || "mqtech-attachments-staging",
    r2BackupBucket: process.env.R2_BACKUPS_BUCKET || process.env.R2_BACKUP_BUCKET || "mqtech-db-backups-staging",
    mediaPublicBaseUrl: process.env.MEDIA_PUBLIC_BASE_URL,
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

  // 2. Strict development check: missing DATABASE_URL requires explicit ALLOW_MEMORY_STORE=true
  if (env === "development") {
    if (!config.databaseUrl && !config.allowMemoryStore) {
      throw new Error(
        "In development, either DATABASE_URL must be configured or ALLOW_MEMORY_STORE=true must be explicitly set. In-memory storage is never implicitly assumed."
      );
    }
  }

  // 3. Strict validation in production
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
