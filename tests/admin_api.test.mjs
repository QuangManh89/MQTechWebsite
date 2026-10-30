import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { POST as loginRoute } from "../src/app/api/admin/login/route.ts";
import { POST as logoutRoute } from "../src/app/api/admin/logout/route.ts";
import { GET as meRoute } from "../src/app/api/admin/me/route.ts";
import { GET as listRequestsRoute } from "../src/app/api/admin/requests/route.ts";
import {
  GET as getRequestRoute,
  PATCH as updateStatusRoute,
} from "../src/app/api/admin/requests/[id]/route.ts";
import { GET as getStatsRoute } from "../src/app/api/admin/stats/route.ts";
import { serviceRequestRepo } from "../src/lib/db/repository.ts";
import { adminService, adminLoginLimiter } from "../src/lib/auth/admin-service.ts";
import { createSessionToken, ADMIN_COOKIE_NAME } from "../src/lib/auth/session.ts";

function createMockReq(url, method = "GET", body = null, headers = {}) {
  const serialized = body ? JSON.stringify(body) : null;
  const allHeaders = new Map(Object.entries(headers));
  if (serialized) {
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

describe("Administrative API Security & Management Verification", () => {
  const adminUser = {
    username: "admin",
    fullName: "Quản Trị Viên MQTech",
    role: "ADMIN",
  };
  const validAdminToken = createSessionToken(adminUser, 4);
  const authHeaders = {
    cookie: `${ADMIN_COOKIE_NAME}=${validAdminToken}`,
  };

  beforeEach(() => {
    serviceRequestRepo.clearDevStore();
    adminService.clearDevStore();
    adminLoginLimiter.reset();
  });

  test("should deny unauthenticated access to admin endpoints with 401", async () => {
    const unauthReq = createMockReq("http://localhost:3000/api/admin/requests");

    const resList = await listRequestsRoute(unauthReq);
    assert.strictEqual(resList.status, 401, "List requests must require authentication");

    const resStats = await getStatsRoute(unauthReq);
    assert.strictEqual(resStats.status, 401, "Stats must require authentication");

    const resMe = await meRoute(unauthReq);
    assert.strictEqual(resMe.status, 401, "Me must require authentication");

    const resDetail = await getRequestRoute(unauthReq, {
      params: Promise.resolve({ id: "non-existent-id" }),
    });
    assert.strictEqual(resDetail.status, 401, "Detail must require authentication");

    const resPatch = await updateStatusRoute(unauthReq, {
      params: Promise.resolve({ id: "non-existent-id" }),
    });
    assert.strictEqual(resPatch.status, 401, "Status update must require authentication");
  });

  test("should reject invalid login credentials with 401", async () => {
    const req = createMockReq("http://localhost:3000/api/admin/login", "POST", {
      username: "admin",
      password: "WrongPassword123!",
    });

    const res = await loginRoute(req);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error);
  });

  test("should successfully authenticate valid admin credentials and set session cookie", async () => {
    await adminService.ensureInitialAdmin();

    const req = createMockReq("http://localhost:3000/api/admin/login", "POST", {
      username: "admin",
      password: process.env.ADMIN_INIT_PASSWORD || "MQTechAdmin2026!",
    });

    const res = await loginRoute(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.username, "admin");

    const setCookie = res.headers.get("set-cookie");
    assert.ok(setCookie, "Response must include Set-Cookie header");
    assert.ok(setCookie.includes(ADMIN_COOKIE_NAME));
    assert.ok(setCookie.includes("HttpOnly"));
  });

  test("should allow authenticated admin to list, search, and filter requests", async () => {
    // Seed 2 requests
    const req1 = await serviceRequestRepo.create({
      customerName: "Nguyễn Văn Tuấn",
      customerPhone: "0912111222",
      serviceMode: "IN_STORE",
      deviceCategory: "LAPTOP",
      serviceCategoryId: "svc_desktop_laptop",
      issueDescription: "Laptop bật nguồn không lên đèn báo",
    });

    await serviceRequestRepo.create({
      customerName: "Trần Hữu Nam",
      customerPhone: "0935333444",
      serviceMode: "ON_SITE",
      deviceCategory: "PC_DESKTOP",
      serviceCategoryId: "svc_network_wifi",
      issueDescription: "Mạng LAN văn phòng bị chập chờn rớt mạng",
      serviceAddress: "12 Lý Thường Kiệt, Buôn Ma Thuột",
    });

    // 1. List all
    const reqList = createMockReq(
      "http://localhost:3000/api/admin/requests",
      "GET",
      null,
      authHeaders
    );
    const resList = await listRequestsRoute(reqList);
    assert.strictEqual(resList.status, 200);
    const dataList = await resList.json();
    assert.strictEqual(dataList.data.total, 2);
    assert.strictEqual(dataList.data.items.length, 2);

    // 2. Search by referenceCode
    const reqSearch = createMockReq(
      `http://localhost:3000/api/admin/requests?search=${req1.referenceCode}`,
      "GET",
      null,
      authHeaders
    );
    const resSearch = await listRequestsRoute(reqSearch);
    const dataSearch = await resSearch.json();
    assert.strictEqual(dataSearch.data.total, 1);
    assert.strictEqual(dataSearch.data.items[0].referenceCode, req1.referenceCode);

    // 3. Filter by mode
    const reqMode = createMockReq(
      "http://localhost:3000/api/admin/requests?serviceMode=ON_SITE",
      "GET",
      null,
      authHeaders
    );
    const resMode = await listRequestsRoute(reqMode);
    const dataMode = await resMode.json();
    assert.strictEqual(dataMode.data.total, 1);
    assert.strictEqual(dataMode.data.items[0].serviceMode, "ON_SITE");
  });

  test("should handle status transitions and history audit correctly", async () => {
    const created = await serviceRequestRepo.create({
      customerName: "Hoàng Minh",
      customerPhone: "0977888999",
      serviceMode: "IN_STORE",
      deviceCategory: "LAPTOP",
      serviceCategoryId: "svc_desktop_laptop",
      issueDescription: "Cần thay bàn phím laptop Asus bị liệt phím",
    });

    // 1. Valid transition: AWAITING_CONFIRMATION -> CONFIRMED
    const patchReq1 = createMockReq(
      `http://localhost:3000/api/admin/requests/${created.id}`,
      "PATCH",
      { status: "CONFIRMED", note: "Đã gọi điện thoại xác nhận với khách hàng" },
      authHeaders
    );
    const patchRes1 = await updateStatusRoute(patchReq1, {
      params: Promise.resolve({ id: created.id }),
    });
    assert.strictEqual(patchRes1.status, 200);
    const patchData1 = await patchRes1.json();
    assert.strictEqual(patchData1.data.request.status, "CONFIRMED");
    assert.ok(patchData1.data.history.length >= 2, "History must include initial and confirmed states");

    // 2. Invalid transition: CONFIRMED -> COMPLETED (must go to IN_PROGRESS first)
    const patchReqInvalid = createMockReq(
      `http://localhost:3000/api/admin/requests/${created.id}`,
      "PATCH",
      { status: "COMPLETED", note: "Thử nhảy cóc trạng thái" },
      authHeaders
    );
    const patchResInvalid = await updateStatusRoute(patchReqInvalid, {
      params: Promise.resolve({ id: created.id }),
    });
    assert.strictEqual(patchResInvalid.status, 400, "Illegal transition jump must be rejected");
    const dataInvalid = await patchResInvalid.json();
    assert.strictEqual(dataInvalid.success, false);

    // 3. Valid transition: CONFIRMED -> IN_PROGRESS
    const patchReq2 = createMockReq(
      `http://localhost:3000/api/admin/requests/${created.id}`,
      "PATCH",
      { status: "IN_PROGRESS", note: "Bắt đầu tháo máy kiểm tra" },
      authHeaders
    );
    const patchRes2 = await updateStatusRoute(patchReq2, {
      params: Promise.resolve({ id: created.id }),
    });
    assert.strictEqual(patchRes2.status, 200);
    const patchData2 = await patchRes2.json();
    assert.strictEqual(patchData2.data.request.status, "IN_PROGRESS");
  });

  test("should report accurate stats reflecting persisted records", async () => {
    // Seed 1 AWAITING_CONFIRMATION
    await serviceRequestRepo.create({
      customerName: "Khách 1",
      customerPhone: "0911222333",
      serviceMode: "IN_STORE",
      deviceCategory: "LAPTOP",
      serviceCategoryId: "svc_desktop_laptop",
      issueDescription: "Máy tính bị treo logo không vào được Windows",
    });

    // Seed 1 and advance to CONFIRMED
    const req2 = await serviceRequestRepo.create({
      customerName: "Khách 2",
      customerPhone: "0944555666",
      serviceMode: "IN_STORE",
      deviceCategory: "LAPTOP",
      serviceCategoryId: "svc_desktop_laptop",
      issueDescription: "Máy tính cần vệ sinh tra keo tản nhiệt",
    });
    await serviceRequestRepo.updateStatus(req2.id, "CONFIRMED", "admin");

    const reqStats = createMockReq(
      "http://localhost:3000/api/admin/stats",
      "GET",
      null,
      authHeaders
    );
    const resStats = await getStatsRoute(reqStats);
    assert.strictEqual(resStats.status, 200);
    const data = await resStats.json();
    assert.strictEqual(data.data.total, 2);
    assert.strictEqual(data.data.awaitingConfirmation, 1);
    assert.strictEqual(data.data.confirmed, 1);
    assert.strictEqual(data.data.inProgress, 0);
  });

  test("should clear session cookie on logout", async () => {
    const res = await logoutRoute();
    assert.strictEqual(res.status, 200);
    const setCookie = res.headers.get("set-cookie");
    assert.ok(setCookie?.includes("Max-Age=0"), "Cookie must be cleared");
  });
});
