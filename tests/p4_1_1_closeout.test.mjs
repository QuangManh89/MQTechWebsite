import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { getAppConfig, validateServerEnv } from "../src/lib/env.ts";
import { adminService } from "../src/lib/auth/admin-service.ts";
import {
  createSessionToken,
  getAdminSessionFromRequest,
  ADMIN_COOKIE_NAME,
} from "../src/lib/auth/session.ts";
import { guardApiRoute } from "../src/lib/security/request-guard.ts";
import { GET as handleHealthGet } from "../src/app/api/health/route.ts";
import { GET as handleAdminRequestsGet } from "../src/app/api/admin/requests/route.ts";
import { serviceRequestRepo } from "../src/lib/db/repository.ts";

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

describe("P4.1.1 Closeout: Role Revocation, CSRF Safe Methods & Environment Allowlist", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    adminService.clearDevStore();
    serviceRequestRepo.clearDevStore();
    delete process.env.DATABASE_URL;
    delete process.env.ADMIN_SESSION_SECRET;
    delete process.env.MQTECH_PUBLIC_ORIGIN;
    delete process.env.ALLOW_MEMORY_STORE;
    delete process.env.ADMIN_INIT_USERNAME;
    delete process.env.ADMIN_INIT_PASSWORD;
  });

  // =========================================================================
  // Task A: Role Revocation & Authoritative Database Role Enforcement
  // =========================================================================

  test("Role Revocation: changing user role invalidates existing session tokens across all devices", async () => {
    process.env.ADMIN_INIT_PASSWORD = "StrongPassword2026!";
    await adminService.ensureInitialAdmin();

    const initialUser = await adminService.findByUsername("admin");
    assert.ok(initialUser);
    assert.strictEqual(initialUser?.role, "ADMIN");
    assert.strictEqual(initialUser?.tokenVersion, 1);

    // 1. Issue token for ADMIN
    const adminToken = createSessionToken(initialUser, 2);

    // 2. Change role from ADMIN to STAFF -> must increment tokenVersion
    const updateResult = await adminService.updateRole("admin", "STAFF");
    assert.strictEqual(updateResult, true);

    const updatedUser = await adminService.findByUsername("admin");
    assert.strictEqual(updatedUser?.role, "STAFF");
    assert.strictEqual(updatedUser?.tokenVersion, 2, "Token version must increment on role update");

    // 3. Old token with tokenVersion 1 must be rejected
    const mockReq = createMockReq("http://localhost:3000/api/admin/me", "GET", null, {
      cookie: `${ADMIN_COOKIE_NAME}=${adminToken}`,
    });

    const session = await getAdminSessionFromRequest(mockReq);
    assert.strictEqual(session, null, "Old session token must be revoked when role is modified");

    // 4. Fresh token issued with updated role must carry current role
    const freshToken = createSessionToken(updatedUser, 2);
    const freshReq = createMockReq("http://localhost:3000/api/admin/me", "GET", null, {
      cookie: `${ADMIN_COOKIE_NAME}=${freshToken}`,
    });

    const activeSession = await getAdminSessionFromRequest(freshReq);
    assert.ok(activeSession);
    assert.strictEqual(activeSession?.role, "STAFF", "Session must reflect current authoritative role");
    assert.strictEqual(activeSession?.tokenVersion, 2);
  });

  // =========================================================================
  // Task B: Complete CSRF Safe-Method Allowlist Coverage
  // =========================================================================

  test("CSRF Allowlist: GET, HEAD, OPTIONS are safe; PUT, DELETE, POST, and CUSTOM require valid origin", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://mqtech:secret@localhost:5432/mqtech_db";
    process.env.ADMIN_SESSION_SECRET = "super-secret-key-that-is-at-least-32-chars-long";
    process.env.MQTECH_PUBLIC_ORIGIN = "https://mqcomputech.com";

    try {
      // Safe methods: allowed even without Origin header
      for (const safeMethod of ["GET", "HEAD", "OPTIONS"]) {
        const safeReq = createMockReq("https://mqcomputech.com/api/service-requests", safeMethod);
        const guardSafe = guardApiRoute(safeReq);
        assert.strictEqual(guardSafe.allowed, true, `${safeMethod} must be permitted without origin check`);
      }

      // Unsafe methods: rejected without Origin header
      for (const unsafeMethod of ["POST", "PATCH", "PUT", "DELETE", "CUSTOM_MUTATE"]) {
        const unsafeReq = createMockReq(
          "https://mqcomputech.com/api/service-requests",
          unsafeMethod,
          { test: true }
        );
        const guardUnsafe = guardApiRoute(unsafeReq);
        assert.strictEqual(
          guardUnsafe.allowed,
          false,
          `${unsafeMethod} must be rejected when origin header is missing in production`
        );
        assert.strictEqual(guardUnsafe.response?.status, 403);
      }

      // Unsafe methods: allowed when exact origin matches
      for (const unsafeMethod of ["POST", "PATCH", "PUT", "DELETE"]) {
        const validReq = createMockReq(
          "https://mqcomputech.com/api/service-requests",
          unsafeMethod,
          { test: true },
          { origin: "https://mqcomputech.com" }
        );
        const guardValid = guardApiRoute(validReq);
        assert.strictEqual(
          guardValid.allowed,
          true,
          `${unsafeMethod} must be allowed with matching trusted origin`
        );
      }

      // Exact scheme check: http rejected when trusted origin is https
      const httpMismatchReq = createMockReq(
        "https://mqcomputech.com/api/service-requests",
        "POST",
        { test: true },
        { origin: "http://mqcomputech.com" }
      );
      const guardHttpMismatch = guardApiRoute(httpMismatchReq);
      assert.strictEqual(guardHttpMismatch.allowed, false, "Insecure HTTP origin must be rejected");
      assert.strictEqual(guardHttpMismatch.response?.status, 403);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  // =========================================================================
  // Task C: Explicit Development Memory Configuration
  // =========================================================================

  test("Environment Allowlist: missing DATABASE_URL in development requires explicit ALLOW_MEMORY_STORE=true", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    delete process.env.DATABASE_URL;
    delete process.env.ALLOW_MEMORY_STORE;

    try {
      // 1. Without ALLOW_MEMORY_STORE=true, allowMemoryStore must be false
      const configNoFlag = getAppConfig();
      assert.strictEqual(
        configNoFlag.allowMemoryStore,
        false,
        "Memory store must not be implicitly enabled in development without explicit flag"
      );

      // validateServerEnv must throw to warn developer
      assert.throws(
        () => validateServerEnv(),
        /In development, either DATABASE_URL must be configured or ALLOW_MEMORY_STORE=true must be explicitly set/
      );

      // 2. With explicit ALLOW_MEMORY_STORE=true, allowMemoryStore is enabled
      process.env.ALLOW_MEMORY_STORE = "true";
      const configWithFlag = getAppConfig();
      assert.strictEqual(configWithFlag.allowMemoryStore, true);
      assert.doesNotThrow(() => validateServerEnv());
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test("Environment Allowlist: forbids ALLOW_MEMORY_STORE in production, staging, and unknown", () => {
    const originalEnv = process.env.NODE_ENV;

    for (const envName of ["production", "staging", "unknown", "qa"]) {
      process.env.NODE_ENV = envName;
      process.env.ALLOW_MEMORY_STORE = "true";

      try {
        const config = getAppConfig();
        assert.strictEqual(config.allowMemoryStore, false, `allowMemoryStore must be false in ${envName}`);
        assert.throws(
          () => validateServerEnv(),
          /CRITICAL SECURITY VIOLATION: ALLOW_MEMORY_STORE=true is strictly forbidden/
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    }
  });

  // =========================================================================
  // Safe Handlers Non-Mutation Check
  // =========================================================================

  test("Safe Handlers: GET endpoints do not mutate persistent store or state", async () => {
    // 1. Health GET does not alter state
    const healthRes = await handleHealthGet();
    assert.strictEqual(healthRes.status, 200);

    // 2. Seed a request in repo
    const req = await serviceRequestRepo.create({
      customerName: "Nguyễn Văn B",
      customerPhone: "0918123456",
      serviceMode: "IN_STORE",
      deviceCategory: "LAPTOP",
      serviceCategoryId: "svc_desktop_laptop",
      issueDescription: "Máy tính không nhận sạc pin",
    });

    const countBefore = serviceRequestRepo.devStoreCount;

    // 3. Admin list requests GET does not mutate store
    process.env.ADMIN_INIT_PASSWORD = "StrongPassword2026!";
    await adminService.ensureInitialAdmin();
    const adminUser = await adminService.findByUsername("admin");
    const token = createSessionToken(adminUser, 2);

    const listReq = createMockReq("http://localhost:3000/api/admin/requests", "GET", null, {
      cookie: `${ADMIN_COOKIE_NAME}=${token}`,
    });

    const listRes = await handleAdminRequestsGet(listReq);
    assert.strictEqual(listRes.status, 200);

    const countAfter = serviceRequestRepo.devStoreCount;
    assert.strictEqual(countBefore, countAfter, "GET request must never mutate repository count");

    const unmodified = await serviceRequestRepo.findById(req.id);
    assert.strictEqual(unmodified?.status, "AWAITING_CONFIRMATION", "Status must remain unchanged");
  });
});
