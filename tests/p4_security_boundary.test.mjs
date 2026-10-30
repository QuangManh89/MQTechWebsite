import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { validateServerEnv, getAppConfig } from "../src/lib/env.ts";
import {
  createSessionToken,
  ADMIN_COOKIE_NAME,
} from "../src/lib/auth/session.ts";
import { serviceRequestRepo } from "../src/lib/db/repository.ts";
import { adminService } from "../src/lib/auth/admin-service.ts";
import { guardApiRoute } from "../src/lib/security/request-guard.ts";
import { validateBootstrapTarget } from "../scripts/bootstrap-admin.mjs";
import { validateMigrationTarget, computeChecksum } from "../scripts/migrate.mjs";
import { POST as handleIntakePost } from "../src/app/api/service-requests/route.ts";
import {
  GET as handleAdminDetail,
  PATCH as handleAdminPatch,
} from "../src/app/api/admin/requests/[id]/route.ts";
import { POST as handleAdminLogin } from "../src/app/api/admin/login/route.ts";
import { GET as handleAdminMe } from "../src/app/api/admin/me/route.ts";
import { GET as handleAdminRequests } from "../src/app/api/admin/requests/route.ts";
import { GET as handleAdminStats } from "../src/app/api/admin/stats/route.ts";

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

describe("P4 Production Security Boundary & Failure Behavior Verification", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    serviceRequestRepo.clearDevStore();
    adminService.clearDevStore();
    delete process.env.DATABASE_URL;
    delete process.env.ADMIN_SESSION_SECRET;
    delete process.env.ALLOW_MEMORY_STORE;
  });

  // --- Fix A: Unconditional Prohibition of Memory Store in Production ---

  test("validateServerEnv: should strictly reject ALLOW_MEMORY_STORE=true in production", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    process.env.ALLOW_MEMORY_STORE = "true";
    process.env.DATABASE_URL = "postgresql://mqtech:secret@localhost:5432/mqtech_db";
    process.env.ADMIN_SESSION_SECRET = "super-secret-key-that-is-at-least-32-chars-long";

    try {
      assert.throws(
        () => validateServerEnv(),
        /ALLOW_MEMORY_STORE=true is strictly forbidden in production/
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test("validateServerEnv: should throw in production if DATABASE_URL is missing", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    process.env.ADMIN_SESSION_SECRET = "super-secret-key-that-is-at-least-32-chars-long";

    try {
      assert.throws(
        () => validateServerEnv(),
        /Critical server environment configuration missing in production: DATABASE_URL/
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test("validateServerEnv: should throw in production if DATABASE_URL is not a valid postgres URI", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "mysql://user:pass@localhost:3306/db";
    process.env.ADMIN_SESSION_SECRET = "super-secret-key-that-is-at-least-32-chars-long";

    try {
      assert.throws(
        () => validateServerEnv(),
        /DATABASE_URL must be a valid PostgreSQL connection URI/
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test("validateServerEnv: should throw in production if ADMIN_SESSION_SECRET is too short (< 32 chars)", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://mqtech:secret@localhost:5432/mqtech_db";
    process.env.ADMIN_SESSION_SECRET = "too-short-secret";

    try {
      assert.throws(
        () => validateServerEnv(),
        /ADMIN_SESSION_SECRET must be at least 32 characters long in production/
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test("getAppConfig: test environment can still use isolated memory storage", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "test";

    try {
      const config = getAppConfig();
      assert.strictEqual(config.allowMemoryStore, true);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test("createSessionToken: should reject default fallback secret in production", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    delete process.env.ADMIN_SESSION_SECRET;

    try {
      assert.throws(
        () =>
          createSessionToken({
            username: "admin",
            fullName: "Quản Trị",
            role: "ADMIN",
          }),
        /ADMIN_SESSION_SECRET must be configured with at least 32 characters in production/
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test("serviceRequestRepo: should throw error instead of falling back to memory when allowMemoryStore is false", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    delete process.env.ALLOW_MEMORY_STORE;
    delete process.env.DATABASE_URL;

    try {
      await assert.rejects(
        () =>
          serviceRequestRepo.create({
            customerName: "Nguyễn Văn A",
            customerPhone: "0912345678",
            serviceMode: "IN_STORE",
            deviceCategory: "LAPTOP",
            serviceCategoryId: "svc_desktop_laptop",
            issueDescription: "Máy tính không khởi động được nguồn",
          }),
        /Yêu cầu cấu hình cơ sở dữ liệu PostgreSQL trong môi trường sản xuất/
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test("updateStatus: should detect and reject concurrent status transitions using optimistic lock", async () => {
    const req = await serviceRequestRepo.create({
      customerName: "Trần Thị B",
      customerPhone: "0987654321",
      serviceMode: "IN_STORE",
      deviceCategory: "PC_DESKTOP",
      serviceCategoryId: "svc_desktop_laptop",
      issueDescription: "Cần cài lại hệ điều hành Windows bản quyền",
    });

    const res1 = await serviceRequestRepo.updateStatus(
      req.id,
      "CONFIRMED",
      "tech1",
      "Đã gọi điện xác nhận lịch hẹn",
      "AWAITING_CONFIRMATION"
    );
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res1.request?.status, "CONFIRMED");

    const res2 = await serviceRequestRepo.updateStatus(
      req.id,
      "CANCELLED",
      "tech2",
      "Khách gọi báo hủy",
      "AWAITING_CONFIRMATION" // Stale expectation!
    );
    assert.strictEqual(res2.success, false);
    assert.match(
      res2.error,
      /Yêu cầu đã được cập nhật bởi một phiên làm việc khác/
    );

    const current = await serviceRequestRepo.findById(req.id);
    assert.strictEqual(current?.status, "CONFIRMED");
  });

  test("API PATCH /api/admin/requests/[id]: prevents spoofing changedBy and enforces session identity", async () => {
    const req = await serviceRequestRepo.create({
      customerName: "Lê Văn C",
      customerPhone: "0901234567",
      serviceMode: "IN_STORE",
      deviceCategory: "LAPTOP",
      serviceCategoryId: "svc_desktop_laptop",
      issueDescription: "Vệ sinh tra keo tản nhiệt máy tính định kỳ",
    });

    const token = createSessionToken({
      username: "actual_admin",
      fullName: "Kỹ Thuật Viên Chính Thức",
      role: "ADMIN",
    });

    const patchReq = createMockReq(
      `http://localhost:3000/api/admin/requests/${req.id}`,
      "PATCH",
      {
        status: "CONFIRMED",
        changedBy: "fake_boss",
        note: "Xác nhận lịch",
      },
      {
        cookie: `${ADMIN_COOKIE_NAME}=${token}`,
      }
    );

    const res = await handleAdminPatch(patchReq, {
      params: Promise.resolve({ id: req.id }),
    });
    assert.strictEqual(res.status, 200);

    const history = await serviceRequestRepo.getStatusHistory(req.id);
    const transition = history.find((h) => h.toStatus === "CONFIRMED");
    assert.ok(transition, "Transition to CONFIRMED must exist in audit history");
    assert.strictEqual(transition.changedBy, "actual_admin");
    assert.notStrictEqual(transition.changedBy, "fake_boss");
  });

  // --- Fix B: Centralized Environment Validation Across All Routes ---

  test("All administrative and public API routes fail safely on missing production environment", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;

    try {
      // 1. Intake POST
      const resIntake = await handleIntakePost(
        createMockReq("http://localhost:3000/api/service-requests", "POST", { customerName: "A" })
      );
      assert.strictEqual(resIntake.status, 500);

      // 2. Admin Login POST
      const resLogin = await handleAdminLogin(
        createMockReq("http://localhost:3000/api/admin/login", "POST", { username: "admin" })
      );
      assert.strictEqual(resLogin.status, 500);

      // 3. Admin Me GET
      const resMe = await handleAdminMe(
        createMockReq("http://localhost:3000/api/admin/me", "GET")
      );
      assert.strictEqual(resMe.status, 500);

      // 4. Admin Requests GET
      const resRequests = await handleAdminRequests(
        createMockReq("http://localhost:3000/api/admin/requests", "GET")
      );
      assert.strictEqual(resRequests.status, 500);

      // 5. Admin Stats GET
      const resStats = await handleAdminStats(
        createMockReq("http://localhost:3000/api/admin/stats", "GET")
      );
      assert.strictEqual(resStats.status, 500);

      // 6. Admin Detail GET
      const resDetail = await handleAdminDetail(
        createMockReq("http://localhost:3000/api/admin/requests/any-id", "GET"),
        { params: Promise.resolve({ id: "any-id" }) }
      );
      assert.strictEqual(resDetail.status, 500);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  // --- Fix C: Bootstrap Target Validation ---

  test("validateBootstrapTarget: rejects remote cloud hosts and production-like database names", () => {
    // 1. Reject remote cloud host
    const resRemote = validateBootstrapTarget(
      "postgresql://user:pass@fly.dev:5432/mqtech_dev",
      false,
      false
    );
    assert.strictEqual(resRemote.allowed, false);
    assert.match(resRemote.reason, /Phát hiện mục tiêu cơ sở dữ liệu có dấu hiệu môi trường thật/);

    // 2. Reject production database name
    const resProdName = validateBootstrapTarget(
      "postgresql://user:pass@localhost:5432/mqtech_production",
      false,
      false
    );
    assert.strictEqual(resProdName.allowed, false);
    assert.match(resProdName.reason, /Phát hiện mục tiêu cơ sở dữ liệu có dấu hiệu môi trường thật/);

    // 3. Reject --dev overriding unsafe host
    const resOverride = validateBootstrapTarget(
      "postgresql://user:pass@192.168.1.100:5432/mqtech_live",
      true, // --dev flag passed
      false
    );
    assert.strictEqual(resOverride.allowed, false);

    // 4. Accept verified local development database
    const resLocal = validateBootstrapTarget(
      "postgresql://user:pass@localhost:5432/mqtech_dev",
      false,
      false
    );
    assert.strictEqual(resLocal.allowed, true);
    assert.strictEqual(resLocal.details?.host, "localhost:5432");
    assert.strictEqual(resLocal.details?.dbName, "mqtech_dev");

    // 5. Reject missing DATABASE_URL if --dev is not passed
    const resNoDev = validateBootstrapTarget(undefined, false, false);
    assert.strictEqual(resNoDev.allowed, false);
    assert.match(resNoDev.reason, /bắt buộc phải truyền cờ '--dev'/);

    // 6. Accept in-memory store only when --dev is passed in non-production
    const resWithDev = validateBootstrapTarget(undefined, true, false);
    assert.strictEqual(resWithDev.allowed, true);
  });

  // --- Fix D: CSRF / Origin Protection Strategy ---

  test("guardApiRoute: strictly blocks cross-origin and cross-site state-changing requests", () => {
    // 1. Sec-Fetch-Site: cross-site -> 403 Forbidden
    const crossSiteReq = createMockReq(
      "http://localhost:3000/api/admin/requests/test-id",
      "PATCH",
      { status: "CONFIRMED" },
      { "sec-fetch-site": "cross-site" }
    );
    const guardCrossSite = guardApiRoute(crossSiteReq, { checkOrigin: true });
    assert.strictEqual(guardCrossSite.allowed, false);
    assert.strictEqual(guardCrossSite.response?.status, 403);

    // 2. Origin mismatch (evil.com attacking localhost:3000) -> 403 Forbidden
    const mismatchReq = createMockReq(
      "http://localhost:3000/api/admin/requests/test-id",
      "PATCH",
      { status: "CONFIRMED" },
      { origin: "https://evil-phishing-site.com" }
    );
    const guardMismatch = guardApiRoute(mismatchReq, { checkOrigin: true });
    assert.strictEqual(guardMismatch.allowed, false);
    assert.strictEqual(guardMismatch.response?.status, 403);

    // 3. Same-origin request -> Allowed
    const sameOriginReq = createMockReq(
      "http://localhost:3000/api/admin/requests/test-id",
      "PATCH",
      { status: "CONFIRMED" },
      { origin: "http://localhost:3000" }
    );
    const guardSameOrigin = guardApiRoute(sameOriginReq, { checkOrigin: true });
    assert.strictEqual(guardSameOrigin.allowed, true);
  });

  // --- Task 8: Migration Runner Checksum & Target Safety ---

  test("Migration Runner: verifies deterministic SHA256 checksums and target safety", () => {
    const checksum1 = computeChecksum("CREATE TABLE test (id INT);");
    const checksum2 = computeChecksum("CREATE TABLE test (id INT);");
    assert.strictEqual(checksum1, checksum2);

    // Target validation for migration runner
    const targetDryRun = validateMigrationTarget(undefined, true);
    assert.strictEqual(targetDryRun.allowed, true);

    const targetCloudRejected = validateMigrationTarget(
      "postgresql://user:pass@fly.dev:5432/mqtech_production",
      false
    );
    assert.strictEqual(targetCloudRejected.allowed, false);
  });
});
