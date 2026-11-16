import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  validateMigrationTarget,
  verifyCompleteSchema,
  executeMigrationsOnConnection,
  REQUIRED_SCHEMA_OBJECTS,
} from "../scripts/migrate.mjs";
import { validateRestoreTarget } from "../scripts/restore-guard.mjs";

describe("P4.1.2 Deployment Safety: Healthchecks, Migration Baseline & Restore Guard", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    delete process.env.DATABASE_URL;
    delete process.env.TARGET_DATABASE_URL;
    delete process.env.SOURCE_DATABASE_URL;
    delete process.env.CONFIRM_DESTRUCTIVE_RESTORE;
    delete process.env.CONFIRM_RESTORE_DB_NAME;
    delete process.env.CONFIRM_BASELINE;
  });

  // =========================================================================
  // Fix A: Correct Fly.io Healthcheck Configuration Semantics
  // =========================================================================

  test("Healthcheck Config: fly.toml correctly separates traffic readiness from monitoring", () => {
    const flyTomlPath = path.resolve(process.cwd(), "fly.toml");
    assert.ok(fs.existsSync(flyTomlPath), "fly.toml must exist as local deployment template");
    const flyToml = fs.readFileSync(flyTomlPath, "utf-8");

    // 1. Service check controls traffic routing via /api/ready
    assert.ok(
      flyToml.includes('path = "/api/ready"'),
      "Service check must query /api/ready for database readiness"
    );
    assert.ok(
      flyToml.includes("[[http_service.checks]]"),
      "Must configure service-level check under http_service"
    );

    // 2. Must not claim that service checks restart machines
    assert.ok(
      !flyToml.includes("restart_limit"),
      "Must not include unsupported restart_limit key on service checks"
    );

    // 3. Top-level monitoring check monitors /api/health
    assert.ok(
      flyToml.includes('path = "/api/health"'),
      "Top-level check must query /api/health for process liveness"
    );
    assert.ok(
      flyToml.includes("[checks.process_liveness]"),
      "Must configure top-level monitoring check"
    );

    // 4. Dockerfile healthcheck queries /api/health for container engine
    const dockerfilePath = path.resolve(process.cwd(), "Dockerfile");
    const dockerfile = fs.readFileSync(dockerfilePath, "utf-8");
    assert.ok(
      dockerfile.includes("http://127.0.0.1:3000/api/health"),
      "Dockerfile HEALTHCHECK must evaluate lightweight /api/health endpoint"
    );
  });

  // =========================================================================
  // Fix B: Migration Baseline Target & Full Schema Verification
  // =========================================================================

  test("Migration Baseline: rejects remote cloud hosts and production database targets", () => {
    // 1. Remote host
    const resRemote = validateMigrationTarget(
      "postgresql://user:pass@fly.dev:5432/mqtech_dev",
      false
    );
    assert.strictEqual(resRemote.allowed, false);

    // 2. Production DB name
    const resProd = validateMigrationTarget(
      "postgresql://user:pass@localhost:5432/mqtech_production",
      false
    );
    assert.strictEqual(resProd.allowed, false);

    // 3. Valid local dev target
    const resLocal = validateMigrationTarget(
      "postgresql://user:pass@localhost:5432/mqtech_dev",
      false
    );
    assert.strictEqual(resLocal.allowed, true);
  });

  test("verifyCompleteSchema: rejects incomplete database schema missing required tables", async () => {
    const mockIncompleteClient = {
      async query(sql) {
        if (sql.includes("information_schema.tables")) {
          // Missing admin_users and request_status_history
          return [{ table_name: "service_categories" }, { table_name: "service_requests" }];
        }
        if (sql.includes("information_schema.columns")) return [];
        if (sql.includes("pg_indexes")) return [];
        if (sql.includes("service_categories")) return [];
        return [];
      },
    };

    const result = await verifyCompleteSchema(mockIncompleteClient);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.includes('Bảng bắt buộc còn thiếu: "request_status_history"'))
    );
    assert.ok(
      result.errors.some((e) => e.includes('Bảng bắt buộc còn thiếu: "admin_users"'))
    );
  });

  test("verifyCompleteSchema: rejects schema missing token_version or is_active in admin_users", async () => {
    const mockClient = {
      async query(sql) {
        if (sql.includes("information_schema.tables")) {
          return REQUIRED_SCHEMA_OBJECTS.tables.map((t) => ({ table_name: t }));
        }
        if (sql.includes("information_schema.columns")) {
          // Return admin_users columns WITHOUT token_version and is_active
          return [
            { table_name: "admin_users", column_name: "id", is_nullable: "NO" },
            { table_name: "admin_users", column_name: "username", is_nullable: "NO" },
            { table_name: "admin_users", column_name: "password_hash", is_nullable: "NO" },
            { table_name: "admin_users", column_name: "full_name", is_nullable: "NO" },
            { table_name: "admin_users", column_name: "role", is_nullable: "NO" },
            { table_name: "admin_users", column_name: "created_at", is_nullable: "NO" },
          ];
        }
        if (sql.includes("pg_indexes")) return [];
        if (sql.includes("service_categories")) return [];
        return [];
      },
    };

    const result = await verifyCompleteSchema(mockClient);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.includes('Cột bắt buộc còn thiếu: "admin_users.token_version"'))
    );
    assert.ok(
      result.errors.some((e) => e.includes('Cột bắt buộc còn thiếu: "admin_users.is_active"'))
    );
  });

  test("verifyCompleteSchema: rejects schema missing confirmed 6 service category seeds", async () => {
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
          // Only return 2 categories
          return [
            { id: "svc_desktop_laptop", slug: "sua-chua-laptop-pc" },
            { id: "svc_windows_software", slug: "cai-dat-windows-phan-mem" },
          ];
        }
        return [];
      },
    };

    const result = await verifyCompleteSchema(mockClient);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) =>
        e.includes('Dữ liệu mẫu (seed) còn thiếu mã danh mục: "svc_hardware_upgrade"')
      )
    );
  });

  test("executeMigrationsOnConnection: baseline requires explicit confirmation and complete schema", async () => {
    const buildCompleteMockClient = () => ({
      queries: [],
      async query(sql, params = []) {
        this.queries.push({ sql, params });
        if (sql.includes("SELECT version, checksum FROM schema_migrations")) {
          return [];
        }
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
          return REQUIRED_SCHEMA_OBJECTS.serviceCategories.map((c) => ({
            id: c.id,
            slug: c.slug,
          }));
        }
        return [];
      },
    });

    // 1. Without confirmBaseline -> reject
    const clientNoConfirm = buildCompleteMockClient();
    await assert.rejects(
      () => executeMigrationsOnConnection(clientNoConfirm, { isBaseline: true, confirmBaseline: false }),
      /BASELINE ABORTED: Baselining requires explicit operator confirmation/
    );

    // 2. With confirmBaseline and complete schema -> successfully records 001 without executing DDL
    const clientWithConfirm = buildCompleteMockClient();
    const result = await executeMigrationsOnConnection(clientWithConfirm, {
      isBaseline: true,
      confirmBaseline: true,
    });
    assert.strictEqual(result.dryRun, false);
    assert.deepStrictEqual(result.applied, ["001", "002", "003"]);

    // Verify DDL was NOT executed
    const executedSqls = clientWithConfirm.queries.map((q) => q.sql);
    assert.ok(!executedSqls.some((s) => s.includes("CREATE TABLE IF NOT EXISTS service_requests")));
    assert.ok(executedSqls.some((s) => s.includes("INSERT INTO schema_migrations")));
  });

  // =========================================================================
  // Fix C: Backup and Restore Target Safety
  // =========================================================================

  test("validateRestoreTarget: rejects non-allowlisted / remote cloud hosts", () => {
    const res = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@fly.dev:5432/mqtech_dev",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_dev",
    });
    assert.strictEqual(res.allowed, false);
    assert.match(res.reason, /không nằm trong danh sách máy chủ an toàn/);
  });

  test("validateRestoreTarget: rejects target without disposable marker", () => {
    const res = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@localhost:5432/mqtech_main_data",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_main_data",
    });
    assert.strictEqual(res.allowed, false);
    assert.match(res.reason, /không chứa ký hiệu dùng một lần/);
  });

  test("validateRestoreTarget: rejects source and target identity conflict (self-clobbering)", () => {
    const res = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@localhost:5432/mqtech_test_db",
      sourceUrl: "postgresql://admin:secret@localhost:5432/mqtech_test_db",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_test_db",
    });
    assert.strictEqual(res.allowed, false);
    assert.match(res.reason, /Cơ sở dữ liệu đích trùng khớp hoàn toàn với nguồn dữ liệu gốc/);
  });

  test("validateRestoreTarget: requires both CONFIRM_DESTRUCTIVE_RESTORE and matching CONFIRM_RESTORE_DB_NAME", () => {
    // 1. Missing CONFIRM_DESTRUCTIVE_RESTORE
    const resNoConfirm = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@localhost:5432/mqtech_test_db",
      confirmDestructiveRestore: false,
      confirmRestoreDbName: "mqtech_test_db",
    });
    assert.strictEqual(resNoConfirm.allowed, false);
    assert.match(resNoConfirm.reason, /Yêu cầu đặt biến môi trường CONFIRM_DESTRUCTIVE_RESTORE=true/);

    // 2. Mismatched database name confirmation
    const resNameMismatch = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@localhost:5432/mqtech_test_db",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "other_db_name",
    });
    assert.strictEqual(resNameMismatch.allowed, false);
    assert.match(resNameMismatch.reason, /Tên xác nhận.*không khớp với tên CSDL đích/);
  });

  test("validateRestoreTarget: accepts verified disposable target with credentials masked", () => {
    const res = validateRestoreTarget({
      targetUrl: "postgresql://superadmin:TopSecretPassword@localhost:5432/mqtech_restore_test",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_restore_test",
    });
    assert.strictEqual(res.allowed, true);
    assert.strictEqual(res.details.host, "localhost");
    assert.strictEqual(res.details.dbName, "mqtech_restore_test");
    assert.ok(!res.details.maskedUrl.includes("TopSecretPassword"), "Password must be masked");
    assert.ok(res.details.maskedUrl.includes("***"), "Masked URL must contain ***");
  });
});
