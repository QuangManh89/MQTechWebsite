import pg from "pg";
import { getAppConfig } from "../env.ts";

const { Pool } = pg;

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

let globalPool: pg.Pool | null = null;

function getPool(connectionString: string): pg.Pool {
  if (!globalPool) {
    globalPool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
  }
  return globalPool;
}

export function createDatabaseClient(): DatabaseClient {
  const config = getAppConfig();
  const isConfigured = Boolean(config.databaseUrl);

  return {
    isConfigured,

    async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
      if (!isConfigured) {
        if (!config.allowMemoryStore) {
          throw new Error(
            "Database query attempted, but DATABASE_URL is not configured and in-memory store is disallowed."
          );
        }
        return [];
      }

      const pool = getPool(config.databaseUrl!);
      const res = await pool.query(sql, params);
      return res.rows as T[];
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
        return callback(this);
      }

      const pool = getPool(config.databaseUrl!);
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const txExecutor: QueryExecutor = {
          async query<R = unknown>(sql: string, params?: unknown[]): Promise<R[]> {
            const res = await client.query(sql, params);
            return res.rows as R[];
          },
        };
        const result = await callback(txExecutor);
        await client.query("COMMIT");
        return result;
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    },
  };
}

export const db = createDatabaseClient();
