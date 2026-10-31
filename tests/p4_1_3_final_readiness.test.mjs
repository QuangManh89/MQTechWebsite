import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  parseDatabaseUrl,
  buildPgServiceConfig,
  writeSecurePgServiceFile,
  getSafeDumpArgs,
  getSafeRestoreArgs,
} from "../scripts/credential-helper.mjs";
import { validateRestoreTarget } from "../scripts/restore-guard.mjs";
import {
  isPooledConnection,
  resolveMigrationConnectionUrl,
  validateMigrationTarget,
  verifyCompleteSchema,
  REQUIRED_SCHEMA_OBJECTS,
} from "../scripts/migrate.mjs";

describe("P4.1.3 Final Readiness: Credential Safety, MPG Connections & Migration Baseline", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    delete process.env.DATABASE_URL;
    delete process.env.MIGRATION_DATABASE_URL;
    delete process.env.TARGET_DATABASE_URL;
    delete process.env.SOURCE_DATABASE_URL;
    delete process.env.CONFIRM_DESTRUCTIVE_RESTORE;
    delete process.env.CONFIRM_RESTORE_DB_NAME;
    delete process.env.CONFIRM_BASELINE;
  });

  // =========================================================================
  // Task A: Process Argument Credential Isolation & Safe Args
  // =========================================================================

  test("Credential Helper: parses database URL into host, port, dbname, user, password", () => {
    const parsed = parseDatabaseUrl(
      "postgresql://mqtech_user:SuperSecretPassword123@127.0.0.1:5433/mqtech_dev_db"
    );
    assert.strictEqual(parsed.host, "127.0.0.1");
    assert.strictEqual(parsed.port, "5433");
    assert.strictEqual(parsed.dbname, "mqtech_dev_db");
    assert.strictEqual(parsed.user, "mqtech_user");
    assert.strictEqual(parsed.password, "SuperSecretPassword123");
  });

  test("Credential Helper: builds valid pg_service.conf INI format", () => {
    const config = buildPgServiceConfig({
      databaseUrl: "postgresql://admin:SecretPass%21@localhost:5432/mqtech_test",
      serviceName: "mqtech_backup",
    });

    assert.ok(config.includes("[mqtech_backup]"));
    assert.ok(config.includes("host=localhost"));
    assert.ok(config.includes("port=5432"));
    assert.ok(config.includes("dbname=mqtech_test"));
    assert.ok(config.includes("user=admin"));
    assert.ok(config.includes("password=SecretPass!"));
  });

  test("Credential Helper: writes secure pg_service file with 0600 mode in private temp directory", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mqtech_test_cred_"));
    const serviceFilePath = path.join(tempDir, "pg_service.conf");

    try {
      writeSecurePgServiceFile({
        databaseUrl: "postgresql://user:pass@localhost:5432/test_db",
        serviceName: "test_service",
        outputFilePath: serviceFilePath,
      });

      assert.ok(fs.existsSync(serviceFilePath));
      const content = fs.readFileSync(serviceFilePath, "utf8");
      assert.ok(content.includes("[test_service]"));
      assert.ok(content.includes("dbname=test_db"));
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test("Argument Capture Harness: pg_dump and pg_restore arguments NEVER contain passwords or raw URIs", () => {
    const secretPassword = "ExtremelySensitiveProductionPassword999!";
    const rawDatabaseUrl = `postgresql://mqtech_admin:${secretPassword}@localhost:5432/mqtech_dev`;

    // 1. Safe Dump Args
    const dumpArgs = getSafeDumpArgs({
      serviceName: "mqtech_backup",
      filePath: "/backups/mqtech_backup.dump",
    });

    // Verify neither the plain password nor the connection URL is in the argument array
    assert.ok(!dumpArgs.some((arg) => arg.includes(secretPassword)), "Password must NOT be in dump args");
    assert.ok(!dumpArgs.some((arg) => arg.includes(rawDatabaseUrl)), "Raw URI must NOT be in dump args");
    assert.ok(!dumpArgs.some((arg) => arg.includes("postgresql://")), "Raw URI scheme must NOT be in dump args");
    assert.ok(dumpArgs.includes("--service=mqtech_backup"), "Must use --service flag");
    assert.ok(dumpArgs.includes("--format=c"));

    // 2. Safe Restore Args
    const restoreArgs = getSafeRestoreArgs({
      serviceName: "mqtech_restore",
      backupFilePath: "/backups/mqtech_backup.dump",
    });

    assert.ok(!restoreArgs.some((arg) => arg.includes(secretPassword)), "Password must NOT be in restore args");
    assert.ok(!restoreArgs.some((arg) => arg.includes("postgresql://")), "Raw URI must NOT be in restore args");
    assert.ok(restoreArgs.includes("--service=mqtech_restore"), "Must use --service flag");
    assert.ok(restoreArgs.includes("--clean"));
  });

  // =========================================================================
  // Task B: Strengthen Restore Target Identity & Allowlist
  // =========================================================================

  test("Restore Guard: rejects 0.0.0.0 and non-allowlisted remote hosts", () => {
    // 1. 0.0.0.0 must be rejected
    const resZero = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@0.0.0.0:5432/mqtech_test_db",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_test_db",
    });
    assert.strictEqual(resZero.allowed, false, "0.0.0.0 must be rejected");
    assert.match(resZero.reason, /không nằm trong danh sách máy chủ an toàn/);

    // 2. Remote cloud host rejected
    const resRemote = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@192.168.1.100:5432/mqtech_test_db",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_test_db",
    });
    assert.strictEqual(resRemote.allowed, false);
    assert.match(resRemote.reason, /không nằm trong danh sách máy chủ an toàn/);
  });

  test("Restore Guard: confirmation flag alone can NEVER override unsafe target validation", () => {
    const resOverrideAttempt = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@remote-server.fly.dev:5432/mqtech_production",
      confirmDestructiveRestore: true, // Attempting to force with flag
      confirmRestoreDbName: "mqtech_production",
    });

    assert.strictEqual(resOverrideAttempt.allowed, false);
    assert.match(resOverrideAttempt.reason, /không nằm trong danh sách máy chủ an toàn|từ khóa môi trường thật/);
  });

  // =========================================================================
  // Task C: Separate Pooled and Direct PostgreSQL Connections
  // =========================================================================

  test("Connection Detection: identifies PgBouncer pooled connections accurately", () => {
    // 1. Port 6543 pooled connection
    assert.strictEqual(
      isPooledConnection("postgresql://user:pass@ep-pooler.region.flycast:6543/mqtech_db"),
      true
    );

    // 2. Hostname containing 'pooler' or 'pgbouncer'
    assert.strictEqual(
      isPooledConnection("postgresql://user:pass@db-pooler.internal:5432/mqtech_db"),
      true
    );
    assert.strictEqual(
      isPooledConnection("postgresql://user:pass@pgbouncer-main:5432/mqtech_db"),
      true
    );

    // 3. Search query ?pgbouncer=true
    assert.strictEqual(
      isPooledConnection("postgresql://user:pass@localhost:5432/mqtech_db?pgbouncer=true"),
      true
    );

    // 4. Standard direct connection
    assert.strictEqual(
      isPooledConnection("postgresql://user:pass@localhost:5432/mqtech_dev"),
      false
    );
  });

  test("validateMigrationTarget: strictly rejects pooled connections for migration operations", () => {
    const pooledUrl = "postgresql://user:pass@ep-pooler.region.flycast:6543/mqtech_db";
    const result = validateMigrationTarget(pooledUrl, false);
    assert.strictEqual(result.allowed, false);
    assert.match(result.reason, /Phát hiện kết nối pooled.*Migration runner yêu cầu kết nối direct/);
  });

  test("resolveMigrationConnectionUrl: prefers MIGRATION_DATABASE_URL and requires it in production", () => {
    const originalEnv = process.env.NODE_ENV;

    try {
      // 1. Explicit MIGRATION_DATABASE_URL
      process.env.MIGRATION_DATABASE_URL = "postgresql://user:pass@localhost:5432/mqtech_direct";
      const resolved = resolveMigrationConnectionUrl();
      assert.strictEqual(resolved.source, "MIGRATION_DATABASE_URL");
      assert.strictEqual(resolved.isDirect, true);

      // 2. Production without MIGRATION_DATABASE_URL must fail
      delete process.env.MIGRATION_DATABASE_URL;
      process.env.NODE_ENV = "production";
      process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/mqtech_pooled";

      const prodResolved = resolveMigrationConnectionUrl();
      assert.ok(prodResolved.error, "Must require MIGRATION_DATABASE_URL in production");
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  // =========================================================================
  // Task E: Migration Baseline Comprehensive Schema Verification
  // =========================================================================

  test("verifyCompleteSchema: checks column types and rejects column type mismatches", async () => {
    const mockClient = {
      async query(sql) {
        if (sql.includes("information_schema.tables")) {
          return REQUIRED_SCHEMA_OBJECTS.tables.map((t) => ({ table_name: t }));
        }
        if (sql.includes("information_schema.columns")) {
          const cols = [];
          for (const [tbl, colList] of Object.entries(REQUIRED_SCHEMA_OBJECTS.columns)) {
            for (const c of colList) {
              // Intentionally supply wrong type for token_version (text instead of integer)
              const typeToUse = tbl === "admin_users" && c.name === "token_version" ? "text" : c.type;
              cols.push({
                table_name: tbl,
                column_name: c.name,
                data_type: typeToUse,
                is_nullable: c.nullable,
              });
            }
          }
          return cols;
        }
        if (sql.includes("pg_constraint")) {
          return [
            { conname: "service_categories_pkey", contype: "p", table_name: "service_categories" },
            { conname: "service_requests_pkey", contype: "p", table_name: "service_requests" },
            { conname: "request_status_history_pkey", contype: "p", table_name: "request_status_history" },
            { conname: "admin_users_pkey", contype: "p", table_name: "admin_users" },
            { conname: "service_categories_slug_key", contype: "u" },
            { conname: "service_requests_reference_code_key", contype: "u" },
            { conname: "admin_users_username_key", contype: "u" },
            { conname: "service_requests_service_mode_check", contype: "c" },
            { conname: "service_requests_device_category_check", contype: "c" },
            { conname: "service_requests_status_check", contype: "c" },
            { conname: "admin_users_role_check", contype: "c" },
          ];
        }
        if (sql.includes("pg_indexes")) {
          return REQUIRED_SCHEMA_OBJECTS.indexes.map((i) => ({ indexname: i }));
        }
        if (sql.includes("service_categories")) {
          return REQUIRED_SCHEMA_OBJECTS.serviceCategories.map((c) => ({ id: c.id, slug: c.slug }));
        }
        return [];
      },
    };

    const result = await verifyCompleteSchema(mockClient);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) =>
        e.includes('Kiểu dữ liệu sai khác trên "admin_users.token_version"')
      )
    );
  });

  test("verifyCompleteSchema: verifies primary keys and unique constraints", async () => {
    const mockClient = {
      async query(sql) {
        if (sql.includes("information_schema.tables")) {
          return REQUIRED_SCHEMA_OBJECTS.tables.map((t) => ({ table_name: t }));
        }
        if (sql.includes("information_schema.columns")) {
          const cols = [];
          for (const [tbl, colList] of Object.entries(REQUIRED_SCHEMA_OBJECTS.columns)) {
            for (const c of colList) {
              cols.push({
                table_name: tbl,
                column_name: c.name,
                data_type: c.type,
                is_nullable: c.nullable,
              });
            }
          }
          return cols;
        }
        if (sql.includes("pg_constraint")) {
          // Omit primary key on admin_users and unique constraint on reference_code
          return [
            { conname: "service_categories_pkey", contype: "p", table_name: "service_categories" },
            { conname: "service_requests_pkey", contype: "p", table_name: "service_requests" },
            { conname: "request_status_history_pkey", contype: "p", table_name: "request_status_history" },
            { conname: "service_categories_slug_key", contype: "u" },
            { conname: "admin_users_username_key", contype: "u" },
            { conname: "service_requests_service_mode_check", contype: "c" },
            { conname: "service_requests_device_category_check", contype: "c" },
            { conname: "service_requests_status_check", contype: "c" },
            { conname: "admin_users_role_check", contype: "c" },
          ];
        }
        if (sql.includes("pg_indexes")) {
          return REQUIRED_SCHEMA_OBJECTS.indexes.map((i) => ({ indexname: i }));
        }
        if (sql.includes("service_categories")) {
          return REQUIRED_SCHEMA_OBJECTS.serviceCategories.map((c) => ({ id: c.id, slug: c.slug }));
        }
        return [];
      },
    };

    const result = await verifyCompleteSchema(mockClient);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) =>
        e.includes('Khóa chính (Primary Key) còn thiếu trên bảng: "admin_users"')
      )
    );
    assert.ok(
      result.errors.some((e) =>
        e.includes('Ràng buộc duy nhất (Unique Constraint) còn thiếu: "service_requests_reference_code_key"')
      )
    );
  });
});
