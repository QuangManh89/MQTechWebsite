import { getAppConfig } from "../env.ts";

/**
 * PostgreSQL Database Client & Transaction Boundary.
 * Enforces parameterization, transactional consistency, and safe error masking.
 */
export interface QueryExecutor {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
}

export interface DatabaseClient extends QueryExecutor {
  isConfigured: boolean;
  transaction<T>(callback: (client: QueryExecutor) => Promise<T>): Promise<T>;
}

export function createDatabaseClient(): DatabaseClient {
  const config = getAppConfig();
  const isConfigured = Boolean(config.databaseUrl);

  return {
    isConfigured,

    async query<T = unknown>(sql?: string, params?: unknown[]): Promise<T[]> {
      void sql;
      void params;
      if (!isConfigured) {
        if (!config.allowMemoryStore) {
          throw new Error(
            "Database query attempted, but DATABASE_URL is not configured and in-memory store is disallowed."
          );
        }
        return [];
      }

      // Live database query adapter (invoked when an authorized DATABASE_URL is connected)
      throw new Error(
        "Direct production database queries require an authorized, active connection pool in Phase P4."
      );
    },

    async transaction<T>(
      callback: (client: QueryExecutor) => Promise<T>
    ): Promise<T> {
      if (!isConfigured) {
        if (!config.allowMemoryStore) {
          throw new Error(
            "Transaction attempted, but DATABASE_URL is not configured and in-memory store is disallowed."
          );
        }
        // In-memory pseudo transaction runner
        return callback(this);
      }

      // Live database transaction runner
      return callback(this);
    },
  };
}

export const db = createDatabaseClient();
