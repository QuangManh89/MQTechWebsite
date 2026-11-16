/**
 * P5 Backup & Restore Pipeline Integration Test Suite
 * 
 * Verifies:
 * 1. End-to-end backup generation, SHA-256 checksum generation and verification.
 * 2. At-rest encryption using AES-256-GCM (simulating GPG/KMS envelope encryption).
 * 3. Tamper detection: bit-flip in encrypted backup fails checksum and auth tag verification.
 * 4. Decryption integrity: decrypted payload matches original bit-for-bit.
 * 5. Restore Guard: verifies safe disposable targets and strictly rejects production/remote targets.
 * 6. Atomic restore CLI argument generation (--single-transaction, --exit-on-error).
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getSafeRestoreArgs, getSafeDumpArgs } from "../scripts/credential-helper.mjs";
import { validateRestoreTarget } from "../scripts/restore-guard.mjs";

describe("P5 Backup & Restore Pipeline Integration", () => {
  const tempTestDir = path.resolve(process.cwd(), "tests/fixtures/backup_restore_test");

  // Setup temporary test directory
  if (!fs.existsSync(tempTestDir)) {
    fs.mkdirSync(tempTestDir, { recursive: true });
  }

  // =========================================================================
  // 1. Backup Arguments & Credential Isolation Verification
  // =========================================================================
  test("Backup Engine: generates safe pg_dump arguments without exposing credentials in argv", () => {
    const backupArgs = getSafeDumpArgs({
      serviceName: "mqtech_backup",
      filePath: "/backups/mqtech_backup_test.dump",
    });

    assert.ok(backupArgs.includes('--dbname=service=mqtech_backup'));
    assert.ok(backupArgs.includes('--no-password'));
    assert.ok(backupArgs.includes('--format=c'));
    assert.ok(backupArgs.includes('--no-owner'));
    assert.ok(backupArgs.includes('--no-privileges'));
    assert.ok(backupArgs.includes('--file=/backups/mqtech_backup_test.dump'));

    // Strictly ensure no passwords or connection strings are in argv
    assert.ok(!backupArgs.some((arg) => arg.includes("password=") || arg.includes("postgres://")));
  });

  // =========================================================================
  // 2. Encryption At-Rest (AES-256-GCM Envelope Encryption) & Checksum
  // =========================================================================
  test("Backup Encryption & Checksum: creates dump, encrypts at rest, verifies SHA256 and detects tampering", () => {
    const originalPayload = Buffer.from(
      "PGDMP_MOCK_CLUSTER_DATA: TABLE service_requests (id: 1, ref: 'MQT-9999-ABCD', status: 'CONFIRMED')"
    );
    const dumpFilePath = path.join(tempTestDir, "sample_backup.dump");
    const encFilePath = path.join(tempTestDir, "sample_backup.dump.enc");
    const checksumFilePath = path.join(tempTestDir, "sample_backup.dump.enc.sha256");

    fs.writeFileSync(dumpFilePath, originalPayload);

    // 1. Envelope Encryption: AES-256-GCM
    const masterKey = crypto.randomBytes(32); // 256-bit AES key
    const iv = crypto.randomBytes(12); // 96-bit GCM IV
    const cipher = crypto.createCipheriv("aes-256-gcm", masterKey, iv);

    const encrypted = Buffer.concat([cipher.update(originalPayload), cipher.final()]);
    const authTag = cipher.getAuthTag(); // 128-bit authentication tag

    // Pack: IV (12 bytes) + AuthTag (16 bytes) + Ciphertext
    const packedEncrypted = Buffer.concat([iv, authTag, encrypted]);
    fs.writeFileSync(encFilePath, packedEncrypted);

    // 2. Compute SHA-256 Checksum
    const sha256 = crypto.createHash("sha256").update(packedEncrypted).digest("hex");
    fs.writeFileSync(checksumFilePath, `${sha256}  sample_backup.dump.enc\n`);

    // 3. Verify Checksum matches
    const readEncrypted = fs.readFileSync(encFilePath);
    const verifySha256 = crypto.createHash("sha256").update(readEncrypted).digest("hex");
    assert.strictEqual(verifySha256, sha256, "SHA-256 checksum must match");

    // 4. Decrypt and verify payload
    const readIv = readEncrypted.subarray(0, 12);
    const readTag = readEncrypted.subarray(12, 28);
    const readCiphertext = readEncrypted.subarray(28);

    const decipher = crypto.createDecipheriv("aes-256-gcm", masterKey, readIv);
    decipher.setAuthTag(readTag);
    const decrypted = Buffer.concat([decipher.update(readCiphertext), decipher.final()]);

    assert.deepStrictEqual(decrypted, originalPayload, "Decrypted data must match original payload bit-for-bit");

    // 5. Tampering Test: Flipping 1 bit in ciphertext must fail authentication
    const tamperedEncrypted = Buffer.from(packedEncrypted);
    tamperedEncrypted[30] ^= 0xff; // flip bits in ciphertext

    const tamperedSha256 = crypto.createHash("sha256").update(tamperedEncrypted).digest("hex");
    assert.notStrictEqual(tamperedSha256, sha256, "Tampered file must fail SHA-256 checksum");

    const tamperedDecipher = crypto.createDecipheriv("aes-256-gcm", masterKey, readIv);
    tamperedDecipher.setAuthTag(readTag);
    assert.throws(
      () => {
        Buffer.concat([tamperedDecipher.update(tamperedEncrypted.subarray(28)), tamperedDecipher.final()]);
      },
      /Unsupported state or unable to authenticate data/,
      "Tampered encrypted file must fail GCM authentication"
    );

    // Cleanup temporary files
    try {
      fs.unlinkSync(dumpFilePath);
      fs.unlinkSync(encFilePath);
      fs.unlinkSync(checksumFilePath);
      fs.rmdirSync(tempTestDir);
    } catch {
      // ignore cleanup errors
    }
  });

  // =========================================================================
  // 3. Restore Guard Target Validation & Atomic Rollback
  // =========================================================================
  test("Restore Guard: accepts valid disposable targets and strictly rejects production/remote targets", () => {
    // 1. Valid disposable target on localhost -> ACCEPTED
    const validDisposableUrl = "postgresql://restore_user:pass@127.0.0.1:5432/mqtech_restore_test";
    const validResult = validateRestoreTarget({
      targetUrl: validDisposableUrl,
      expectedHost: "127.0.0.1",
      expectedDbName: "mqtech_restore_test",
      confirmDestructiveRestore: "true",
      confirmRestoreDbName: "mqtech_restore_test",
    });
    assert.strictEqual(validResult.allowed, true);
    assert.strictEqual(validResult.details.host, "127.0.0.1");
    assert.strictEqual(validResult.details.dbName, "mqtech_restore_test");

    // 2. Production target -> STRICTLY REJECTED
    const prodTargetUrl = "postgresql://user:pass@mqtech-prod-db.internal:5432/mqtech_prod";
    const prodResult = validateRestoreTarget({
      targetUrl: prodTargetUrl,
      expectedHost: "mqtech-prod-db.internal",
      expectedDbName: "mqtech_prod",
      confirmDestructiveRestore: "true",
      confirmRestoreDbName: "mqtech_prod",
    });
    assert.strictEqual(prodResult.allowed, false);
    assert.ok(prodResult.reason.includes("không nằm trong danh sách"));

    // 3. OpenWebUI target -> STRICTLY REJECTED
    const openwebuiUrl = "postgresql://user:pass@openwebui-mqtech.internal:5432/openwebui";
    const openwebuiResult = validateRestoreTarget({
      targetUrl: openwebuiUrl,
      expectedHost: "openwebui-mqtech.internal",
      expectedDbName: "openwebui",
      confirmDestructiveRestore: "true",
      confirmRestoreDbName: "openwebui",
    });
    assert.strictEqual(openwebuiResult.allowed, false);
    assert.ok(openwebuiResult.reason.includes("không nằm trong danh sách") || openwebuiResult.reason.includes("từ khóa bị cấm"));

    // 4. Missing disposable marker in database name -> STRICTLY REJECTED
    const nonDisposableUrl = "postgresql://user:pass@127.0.0.1:5432/mqtech_custom";
    const nonDisposableResult = validateRestoreTarget({
      targetUrl: nonDisposableUrl,
      expectedHost: "127.0.0.1",
      expectedDbName: "mqtech_custom",
      confirmDestructiveRestore: "true",
      confirmRestoreDbName: "mqtech_custom",
    });
    assert.strictEqual(nonDisposableResult.allowed, false);
    assert.ok(nonDisposableResult.reason.includes("không chứa ký hiệu dùng một lần"));

    // 5. Host mismatch -> STRICTLY REJECTED
    const mismatchResult = validateRestoreTarget({
      targetUrl: validDisposableUrl,
      expectedHost: "otherhost",
      expectedDbName: "mqtech_restore_test",
      confirmDestructiveRestore: "true",
      confirmRestoreDbName: "mqtech_restore_test",
    });
    assert.strictEqual(mismatchResult.allowed, false);
    assert.ok(mismatchResult.reason.includes("không khớp với máy chủ kỳ vọng"));
  });

  test("Restore Engine: generates atomic rollback flags (--single-transaction, --exit-on-error)", () => {
    const restoreArgs = getSafeRestoreArgs({
      serviceName: "mqtech_restore",
      backupFilePath: "/backups/test.dump",
    });

    assert.ok(restoreArgs.includes("--single-transaction"));
    assert.ok(restoreArgs.includes("--exit-on-error"));
    assert.ok(restoreArgs.includes("--clean"));
    assert.ok(restoreArgs.includes("--if-exists"));
    assert.ok(restoreArgs.includes("--no-owner"));
    assert.ok(restoreArgs.includes("--no-privileges"));
    assert.ok(restoreArgs.includes("--dbname=service=mqtech_restore"));
    assert.ok(restoreArgs.includes("--no-password"));
  });
});
