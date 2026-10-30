import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateServiceRequestInput } from "../src/lib/validations/service-request.ts";

describe("Customer Service Request Intake Validation", () => {
  const validInStorePayload = {
    customerName: "Nguyễn Văn An",
    customerPhone: "0912345678",
    serviceMode: "IN_STORE",
    deviceCategory: "LAPTOP",
    serviceCategoryId: "svc_desktop_laptop",
    issueDescription: "Máy tính xách tay bật nguồn không lên, quạt không quay",
    preferredContactTime: "Buổi sáng (08:00 - 11:30)",
  };

  test("should accept valid In-Store intake payload", () => {
    const result = validateServiceRequestInput(validInStorePayload);
    assert.strictEqual(result.success, true, "Valid in-store payload must succeed");
    assert.strictEqual(result.data?.customerName, "Nguyễn Văn An");
    assert.strictEqual(result.data?.serviceMode, "IN_STORE");
    assert.strictEqual(result.data?.serviceAddress, undefined);
  });

  test("should require serviceAddress for On-Site service mode", () => {
    const invalidOnSitePayload = {
      ...validInStorePayload,
      serviceMode: "ON_SITE",
    };
    const result = validateServiceRequestInput(invalidOnSitePayload);
    assert.strictEqual(result.success, false, "On-site without address must fail");
    assert.ok(
      result.errors?.serviceAddress,
      "Expected error message on serviceAddress field"
    );

    // Now supply valid address
    const validOnSitePayload = {
      ...validInStorePayload,
      serviceMode: "ON_SITE",
      serviceAddress: "123 Đường Phan Bội Châu, TP. Buôn Ma Thuột",
    };
    const validResult = validateServiceRequestInput(validOnSitePayload);
    assert.strictEqual(validResult.success, true);
    assert.strictEqual(
      validResult.data?.serviceAddress,
      "123 Đường Phan Bội Châu, TP. Buôn Ma Thuột"
    );
  });

  test("should validate Vietnamese telephone numbers strictly", () => {
    const invalidPhones = ["12345", "0123456789", "090000", "abc0912345678", "0243123456"];
    for (const phone of invalidPhones) {
      const res = validateServiceRequestInput({
        ...validInStorePayload,
        customerPhone: phone,
      });
      assert.strictEqual(res.success, false, `Phone ${phone} should be rejected`);
      assert.ok(res.errors?.customerPhone);
    }

    const validPhones = ["0912345678", "0387654321", "0798765432", "0868123456", "+84912345678"];
    for (const phone of validPhones) {
      const res = validateServiceRequestInput({
        ...validInStorePayload,
        customerPhone: phone,
      });
      assert.strictEqual(res.success, true, `Phone ${phone} should be accepted`);
    }
  });

  test("should reject short issue description (< 10 chars)", () => {
    const res = validateServiceRequestInput({
      ...validInStorePayload,
      issueDescription: "Hỏng máy",
    });
    assert.strictEqual(res.success, false);
    assert.ok(res.errors?.issueDescription);
  });

  test("should reject invalid service category ID", () => {
    const res = validateServiceRequestInput({
      ...validInStorePayload,
      serviceCategoryId: "non_existent_service",
    });
    assert.strictEqual(res.success, false);
    assert.ok(res.errors?.serviceCategoryId);
  });

  test("should STRICTLY REJECT any submitted computer passwords or credentials", () => {
    const credentialPayloads = [
      { ...validInStorePayload, password: "mySecretPassword123" },
      { ...validInStorePayload, windowsPassword: "AdminPassword!" },
      { ...validInStorePayload, bios_password: "0000" },
      { ...validInStorePayload, pin: "1234" },
      { ...validInStorePayload, mat_khau: "matkhauwindows" },
    ];

    for (const payload of credentialPayloads) {
      const res = validateServiceRequestInput(payload);
      assert.strictEqual(
        res.success,
        false,
        "Payload with credential keys must be rejected"
      );
      assert.ok(
        res.errors?.security,
        "Security error must be present explaining password protection policy"
      );
    }
  });
});
