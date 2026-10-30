import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { getAppConfig } from "../src/lib/env.ts";

describe("MQTech Environment Boundary Verification", () => {
  test("should provide sensible development defaults", () => {
    const config = getAppConfig();

    assert.ok(config.appUrl, "App URL must have a default");
    assert.ok(config.serviceArea.includes("Buôn Ma Thuột"), "Service area must reference Buôn Ma Thuột");
  });

  test("should not expose server secrets in public fields", () => {
    const config = getAppConfig();

    assert.ok(!("password" in config), "Database password must not be exposed directly on config object");
    assert.ok(!("apiKey" in config), "API keys must not be exposed on config object");
  });
});
