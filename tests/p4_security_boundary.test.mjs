import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { validateServerEnv } from "../src/lib/env.ts";
import {
  createSessionToken,
  ADMIN_COOKIE_NAME,
} from "../src/lib/auth/session.ts";
import { serviceRequestRepo } from "../src/lib/db/repository.ts";
import { adminService } from "../src/lib/auth/admin-service.ts";
import { POST as handleIntakePost } from "../src/app/api/service-requests/route.ts";
import { PATCH as handleAdminPatch } from "../src/app/api/admin/requests/[id]/route.ts";
import { POST as handleAdminLogin } from "../src/app/api/admin/login/route.ts";

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
    serviceRequestRepo.clearDevStore();
    adminService.clearDevStore();
    delete process.env.DATABASE_URL;
    delete process.env.ADMIN_SESSION_SECRET;
    delete process.env.ALLOW_MEMORY_STORE;
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
    // 1. Seed initial request in AWAITING_CONFIRMATION
    const req = await serviceRequestRepo.create({
      customerName: "Trần Thị B",
      customerPhone: "0987654321",
      serviceMode: "IN_STORE",
      deviceCategory: "PC_DESKTOP",
      serviceCategoryId: "svc_desktop_laptop",
      issueDescription: "Cần cài lại hệ điều hành Windows bản quyền",
    });

    // 2. Technician 1 updates status to CONFIRMED
    const res1 = await serviceRequestRepo.updateStatus(
      req.id,
      "CONFIRMED",
      "tech1",
      "Đã gọi điện xác nhận lịch hẹn",
      "AWAITING_CONFIRMATION" // expected current status
    );
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res1.request?.status, "CONFIRMED");

    // 3. Technician 2 attempts concurrent transition assuming it was still AWAITING_CONFIRMATION
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

    // Verify status remained CONFIRMED
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

    // Authenticated admin session as 'actual_admin'
    const token = createSessionToken({
      username: "actual_admin",
      fullName: "Kỹ Thuật Viên Chính Thức",
      role: "ADMIN",
    });

    // Client attempts to spoof changedBy as 'fake_boss' inside body
    const patchReq = createMockReq(
      `http://localhost:3000/api/admin/requests/${req.id}`,
      "PATCH",
      {
        status: "CONFIRMED",
        changedBy: "fake_boss", // Malicious spoof attempt
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

    // Verify audit history recorded 'actual_admin', NEVER 'fake_boss'
    const history = await serviceRequestRepo.getStatusHistory(req.id);
    const transition = history.find((h) => h.toStatus === "CONFIRMED");
    assert.ok(transition, "Transition to CONFIRMED must exist in audit history");
    assert.strictEqual(transition.changedBy, "actual_admin");
    assert.notStrictEqual(transition.changedBy, "fake_boss");
  });

  test("Intake API POST /api/service-requests: fails immediately if server env is missing in production", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;

    try {
      const intakeReq = createMockReq(
        "http://localhost:3000/api/service-requests",
        "POST",
        {
          customerName: "Nguyễn Văn D",
          customerPhone: "0912999888",
          serviceMode: "IN_STORE",
          deviceCategory: "LAPTOP",
          serviceCategoryId: "svc_desktop_laptop",
          issueDescription: "Máy tính phát tiếng kêu lạ từ quạt tản nhiệt",
        }
      );

      const res = await handleIntakePost(intakeReq);
      assert.strictEqual(res.status, 500);
      const json = await res.json();
      assert.strictEqual(json.success, false);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test("Admin Login API POST /api/admin/login: fails immediately if server env is missing in production", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;

    try {
      const loginReq = createMockReq(
        "http://localhost:3000/api/admin/login",
        "POST",
        {
          username: "admin",
          password: "SomePassword123!",
        }
      );

      const res = await handleAdminLogin(loginReq);
      assert.strictEqual(res.status, 500);
      const json = await res.json();
      assert.strictEqual(json.success, false);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
