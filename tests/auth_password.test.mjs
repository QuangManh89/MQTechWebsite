import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/lib/auth/password.ts";

describe("Administrator Password Security & Hashing", () => {
  test("should hash password with scrypt and generate salt", async () => {
    const raw = "SecureAdminPass2026!";
    const hash = await hashPassword(raw);

    assert.ok(hash.includes(":"), "Hash must contain salt:key delimiter");
    const [salt, key] = hash.split(":");
    assert.strictEqual(salt.length, 32, "Salt should be 16 bytes hex (32 chars)");
    assert.strictEqual(key.length, 128, "Key should be 64 bytes hex (128 chars)");
  });

  test("should generate unique salts for identical passwords", async () => {
    const raw = "SamePassword123!";
    const hash1 = await hashPassword(raw);
    const hash2 = await hashPassword(raw);

    assert.notStrictEqual(hash1, hash2, "Two hashes of the same password must differ due to unique salts");
  });

  test("should verify correct password successfully", async () => {
    const raw = "CorrectPassword123#";
    const hash = await hashPassword(raw);

    const isValid = await verifyPassword(raw, hash);
    assert.strictEqual(isValid, true);
  });

  test("should reject incorrect password", async () => {
    const raw = "CorrectPassword123#";
    const hash = await hashPassword(raw);

    const isValid = await verifyPassword("WrongPassword456!", hash);
    assert.strictEqual(isValid, false);
  });

  test("should reject passwords shorter than 8 characters", async () => {
    await assert.rejects(
      async () => {
        await hashPassword("short");
      },
      {
        message: "Password must be at least 8 characters long.",
      }
    );
  });
});
