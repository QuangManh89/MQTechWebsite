import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { MQTECH_SERVICES } from "../src/lib/constants/services.ts";

describe("MQTech Services Specification Verification", () => {
  test("should have exactly 6 confirmed service categories", () => {
    assert.strictEqual(
      MQTECH_SERVICES.length,
      6,
      "MQTech must have exactly 6 confirmed services in Phase P1"
    );
  });

  test("should have unique IDs and slugs for all services", () => {
    const ids = new Set(MQTECH_SERVICES.map((s) => s.id));
    const slugs = new Set(MQTECH_SERVICES.map((s) => s.slug));

    assert.strictEqual(ids.size, 6, "All service IDs must be unique");
    assert.strictEqual(slugs.size, 6, "All service slugs must be unique");
  });

  test("should only include approved delivery modes", () => {
    const validModes = new Set(["IN_STORE", "ON_SITE"]);

    for (const service of MQTECH_SERVICES) {
      assert.ok(
        service.deliveryModes.length > 0,
        `Service ${service.id} must specify at least one delivery mode`
      );
      for (const mode of service.deliveryModes) {
        assert.ok(
          validModes.has(mode),
          `Delivery mode ${mode} in service ${service.id} is invalid`
        );
      }
    }
  });

  test("should not introduce any prohibited PC configurators or e-commerce categories", () => {
    const forbiddenKeywords = ["configurator", "build-pc-shop", "e-commerce", "linh-kien-gia-re"];

    for (const service of MQTECH_SERVICES) {
      for (const keyword of forbiddenKeywords) {
        assert.ok(
          !service.slug.includes(keyword),
          `Prohibited keyword ${keyword} detected in service slug ${service.slug}`
        );
      }
    }
  });
});
