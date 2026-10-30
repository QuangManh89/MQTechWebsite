import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  createSessionToken,
  verifySessionToken,
  getAdminSessionFromRequest,
  ADMIN_COOKIE_NAME,
} from "../src/lib/auth/session.ts";
import { adminService } from "../src/lib/auth/admin-service.ts";

describe("Administrator Session Token & Cookie Security", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    adminService.clearDevStore();
  });

  const mockUser = {
    username: "admin_test",
    fullName: "Quản Trị Viên Test",
    role: "ADMIN",
    tokenVersion: 1,
  };

  test("should create and verify valid session token", () => {
    const token = createSessionToken(mockUser, 2);
    assert.ok(token.includes("."), "Token must contain payload.signature");

    const session = verifySessionToken(token);
    assert.ok(session, "Session must decode successfully");
    assert.strictEqual(session?.username, "admin_test");
    assert.strictEqual(session?.role, "ADMIN");
    assert.ok(session?.expiresAt > Date.now());
  });

  test("should reject tampered token signature", () => {
    const token = createSessionToken(mockUser, 2);
    const [payload, sig] = token.split(".");
    // Tamper with signature
    const tamperedSig = sig.slice(0, -2) + "xx";
    const tamperedToken = `${payload}.${tamperedSig}`;

    const session = verifySessionToken(tamperedToken);
    assert.strictEqual(session, null, "Tampered token must be rejected");
  });

  test("should reject tampered payload", () => {
    const token = createSessionToken(mockUser, 2);
    const [, sig] = token.split(".");
    // Tamper with payload
    const forgedPayload = Buffer.from(
      JSON.stringify({ username: "hacker", role: "ADMIN", expiresAt: Date.now() + 100000 })
    ).toString("base64url");
    const tamperedToken = `${forgedPayload}.${sig}`;

    const session = verifySessionToken(tamperedToken);
    assert.strictEqual(session, null, "Forged payload with original signature must be rejected");
  });

  test("should reject expired session token", () => {
    // Create token expired in the past (-1 hour)
    const token = createSessionToken(mockUser, -1);
    const session = verifySessionToken(token);
    assert.strictEqual(session, null, "Expired token must be rejected");
  });

  test("should extract session from Request Cookie header", async () => {
    process.env.ADMIN_INIT_PASSWORD = "TestPassword123!";
    await adminService.ensureInitialAdmin();
    const user = await adminService.findByUsername("admin");
    assert.ok(user);
    const token = createSessionToken(user, 1);
    const req = new Request("http://localhost:3000/api/admin/me", {
      headers: {
        cookie: `other_cookie=123; ${ADMIN_COOKIE_NAME}=${token}; test=abc`,
      },
    });

    const session = await getAdminSessionFromRequest(req);
    assert.ok(session);
    assert.strictEqual(session?.username, "admin");
  });

  test("should return null if session cookie is absent", async () => {
    const req = new Request("http://localhost:3000/api/admin/me", {
      headers: {
        cookie: "other_cookie=123",
      },
    });

    const session = await getAdminSessionFromRequest(req);
    assert.strictEqual(session, null);
  });
});
