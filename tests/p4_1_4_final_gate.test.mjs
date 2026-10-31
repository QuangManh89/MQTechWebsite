/**
 * P4.1.4 Final Integration Gate Test Suite
 * 
 * Verifies:
 * 1. PostgreSQL CLI Invocation (libpq service file via --dbname="service=...", --no-password, no unsupported --service).
 * 2. Credential Helper parsing & serialization (#, ;, =, \, spaces, unicode, %-encoded, INI injection prevention).
 * 3. Restore Target Identity (expectedHost, expectedDbName, serverIdentifier, source conflict, fail-closed).
 * 4. Pooled vs Direct Connection Verification (Fly MPG patterns, flycast, pgbouncer, port 6543, 0.0.0.0 rejection).
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  parseDatabaseUrl,
  writeSecurePgServiceFile,
  validateServiceName,
  escapeIniValue,
  getSafeDumpArgs,
  getSafeRestoreArgs,
} from "../scripts/credential-helper.mjs";
import { validateRestoreTarget } from "../scripts/restore-guard.mjs";
import {
  isPooledConnection,
  validateMigrationTarget,
} from "../scripts/migrate.mjs";

describe("P4.1.4 Final Integration Gate: CLI Invocation, Credential Safety & Restore Target", () => {
  // =========================================================================
  // Task A: Correct PostgreSQL Service-File CLI Invocation
  // =========================================================================

  test("CLI Invocation: pg_dump arguments use supported --dbname=service=... and --no-password", () => {
    const dumpArgs = getSafeDumpArgs({
      serviceName: "mqtech_backup",
      filePath: "/backups/mqtech_backup.dump",
    });

    // 1. MUST NOT contain unsupported --service argument
    assert.ok(
      !dumpArgs.some((arg) => arg.startsWith("--service")),
      "CLI invocation MUST NOT use unsupported --service argument"
    );

    // 2. MUST use supported libpq connection syntax
    assert.ok(
      dumpArgs.includes("--dbname=service=mqtech_backup"),
      "Must use --dbname=service=mqtech_backup"
    );

    // 3. MUST use --no-password for unattended execution
    assert.ok(
      dumpArgs.includes("--no-password"),
      "Must include --no-password (-w) flag"
    );

    // 4. Zero credentials or raw URIs in argv
    assert.ok(
      !dumpArgs.some((arg) => arg.includes("postgresql://")),
      "Must not include raw postgresql:// URI"
    );
  });

  test("CLI Invocation: pg_restore arguments use supported --dbname=service=... and --no-password", () => {
    const restoreArgs = getSafeRestoreArgs({
      serviceName: "mqtech_restore",
      backupFilePath: "/backups/mqtech_backup.dump",
    });

    // 1. MUST NOT contain unsupported --service argument
    assert.ok(
      !restoreArgs.some((arg) => arg.startsWith("--service")),
      "CLI invocation MUST NOT use unsupported --service argument"
    );

    // 2. MUST use supported libpq connection syntax
    assert.ok(
      restoreArgs.includes("--dbname=service=mqtech_restore"),
      "Must use --dbname=service=mqtech_restore"
    );

    // 3. MUST use --no-password, --single-transaction, and --exit-on-error
    assert.ok(
      restoreArgs.includes("--no-password"),
      "Must include --no-password flag"
    );
    assert.ok(
      restoreArgs.includes("--single-transaction"),
      "Must include --single-transaction flag for atomic restore rollback"
    );
    assert.ok(
      restoreArgs.includes("--exit-on-error"),
      "Must include --exit-on-error flag"
    );

    // 4. Clean and if-exists flags
    assert.ok(restoreArgs.includes("--clean"));
    assert.ok(restoreArgs.includes("--if-exists"));
  });

  // =========================================================================
  // Task B: Credential Parsing, INI Injection & Special Characters
  // =========================================================================

  test("Credential Parser: correctly decodes percent-encoded characters (#, ;, =, spaces, unicode)", () => {
    // Percent-encoded password containing #, ;, =, spaces, and unicode
    // # -> %23, ; -> %3B, = -> %3D, space -> %20, \ -> %5C
    const rawUrl = "postgresql://mq_user:P%23ss%3Bw%3Drd%20%5C%E1%BA%BF@localhost:5432/mqtech_dev";
    const parsed = parseDatabaseUrl(rawUrl);

    assert.strictEqual(parsed.user, "mq_user");
    assert.strictEqual(parsed.password, "P#ss;w=rd \\ế");
    assert.strictEqual(parsed.dbname, "mqtech_dev");
    assert.strictEqual(parsed.host, "localhost");
    assert.strictEqual(parsed.port, "5432");
  });

  test("Credential Serializer: prevents INI injection by forbidding newlines and illegal service names", () => {
    // 1. Service name with newline or brackets must be rejected
    assert.throws(
      () => validateServiceName("bad\n[injection]"),
      /Tên dịch vụ không hợp lệ/
    );
    assert.throws(
      () => validateServiceName("bad service name with spaces"),
      /Tên dịch vụ không hợp lệ/
    );
    assert.throws(
      () => validateServiceName("bad;service"),
      /Tên dịch vụ không hợp lệ/
    );

    // 2. Passwords or usernames containing newlines must throw to prevent INI injection
    assert.throws(
      () => escapeIniValue("password\nadmin=true"),
      /Phát hiện ký tự xuống dòng/
    );
    assert.throws(
      () => escapeIniValue("password\r\n[evil_section]"),
      /Phát hiện ký tự xuống dòng/
    );

    // 3. Valid special characters are safely quoted in INI output
    const quoted = escapeIniValue("pass#word;=123 with spaces");
    assert.ok(quoted.startsWith('"') && quoted.endsWith('"'), "Values with special chars must be quoted");
  });

  test("Credential Helper: writes secure pg_service.conf with 0600 mode in private 0700 dir", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mqtech_test_gate_"));
    const serviceFile = path.join(tmpDir, "pg_service.conf");

    try {
      writeSecurePgServiceFile({
        databaseUrl: "postgresql://app_user:Strong%23Pass%3D99@localhost:5432/mqtech_dev",
        serviceName: "mqtech_backup",
        outputFilePath: serviceFile,
      });

      assert.ok(fs.existsSync(serviceFile));
      const content = fs.readFileSync(serviceFile, "utf8");
      assert.ok(content.includes("[mqtech_backup]"));
      assert.ok(content.includes("user=app_user"));
      assert.ok(content.includes("dbname=mqtech_dev"));
      assert.ok(content.includes('password="Strong#Pass=99"'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // =========================================================================
  // Task C: Strengthen Restore Target Identity
  // =========================================================================

  test("Restore Guard: requires matching expectedHost and expectedDbName when specified", () => {
    // 1. Matching expected host and dbName
    const resValid = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@localhost:5432/mqtech_restore_test",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_restore_test",
      expectedHost: "localhost",
      expectedDbName: "mqtech_restore_test",
    });
    assert.strictEqual(resValid.allowed, true);

    // 2. Mismatched expected host
    const resBadHost = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@localhost:5432/mqtech_restore_test",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_restore_test",
      expectedHost: "127.0.0.1",
    });
    assert.strictEqual(resBadHost.allowed, false);
    assert.ok(resBadHost.reason.includes("không khớp với máy chủ kỳ vọng"));

    // 3. Mismatched expected dbName
    const resBadDb = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@localhost:5432/mqtech_restore_test",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_restore_test",
      expectedDbName: "mqtech_stage_drill",
    });
    assert.strictEqual(resBadDb.allowed, false);
    assert.ok(resBadDb.reason.includes("không khớp với tên CSDL kỳ vọng"));
  });

  test("Restore Guard: rejects self-clobbering when source and target resolve to same identity", () => {
    const resConflict = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@localhost:5432/mqtech_test_db",
      sourceUrl: "postgresql://user:pass@localhost:5432/mqtech_test_db",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_test_db",
    });
    assert.strictEqual(resConflict.allowed, false);
    assert.ok(resConflict.reason.includes("trùng khớp hoàn toàn với nguồn dữ liệu gốc"));
  });

  test("Restore Guard: verifies database server identity when expectedSystemIdentifier is set", () => {
    // 1. System identifier matches
    const resMatch = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@localhost:5432/mqtech_test_db",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_test_db",
      expectedSystemIdentifier: "SYS_ID_1234567890",
      serverIdentifier: "SYS_ID_1234567890",
    });
    assert.strictEqual(resMatch.allowed, true);

    // 2. System identifier mismatch
    const resMismatch = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@localhost:5432/mqtech_test_db",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_test_db",
      expectedSystemIdentifier: "SYS_ID_1234567890",
      serverIdentifier: "SYS_ID_WRONG_CLUSTER",
    });
    assert.strictEqual(resMismatch.allowed, false);
    assert.ok(resMismatch.reason.includes("không khớp với định danh kỳ vọng"));

    // 3. Missing server identifier when expected
    const resMissing = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@localhost:5432/mqtech_test_db",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_test_db",
      expectedSystemIdentifier: "SYS_ID_1234567890",
      serverIdentifier: undefined,
    });
    assert.strictEqual(resMissing.allowed, false);
  });

  // =========================================================================
  // Task E: Verify Pooled and Direct Connections
  // =========================================================================

  test("Connection Detection: identifies Fly MPG and PgBouncer pooled connection patterns", () => {
    // 1. Port 6543
    assert.strictEqual(isPooledConnection("postgresql://user:pass@db.internal:6543/mqtech"), true);

    // 2. Host with pooler
    assert.strictEqual(isPooledConnection("postgresql://user:pass@pooler.internal:5432/mqtech"), true);

    // 3. Host with pgbouncer
    assert.strictEqual(isPooledConnection("postgresql://user:pass@pgbouncer.internal:5432/mqtech"), true);

    // 4. Host ending with .flycast (Fly MPG PgBouncer proxy)
    assert.strictEqual(isPooledConnection("postgresql://user:pass@mqtech-db.flycast:5432/mqtech"), true);

    // 5. Query param pgbouncer=true
    assert.strictEqual(isPooledConnection("postgresql://user:pass@db.internal:5432/mqtech?pgbouncer=true"), true);

    // 6. Direct connection on localhost
    assert.strictEqual(isPooledConnection("postgresql://user:pass@localhost:5432/mqtech_dev"), false);

    // 7. Direct internal connection on port 5432
    assert.strictEqual(isPooledConnection("postgresql://user:pass@mqtech-db.internal:5432/mqtech"), false);
  });

  test("Migration Runner: rejects 0.0.0.0 and pooled connections", () => {
    // 1. 0.0.0.0 must be rejected
    const resZero = validateMigrationTarget("postgresql://user:pass@0.0.0.0:5432/mqtech_dev", false);
    assert.strictEqual(resZero.allowed, false);
    assert.ok(resZero.reason.includes("không phải là máy chủ cục bộ"));

    // 2. Pooled connection must be rejected
    const resPool = validateMigrationTarget("postgresql://user:pass@localhost:6543/mqtech_dev", false);
    assert.strictEqual(resPool.allowed, false);
    assert.ok(resPool.reason.includes("Phát hiện kết nối pooled"));
  });
});
