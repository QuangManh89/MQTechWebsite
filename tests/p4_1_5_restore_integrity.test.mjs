/**
 * P4.1.5 Restore Integrity & Connection Security Closeout Test Suite
 * 
 * Verifies:
 * 1. Restore failure policy: --single-transaction and --exit-on-error (atomic rollback).
 * 2. TLS/connection security parameter preservation (sslmode, sslrootcert, sslcert, sslkey, connect_timeout, target_session_attrs, application_name).
 * 3. Strict TLS rejection: no silent downgrade, rejection of invalid sslmode.
 * 4. Restore identity verification: independent expected host/database requirements, system identifier verification, fail-closed behavior.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  parseDatabaseUrl,
  buildPgServiceConfig,
  getSafeRestoreArgs,
  VALID_SSL_MODES,
} from "../scripts/credential-helper.mjs";
import { validateRestoreTarget } from "../scripts/restore-guard.mjs";

describe("P4.1.5 Restore Integrity & Connection Security Closeout", () => {
  // =========================================================================
  // Task 1: Restore Failure Handling & Atomic Rollback
  // =========================================================================

  test("Restore Failure Handling: generates --single-transaction and --exit-on-error for atomic rollback", () => {
    const restoreArgs = getSafeRestoreArgs({
      serviceName: "mqtech_restore",
      backupFilePath: "/backups/mqtech_backup.dump",
    });

    // 1. Single transaction must be present
    assert.ok(
      restoreArgs.includes("--single-transaction"),
      "Must include --single-transaction (-1) for atomic commit/rollback"
    );

    // 2. Exit on error must be present
    assert.ok(
      restoreArgs.includes("--exit-on-error"),
      "Must include --exit-on-error (-e) to halt on first SQL failure"
    );

    // 3. Must NOT include parallel jobs (-j / --jobs) as it conflicts with --single-transaction
    assert.ok(
      !restoreArgs.some((arg) => arg.startsWith("-j") || arg.startsWith("--jobs")),
      "--single-transaction cannot be combined with parallel jobs"
    );

    // 4. Standard cleanup and service connection
    assert.ok(restoreArgs.includes("--clean"));
    assert.ok(restoreArgs.includes("--if-exists"));
    assert.ok(restoreArgs.includes("--dbname=service=mqtech_restore"));
    assert.ok(restoreArgs.includes("--no-password"));
  });

  // =========================================================================
  // Task 2: Preserve PostgreSQL Connection Security Parameters
  // =========================================================================

  test("Connection Security: preserves valid sslmode without silent downgrade", () => {
    // 1. verify-full must be preserved exactly as verify-full
    const urlVerifyFull = "postgresql://mq_user:pass@localhost:5432/mqtech_dev?sslmode=verify-full";
    const parsedFull = parseDatabaseUrl(urlVerifyFull);
    assert.strictEqual(parsedFull.sslmode, "verify-full");

    const iniFull = buildPgServiceConfig({ databaseUrl: urlVerifyFull, serviceName: "test_full" });
    assert.ok(iniFull.includes("sslmode=verify-full"));
    assert.ok(!iniFull.includes("sslmode=prefer"), "Must not downgrade to prefer");
    assert.ok(!iniFull.includes("sslmode=require"), "Must not downgrade to require");

    // 2. All valid PostgreSQL libpq sslmodes are accepted
    for (const mode of VALID_SSL_MODES) {
      const url = `postgresql://mq_user:pass@localhost:5432/mqtech_dev?sslmode=${mode}`;
      const parsed = parseDatabaseUrl(url);
      assert.strictEqual(parsed.sslmode, mode);
    }
  });

  test("Connection Security: rejects unsupported, invalid, or ambiguous sslmode configurations", () => {
    // 1. Invalid sslmode must throw
    assert.throws(
      () => parseDatabaseUrl("postgresql://mq_user:pass@localhost:5432/mqtech_dev?sslmode=insecure"),
      /Cấu hình sslmode không hợp lệ hoặc không an toàn/
    );
    assert.throws(
      () => parseDatabaseUrl("postgresql://mq_user:pass@localhost:5432/mqtech_dev?sslmode=yes"),
      /Cấu hình sslmode không hợp lệ hoặc không an toàn/
    );
  });

  test("Connection Security: extracts and preserves TLS certificates, timeouts, and session attributes", () => {
    const rawUrl =
      "postgresql://mq_user:SecretP%40ss@localhost:5432/mqtech_dev" +
      "?sslmode=verify-full" +
      "&sslrootcert=%2Fetc%2Fssl%2Fcerts%2Froot.crt" +
      "&sslcert=%2Fetc%2Fssl%2Fcerts%2Fclient.crt" +
      "&sslkey=%2Fetc%2Fssl%2Fprivate%2Fclient.key" +
      "&connect_timeout=15" +
      "&target_session_attrs=primary" +
      "&application_name=MQTech%20Engine";

    const parsed = parseDatabaseUrl(rawUrl);
    assert.strictEqual(parsed.sslmode, "verify-full");
    assert.strictEqual(parsed.sslrootcert, "/etc/ssl/certs/root.crt");
    assert.strictEqual(parsed.sslcert, "/etc/ssl/certs/client.crt");
    assert.strictEqual(parsed.sslkey, "/etc/ssl/private/client.key");
    assert.strictEqual(parsed.connectTimeout, "15");
    assert.strictEqual(parsed.targetSessionAttrs, "primary");
    assert.strictEqual(parsed.applicationName, "MQTech Engine");

    const iniContent = buildPgServiceConfig({ databaseUrl: rawUrl, serviceName: "mqtech_tls" });
    assert.ok(iniContent.includes("sslmode=verify-full"));
    assert.ok(iniContent.includes("sslrootcert=/etc/ssl/certs/root.crt"));
    assert.ok(iniContent.includes("sslcert=/etc/ssl/certs/client.crt"));
    assert.ok(iniContent.includes("sslkey=/etc/ssl/private/client.key"));
    assert.ok(iniContent.includes("connect_timeout=15"));
    assert.ok(iniContent.includes("target_session_attrs=primary"));
    assert.ok(iniContent.includes('application_name="MQTech Engine"'));
  });

  test("Connection Security: rejects newlines in TLS certificate paths or invalid connect_timeout", () => {
    // 1. Encoded or literal newline in sslrootcert
    assert.throws(
      () => parseDatabaseUrl("postgresql://mq_user:pass@localhost:5432/mqtech_dev?sslrootcert=/etc/ssl%0Aattack=true"),
      /Đường dẫn sslrootcert chứa ký tự xuống dòng/
    );
    assert.throws(
      () => parseDatabaseUrl("postgresql://mq_user:pass@localhost:5432/mqtech_dev\nattack=true"),
      /Phát hiện ký tự xuống dòng/
    );

    // 2. Invalid connect_timeout (non-numeric or negative)
    assert.throws(
      () => parseDatabaseUrl("postgresql://mq_user:pass@localhost:5432/mqtech_dev?connect_timeout=abc"),
      /connect_timeout không hợp lệ/
    );
    assert.throws(
      () => parseDatabaseUrl("postgresql://mq_user:pass@localhost:5432/mqtech_dev?connect_timeout=-5"),
      /connect_timeout không hợp lệ/
    );

    // 3. Invalid target_session_attrs
    assert.throws(
      () => parseDatabaseUrl("postgresql://mq_user:pass@localhost:5432/mqtech_dev?target_session_attrs=master"),
      /target_session_attrs không hợp lệ/
    );
  });

  // =========================================================================
  // Task 3: Restore Target Identity & Strict Failure Policies
  // =========================================================================

  test("Restore Identity: requires explicit expectedHost and expectedDbName when requireExplicitIdentity is true", () => {
    // 1. Missing expectedHost
    const resNoHost = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@localhost:5432/mqtech_restore_test",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_restore_test",
      requireExplicitIdentity: true,
      expectedHost: undefined,
      expectedDbName: "mqtech_restore_test",
    });
    assert.strictEqual(resNoHost.allowed, false);
    assert.ok(resNoHost.reason.includes("Bắt buộc phải khai báo máy chủ kỳ vọng"));

    // 2. Missing expectedDbName
    const resNoDb = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@localhost:5432/mqtech_restore_test",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_restore_test",
      requireExplicitIdentity: true,
      expectedHost: "localhost",
      expectedDbName: undefined,
    });
    assert.strictEqual(resNoDb.allowed, false);
    assert.ok(resNoDb.reason.includes("Bắt buộc phải khai báo tên CSDL kỳ vọng"));
  });

  test("Restore Identity: server identity policy refuses execution if serverIdentifier cannot be established", () => {
    const res = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@localhost:5432/mqtech_restore_test",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_restore_test",
      expectedHost: "localhost",
      expectedDbName: "mqtech_restore_test",
      requireSystemIdentifier: true,
      serverIdentifier: undefined,
    });
    assert.strictEqual(res.allowed, false);
    assert.ok(res.reason.includes("không lấy được định danh thực tế từ máy chủ CSDL"));
  });

  test("Restore Identity: operator confirmation flag CAN NEVER override failed identity check", () => {
    // Both confirm flags are set, but expectedHost mismatches
    const res = validateRestoreTarget({
      targetUrl: "postgresql://user:pass@localhost:5432/mqtech_restore_test",
      confirmDestructiveRestore: true,
      confirmRestoreDbName: "mqtech_restore_test",
      expectedHost: "remote-cluster.internal",
      expectedDbName: "mqtech_restore_test",
    });
    assert.strictEqual(res.allowed, false);
    assert.ok(res.reason.includes("không khớp với máy chủ kỳ vọng"));
  });
});
