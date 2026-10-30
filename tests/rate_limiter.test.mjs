import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { InMemoryRateLimiter } from "../src/lib/utils/rate-limiter.ts";

describe("Intake Rate Limiter Verification", () => {
  test("should allow up to max requests within window", () => {
    const limiter = new InMemoryRateLimiter(5, 10);
    const testIp = "192.168.1.100";

    for (let i = 1; i <= 5; i++) {
      const check = limiter.check(testIp);
      assert.strictEqual(check.allowed, true, `Request ${i} should be allowed`);
      assert.strictEqual(check.remaining, 5 - i);
    }

    // 6th request must be blocked
    const overLimitCheck = limiter.check(testIp);
    assert.strictEqual(overLimitCheck.allowed, false, "6th request should be blocked");
    assert.strictEqual(overLimitCheck.remaining, 0);
  });

  test("should track distinct IPs independently", () => {
    const limiter = new InMemoryRateLimiter(2, 5);
    const ipA = "10.0.0.1";
    const ipB = "10.0.0.2";

    assert.strictEqual(limiter.check(ipA).allowed, true);
    assert.strictEqual(limiter.check(ipA).allowed, true);
    assert.strictEqual(limiter.check(ipA).allowed, false);

    // ipB should still be allowed
    assert.strictEqual(limiter.check(ipB).allowed, true);
    assert.strictEqual(limiter.check(ipB).allowed, true);
  });

  test("should support manual reset", () => {
    const limiter = new InMemoryRateLimiter(1, 10);
    const ip = "127.0.0.1";

    assert.strictEqual(limiter.check(ip).allowed, true);
    assert.strictEqual(limiter.check(ip).allowed, false);

    limiter.reset(ip);
    assert.strictEqual(limiter.check(ip).allowed, true);
  });
});
