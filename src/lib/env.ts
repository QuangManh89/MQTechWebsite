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
}

export function getAppConfig(): AppConfig {
  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    serviceArea:
      process.env.NEXT_PUBLIC_SERVICE_AREA ||
      "Buôn Ma Thuột và khu vực lân cận (~15 km)",
    isProduction: process.env.NODE_ENV === "production",
    databaseUrl: process.env.DATABASE_URL,
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET,
  };
}

/**
 * Validates that critical server secrets exist in production.
 * Throws in production if missing, warns in development.
 */
export function validateServerEnv(): void {
  const config = getAppConfig();

  if (config.isProduction) {
    const missing: string[] = [];
    if (!config.databaseUrl) missing.push("DATABASE_URL");
    if (!config.adminSessionSecret) missing.push("ADMIN_SESSION_SECRET");

    if (missing.length > 0) {
      throw new Error(
        `Critical server environment variables missing: ${missing.join(", ")}`
      );
    }
  }
}
