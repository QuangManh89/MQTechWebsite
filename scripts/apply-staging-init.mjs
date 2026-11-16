#!/usr/bin/env node
/**
 * MQTech Database Initializer & Migration Runner over Fly Proxy
 *
 * Connects to PostgreSQL on 127.0.0.1:5433 (via fly proxy).
 * Creates roles, applies migrations, and provisions the initial admin account.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import pg from "pg";

const scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

// Read .env.staging.local
const envContent = readFileSync(resolve(projectRoot, ".env.staging.local"), "utf8");
function getEnv(key) {
  const m = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
  return m ? m[1].trim() : null;
}

const postgresPass = getEnv("POSTGRES_PASSWORD");
const adminEmail = getEnv("ADMIN_INITIAL_EMAIL") || "admin@mqcomputech.com";
const adminPass = getEnv("ADMIN_INITIAL_PASSWORD");

if (!postgresPass || !adminPass) {
  console.error("Missing POSTGRES_PASSWORD or ADMIN_INITIAL_PASSWORD in .env.staging.local");
  process.exit(1);
}

const client = new pg.Client({
  host: "127.0.0.1",
  port: 5433,
  user: "postgres",
  password: postgresPass,
  database: "mqtech",
});

async function run() {
  console.log("Connecting to PostgreSQL on 127.0.0.1:5433...");
  await client.connect();
  console.log("Connected successfully!");

  // 1. Enable uuid-ossp
  console.log("Step 1: Enabling uuid-ossp extension...");
  await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  // 2. Roles
  console.log("Step 2: Creating roles mqtech_migrator and mqtech_app...");
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mqtech_migrator') THEN
        CREATE ROLE mqtech_migrator WITH LOGIN PASSWORD '${postgresPass}' NOINHERIT;
      ELSE
        ALTER ROLE mqtech_migrator WITH PASSWORD '${postgresPass}';
      END IF;

      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mqtech_app') THEN
        CREATE ROLE mqtech_app WITH LOGIN PASSWORD '${postgresPass}' NOINHERIT;
      ELSE
        ALTER ROLE mqtech_app WITH PASSWORD '${postgresPass}';
      END IF;

      GRANT CONNECT ON DATABASE mqtech TO mqtech_migrator;
      GRANT CONNECT ON DATABASE mqtech TO mqtech_app;
      GRANT ALL ON SCHEMA public TO mqtech_migrator;
      GRANT USAGE ON SCHEMA public TO mqtech_app;

      ALTER DEFAULT PRIVILEGES FOR ROLE mqtech_migrator IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mqtech_app;
      ALTER DEFAULT PRIVILEGES FOR ROLE mqtech_migrator IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO mqtech_app;
      REVOKE CREATE ON SCHEMA public FROM PUBLIC;
    END
    $$;
  `);

  // 3. Apply 001_initial_schema.sql
  console.log("Step 3: Applying 001_initial_schema.sql...");
  const sql001 = readFileSync(resolve(projectRoot, "migrations/001_initial_schema.sql"), "utf8");
  await client.query(sql001);

  // 4. Apply 002_media_storage.sql
  console.log("Step 4: Applying 002_media_storage.sql...");
  const sql002 = readFileSync(resolve(projectRoot, "migrations/002_media_storage.sql"), "utf8");
  await client.query(sql002);

  // 5. Grant table/sequence permissions to mqtech_app on public tables
  console.log("Step 5: Granting DML privileges to mqtech_app...");
  await client.query(`
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mqtech_app;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO mqtech_app;
  `);

  // 6. Bootstrap Initial Admin Account
  console.log(`Step 6: Bootstrapping initial admin account (${adminEmail})...`);
  const passwordHash = await hashPassword(adminPass);
  await client.query(`
    INSERT INTO admin_users (username, password_hash, full_name, role, is_active)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (username) DO UPDATE 
    SET password_hash = EXCLUDED.password_hash,
        is_active = TRUE;
  `, [adminEmail, passwordHash, "MQTech Super Admin", "ADMIN", true]);

  // 7. Verification
  console.log("Step 7: Verifying database state...");
  const tablesRes = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log("Tables present in 'public' schema:");
  for (const row of tablesRes.rows) {
    console.log(`  - ${row.table_name}`);
  }

  const catRes = await client.query("SELECT count(*)::int as count FROM service_categories;");
  console.log(`Service categories count: ${catRes.rows[0].count} (Expected: 6)`);

  const adminRes = await client.query("SELECT username, role, is_active FROM admin_users;");
  console.log("Admin users provisioned:", adminRes.rows);

  await client.end();
  console.log("\n[SUCCESS] Database initialization and migration complete!");
}

run().catch((err) => {
  console.error("[ERROR]:", err);
  client.end();
  process.exit(1);
});
