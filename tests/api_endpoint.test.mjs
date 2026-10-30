import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { POST } from "../src/app/api/service-requests/route.ts";
import { serviceRequestRepo } from "../src/lib/db/repository.ts";
import { intakeRateLimiter } from "../src/lib/utils/rate-limiter.ts";

function createMockRequest(body, headers = {}) {
  const serialized = JSON.stringify(body);
  return {
    headers: {
      get(name) {
        const lower = name.toLowerCase();
        if (lower === "x-forwarded-for") return headers["x-forwarded-for"] || "127.0.0.1";
        if (lower === "content-length") return String(Buffer.byteLength(serialized));
        return headers[name] || null;
      },
    },
    json: async () => body,
  };
}

describe("POST /api/service-requests API Endpoint Verification", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    serviceRequestRepo.clearDevStore();
    intakeRateLimiter.reset();
  });

  test("should successfully accept valid request and return 201 with referenceCode", async () => {
    const payload = {
      customerName: "Phạm Văn Minh",
      customerPhone: "0935123456",
      serviceMode: "IN_STORE",
      deviceCategory: "LAPTOP",
      serviceCategoryId: "svc_desktop_laptop",
      issueDescription: "Laptop bật nguồn kêu tít tít liên tục không lên màn hình",
    };

    const req = createMockRequest(payload, { "x-forwarded-for": "10.10.10.1" });
    const response = await POST(req);

    assert.strictEqual(response.status, 201);
    const data = await response.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.referenceCode.startsWith("MQT-"));
    assert.strictEqual(data.data.status, "AWAITING_CONFIRMATION");
    assert.strictEqual(data.data.statusLabel, "Chờ xác nhận");
    assert.strictEqual(data.data.customerName, "Phạm Văn Minh");
  });

  test("should return 400 when validation fails", async () => {
    const invalidPayload = {
      customerName: "",
      customerPhone: "invalid_phone",
      serviceMode: "IN_STORE",
      deviceCategory: "LAPTOP",
      serviceCategoryId: "svc_desktop_laptop",
      issueDescription: "ngắn",
    };

    const req = createMockRequest(invalidPayload, { "x-forwarded-for": "10.10.10.2" });
    const response = await POST(req);

    assert.strictEqual(response.status, 400);
    const data = await response.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.errors.customerName);
    assert.ok(data.errors.customerPhone);
    assert.ok(data.errors.issueDescription);
  });

  test("should return 400 with security alert when computer passwords are submitted", async () => {
    const maliciousPayload = {
      customerName: "Test User",
      customerPhone: "0912345678",
      serviceMode: "IN_STORE",
      deviceCategory: "LAPTOP",
      serviceCategoryId: "svc_desktop_laptop",
      issueDescription: "Laptop cần cài lại hệ điều hành Windows",
      windowsPassword: "plaintext_secret_password",
    };

    const req = createMockRequest(maliciousPayload, { "x-forwarded-for": "10.10.10.3" });
    const response = await POST(req);

    assert.strictEqual(response.status, 400);
    const data = await response.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.errors.security, "Security warning must be returned");
  });

  test("should enforce rate limiting and return 429 when threshold exceeded", async () => {
    const clientIp = "192.168.99.1";
    const payload = {
      customerName: "Khách Hàng Test",
      customerPhone: "0912345678",
      serviceMode: "IN_STORE",
      deviceCategory: "LAPTOP",
      serviceCategoryId: "svc_desktop_laptop",
      issueDescription: "Máy laptop bị lỗi màn hình xanh dump liên tục",
    };

    for (let i = 0; i < 5; i++) {
      const req = createMockRequest(payload, { "x-forwarded-for": clientIp });
      const res = await POST(req);
      assert.strictEqual(res.status, 201);
    }

    // 6th call from same IP must be rate-limited
    const req6 = createMockRequest(payload, { "x-forwarded-for": clientIp });
    const res6 = await POST(req6);
    assert.strictEqual(res6.status, 429);
    const data6 = await res6.json();
    assert.strictEqual(data6.code, "RATE_LIMITED");
  });
});
