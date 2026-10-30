import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { getAppConfig } from "../src/lib/env.ts";
import {
  createSessionToken,
  getAdminSessionFromRequest,
  ADMIN_COOKIE_NAME,
} from "../src/lib/auth/session.ts";
import { adminService } from "../src/lib/auth/admin-service.ts";
import { guardApiRoute } from "../src/lib/security/request-guard.ts";
import {
  executeMigrationsOnConnection,
} from "../scripts/migrate.mjs";
import { GET as handleLiveness } from "../src/app/api/health/route.ts";
import { GET as handleReadiness } from "../src/app/api/ready/route.ts";
import { POST as handleLogout } from "../src/app/api/admin/logout/route.ts";

function createMockReq(url, method = "GET", body = null, headers = {}) {
  const serialized = body ? JSON.stringify(body) : null;
  const allHeaders = new Map();
  for (const [k, v] of Object.entries(headers)) {
    allHeaders.set(k.toLowerCase(), v);
  }
  if (body) {
    allHeaders.set("content-type", "application/json");
  }

  return {
    url,
    method,
    headers: {
      get(name) {
        return allHeaders.get(name.toLowerCase()) || null;
      },
    },
    json: async () => (serialized ? JSON.parse(serialized) : null),
  };
}

describe("P4.1 Final Security, Session Revocation & Origin Validation", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    adminService.clearDevStore();
    delete process.env.DATABASE_URL;
    delete process.env.ADMIN_SESSION_SECRET;
    delete process.env.MQTECH_PUBLIC_ORIGIN;
    delete process.env.ALLOW_MEMORY_STORE;
  });

  // =========================================================================
  // Task A: Complete Session Revocation & Token Version Verification
  // =========================================================================

  test("Session Token: includes tokenVersion and verifies matching version successfully", async () => {
    // 1. Initialize admin with tokenVersion = 1
    process.env.ADMIN_INIT_PASSWORD = "StrongPassword2026!";
    await adminService.ensureInitialAdmin();

    const user = await adminService.findByUsername("admin");
    assert.ok(user);
    assert.strictEqual(user?.tokenVersion, 1);

    // 2. Issue session token with matching version 1
    const token = createSessionToken(user, 2);
    const mockReq = createMockReq("http://localhost:3000/api/admin/me", "GET", null, {
      cookie: `${ADMIN_COOKIE_NAME}=${token}`,
    });

    const session = await getAdminSessionFromRequest(mockReq);
    assert.ok(session);
    assert.strictEqual(session?.username, "admin");
    assert.strictEqual(session?.tokenVersion, 1);
  });

  test("Session Revocation: rejects outdated token after password update", async () => {
    // 1. Initialize admin
    process.env.ADMIN_INIT_PASSWORD = "InitialPassword123!";
    await adminService.ensureInitialAdmin();

    const userBefore = await adminService.findByUsername("admin");
    const oldToken = createSessionToken(userBefore, 2);

    // 2. Administrator updates password -> increments tokenVersion to 2
    const updateRes = await adminService.updatePassword("admin", "NewSecurePassword456!");
    assert.strictEqual(updateRes.success, true);

    const userAfter = await adminService.findByUsername("admin");
    assert.strictEqual(userAfter?.tokenVersion, 2);

    // 3. Old token sent with request must be rejected (version mismatch)
    const mockReq = createMockReq("http://localhost:3000/api/admin/me", "GET", null, {
      cookie: `${ADMIN_COOKIE_NAME}=${oldToken}`,
    });

    const session = await getAdminSessionFromRequest(mockReq);
    assert.strictEqual(session, null, "Old token must be rejected after password change");
  });

  test("Account Disablement: disabled admin account immediately revokes all tokens", async () => {
    process.env.ADMIN_INIT_PASSWORD = "ActivePassword123!";
    await adminService.ensureInitialAdmin();

    const user = await adminService.findByUsername("admin");
    const token = createSessionToken(user, 2);

    // Disable account
    await adminService.setAccountActive("admin", false);

    const mockReq = createMockReq("http://localhost:3000/api/admin/me", "GET", null, {
      cookie: `${ADMIN_COOKIE_NAME}=${token}`,
    });

    const session = await getAdminSessionFromRequest(mockReq);
    assert.strictEqual(session, null, "Disabled account must not be granted access");
  });

  test("Logout Semantics: server-side session revocation increments token_version", async () => {
    process.env.ADMIN_INIT_PASSWORD = "LogoutTestPass123!";
    await adminService.ensureInitialAdmin();

    const user = await adminService.findByUsername("admin");
    assert.strictEqual(user?.tokenVersion, 1);

    const token = createSessionToken(user, 2);

    // Execute logout POST
    const logoutReq = createMockReq(
      "http://localhost:3000/api/admin/logout",
      "POST",
      {},
      {
        cookie: `${ADMIN_COOKIE_NAME}=${token}`,
        origin: "http://localhost:3000",
      }
    );

    const logoutRes = await handleLogout(logoutReq);
    assert.strictEqual(logoutRes.status, 200);

    // User's tokenVersion in repository was incremented
    const userAfterLogout = await adminService.findByUsername("admin");
    assert.strictEqual(userAfterLogout?.tokenVersion, 2);

    // Attacker attempting to reuse the old intercepted token is rejected
    const replayReq = createMockReq("http://localhost:3000/api/admin/me", "GET", null, {
      cookie: `${ADMIN_COOKIE_NAME}=${token}`,
    });
    const sessionAfterLogout = await getAdminSessionFromRequest(replayReq);
    assert.strictEqual(sessionAfterLogout, null, "Old token must be rejected server-side after logout");
  });

  test("Fail Closed: database failure during session verification returns null", async () => {
    const originalFind = adminService.findByUsername;
    adminService.findByUsername = async () => {
      throw new Error("Simulated database timeout or connection drop");
    };

    try {
      const token = createSessionToken({
        username: "admin",
        fullName: "Quản trị",
        role: "ADMIN",
        tokenVersion: 1,
      });

      const mockReq = createMockReq("http://localhost:3000/api/admin/me", "GET", null, {
        cookie: `${ADMIN_COOKIE_NAME}=${token}`,
      });

      const session = await getAdminSessionFromRequest(mockReq);
      assert.strictEqual(session, null, "Must fail closed on database error");
    } finally {
      adminService.findByUsername = originalFind;
    }
  });

  // =========================================================================
  // Task B: Harden CSRF and Trusted Origin Validation
  // =========================================================================

  test("Origin Guard: accepts trusted production origin matching MQTECH_PUBLIC_ORIGIN", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://mqtech:secret@localhost:5432/mqtech_db";
    process.env.ADMIN_SESSION_SECRET = "super-secret-key-that-is-at-least-32-chars-long";
    process.env.MQTECH_PUBLIC_ORIGIN = "https://mqcomputech.com";

    try {
      const validReq = createMockReq(
        "https://mqcomputech.com/api/service-requests",
        "POST",
        { dummy: true },
        { origin: "https://mqcomputech.com" }
      );

      const guardRes = guardApiRoute(validReq, { checkOrigin: true });
      assert.strictEqual(guardRes.allowed, true);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test("Origin Guard: rejects unexpected or malicious origin in production", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://mqtech:secret@localhost:5432/mqtech_db";
    process.env.ADMIN_SESSION_SECRET = "super-secret-key-that-is-at-least-32-chars-long";
    process.env.MQTECH_PUBLIC_ORIGIN = "https://mqcomputech.com";

    try {
      const maliciousReq = createMockReq(
        "https://mqcomputech.com/api/service-requests",
        "POST",
        { dummy: true },
        { origin: "https://attacker-phishing-domain.com" }
      );

      const guardRes = guardApiRoute(maliciousReq, { checkOrigin: true });
      assert.strictEqual(guardRes.allowed, false);
      assert.strictEqual(guardRes.response?.status, 403);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test("Origin Guard: rejects Origin: null explicitly", () => {
    const req = createMockReq(
      "http://localhost:3000/api/service-requests",
      "POST",
      { dummy: true },
      { origin: "null" }
    );

    const guardRes = guardApiRoute(req, { checkOrigin: true });
    assert.strictEqual(guardRes.allowed, false);
    assert.strictEqual(guardRes.response?.status, 403);
  });

  test("Origin Guard: enforces fail-closed behavior on missing Origin for unsafe methods in production", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://mqtech:secret@localhost:5432/mqtech_db";
    process.env.ADMIN_SESSION_SECRET = "super-secret-key-that-is-at-least-32-chars-long";
    process.env.MQTECH_PUBLIC_ORIGIN = "https://mqcomputech.com";

    try {
      // POST with no Origin and no Referer header
      const noOriginReq = createMockReq(
        "https://mqcomputech.com/api/service-requests",
        "POST",
        { dummy: true },
        {}
      );

      const guardRes = guardApiRoute(noOriginReq, { checkOrigin: true });
      assert.strictEqual(guardRes.allowed, false);
      assert.strictEqual(guardRes.response?.status, 403);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test("Origin Guard: allows valid Referer fallback when Origin header is absent", () => {
    const req = createMockReq(
      "http://localhost:3000/api/service-requests",
      "POST",
      { dummy: true },
      { referer: "http://localhost:3000/dich-vu" }
    );

    const guardRes = guardApiRoute(req, { checkOrigin: true });
    assert.strictEqual(guardRes.allowed, true);
  });

  test("Origin Guard: permits safe GET requests without requiring Origin header", () => {
    const getReq = createMockReq("http://localhost:3000/api/admin/requests", "GET");
    const guardRes = guardApiRoute(getReq, { checkOrigin: true });
    assert.strictEqual(guardRes.allowed, true);
  });

  // =========================================================================
  // Task C: Strict Environment Allowlist
  // =========================================================================

  test("Environment Allowlist: forbids in-memory storage in staging or unknown environments", () => {
    const originalEnv = process.env.NODE_ENV;

    try {
      // 1. Staging environment
      process.env.NODE_ENV = "staging";
      const configStaging = getAppConfig();
      assert.strictEqual(configStaging.allowMemoryStore, false);

      // 2. Unknown environment
      process.env.NODE_ENV = "qa";
      const configUnknown = getAppConfig();
      assert.strictEqual(configUnknown.allowMemoryStore, false);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  // =========================================================================
  // Task D: Migration Runner Checksum Verification & Idempotency
  // =========================================================================

  test("Migration Runner: detects tampering of previously applied migration files", async () => {
    const mockClient = {
      queries: [],
      async query(sql, params = []) {
        this.queries.push({ sql, params });
        if (sql.includes("SELECT version, checksum FROM schema_migrations")) {
          // Return previously recorded migration with different checksum
          return [{ version: "001", checksum: "00000000000000000000000000000000" }];
        }
        return [];
      },
    };

    await assert.rejects(
      () => executeMigrationsOnConnection(mockClient),
      /MIGRATION TAMPERING DETECTED/
    );
  });

  test("Migration Runner: single connection rolls back and releases advisory lock on SQL failure", async () => {
    const mockClient = {
      queries: [],
      async query(sql, params = []) {
        this.queries.push({ sql, params });
        if (sql.includes("SELECT version, checksum FROM schema_migrations")) {
          return []; // No migrations applied yet
        }
        if (sql.includes("CREATE TABLE IF NOT EXISTS service_categories")) {
          throw new Error("Syntax error or connection broken in migration SQL");
        }
        return [];
      },
    };

    await assert.rejects(
      () => executeMigrationsOnConnection(mockClient),
      /Migration failed and was rolled back/
    );

    // Verify advisory lock was acquired and subsequently released on the same connection
    const sqls = mockClient.queries.map((q) => q.sql);
    assert.ok(sqls.some((s) => s.includes("pg_advisory_lock")));
    assert.ok(sqls.some((s) => s.includes("ROLLBACK;")));
    assert.ok(sqls.some((s) => s.includes("pg_advisory_unlock")));
  });

  // =========================================================================
  // Task F: Docker Liveness vs Readiness Healthcheck
  // =========================================================================

  test("Healthcheck Endpoints: Liveness vs Readiness separation", async () => {
    // 1. Liveness (/api/health) returns 200 regardless of database
    const liveRes = await handleLiveness();
    assert.strictEqual(liveRes.status, 200);
    const liveJson = await liveRes.json();
    assert.strictEqual(liveJson.status, "ok");

    // 2. Readiness (/api/ready) in production without database returns 503
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;

    try {
      const readyRes = await handleReadiness();
      assert.strictEqual(readyRes.status, 503);
      const readyJson = await readyRes.json();
      assert.strictEqual(readyJson.status, "unready");
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
