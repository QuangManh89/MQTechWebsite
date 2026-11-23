import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import * as schema from "./schema";
import path from "node:path";
import fs from "node:fs";

type AppDb = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  __mqDb?: AppDb;
  __mqPool?: Pool;
  __mqPglite?: PGlite;
};

export function resolvePgliteDataDir(): string {
  if (process.env.PGLITE_DATA_DIR?.trim()) {
    return process.env.PGLITE_DATA_DIR.trim();
  }
  const cwd = process.cwd();
  const normalized = cwd.replace(/\\/g, "/");
  if (normalized.endsWith("/.next/standalone")) {
    return path.resolve(cwd, "..", "..", ".pglite-data");
  }
  return path.join(cwd, ".pglite-data");
}

function getDbInstance(): AppDb {
  if (globalForDb.__mqDb) return globalForDb.__mqDb;

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    if (!globalForDb.__mqPool) {
      globalForDb.__mqPool = new Pool({
        connectionString: databaseUrl,
        max: 10,
        ssl:
          databaseUrl.includes("sslmode=require") ||
          databaseUrl.includes("neon.tech")
            ? { rejectUnauthorized: false }
            : undefined,
      });
    }
    globalForDb.__mqDb = drizzlePg(globalForDb.__mqPool, { schema });
    return globalForDb.__mqDb;
  }

  if (!globalForDb.__mqPglite) {
    globalForDb.__mqPglite = new PGlite(resolvePgliteDataDir());
  }
  globalForDb.__mqDb = drizzlePglite(globalForDb.__mqPglite, {
    schema,
  }) as unknown as AppDb;
  return globalForDb.__mqDb;
}

export async function resetCorruptedPglite(): Promise<void> {
  if (process.env.DATABASE_URL?.trim()) return;
  try {
    await globalForDb.__mqPglite?.close();
  } catch {
    // Ignore close error on aborted WASM instance
  }
  globalForDb.__mqPglite = undefined;
  globalForDb.__mqDb = undefined;
  const dir = resolvePgliteDataDir();
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  getDbInstance();
}

export const db: AppDb = new Proxy({} as AppDb, {
  get(_target, prop) {
    const instance = getDbInstance();
    const val = Reflect.get(instance, prop, instance);
    return typeof val === "function" ? val.bind(instance) : val;
  },
});

export async function runRawSql(sqlText: string): Promise<void> {
  getDbInstance();
  if (process.env.DATABASE_URL?.trim() && globalForDb.__mqPool) {
    await globalForDb.__mqPool.query(sqlText);
    return;
  }
  if (globalForDb.__mqPglite) {
    await globalForDb.__mqPglite.waitReady;
    await globalForDb.__mqPglite.exec(sqlText);
  }
}
