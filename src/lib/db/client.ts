import { getAppConfig } from "../env";

/**
 * PostgreSQL Database Client Boundary.
 * Provides parameterization and graceful degradation when running without an active database.
 */
export interface DatabaseClient {
  isConfigured: boolean;
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
}

export function createDatabaseClient(): DatabaseClient {
  const config = getAppConfig();
  const isConfigured = Boolean(config.databaseUrl);

  return {
    isConfigured,
    async query<T = unknown>(): Promise<T[]> {
      if (!isConfigured) {
        console.warn(
          "Database query attempted, but DATABASE_URL is not configured in this environment."
        );
        return [];
      }

      // In production Phase P2/P3, pg pool or query client will execute parameterized queries.
      throw new Error(
        "Direct production database queries are blocked during Phase P1 foundation."
      );
    },
  };
}

export const db = createDatabaseClient();
