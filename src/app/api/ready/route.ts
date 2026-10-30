import { getAppConfig } from "../../../lib/env.ts";
import { db } from "../../../lib/db/client.ts";

/**
 * Readiness Healthcheck Endpoint
 * Verifies that required configuration and database connectivity are healthy.
 * Used by container orchestrators (Fly.io / Kubernetes) before routing customer traffic.
 * Does NOT expose internal database credentials or error details.
 */
export async function GET() {
  const config = getAppConfig();

  // 1. In production, database must be configured
  if (config.isProduction && !db.isConfigured) {
    return Response.json(
      {
        status: "unready",
        error: "Database configuration is missing.",
      },
      { status: 503 }
    );
  }

  // 2. Check database readiness if configured
  if (db.isConfigured) {
    try {
      await db.query("SELECT 1;");
    } catch {
      return Response.json(
        {
          status: "unready",
          error: "Database is currently unreachable.",
        },
        { status: 503 }
      );
    }
  }

  return Response.json({
    status: "ready",
    service: "mqtech-web",
    environment: config.environment,
    timestamp: new Date().toISOString(),
  });
}
