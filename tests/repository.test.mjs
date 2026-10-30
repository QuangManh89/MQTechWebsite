import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { ServiceRequestRepository } from "../src/lib/db/repository.ts";

describe("Service Request Repository Verification", () => {
  let repo;

  beforeEach(() => {
    repo = new ServiceRequestRepository();
    repo.clearDevStore();
  });

  test("should persist request with AWAITING_CONFIRMATION status", async () => {
    const created = await repo.create({
      customerName: "Trần Thị Mai",
      customerPhone: "0905123456",
      serviceMode: "IN_STORE",
      deviceCategory: "LAPTOP",
      serviceCategoryId: "svc_desktop_laptop",
      issueDescription: "Máy bị sọc màn hình, cần thay thế linh kiện chính hãng",
    });

    assert.ok(created.id, "ID must be generated");
    assert.ok(created.referenceCode.startsWith("MQT-"), "Reference code must start with MQT-");
    assert.strictEqual(created.status, "AWAITING_CONFIRMATION");
    assert.strictEqual(created.customerName, "Trần Thị Mai");
    assert.strictEqual(repo.devStoreCount, 1);
  });

  test("should retrieve persisted request by reference code", async () => {
    const created = await repo.create({
      customerName: "Lê Hoàng",
      customerPhone: "0987654321",
      serviceMode: "ON_SITE",
      deviceCategory: "PC_DESKTOP",
      serviceCategoryId: "svc_hardware_upgrade",
      issueDescription: "Nâng cấp SSD và cài đặt hệ điều hành tại nhà",
      serviceAddress: "45 Lê Duẩn, Buôn Ma Thuột",
    });

    const found = await repo.findByReferenceCode(created.referenceCode);
    assert.ok(found, "Request must be found");
    assert.strictEqual(found?.id, created.id);
    assert.strictEqual(found?.customerName, "Lê Hoàng");
    assert.strictEqual(found?.serviceAddress, "45 Lê Duẩn, Buôn Ma Thuột");
  });

  test("should return null for non-existent reference code", async () => {
    const found = await repo.findByReferenceCode("MQT-NONEXIST");
    assert.strictEqual(found, null);
  });
});
