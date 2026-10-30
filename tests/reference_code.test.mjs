import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  generateReferenceCode,
  isValidReferenceCode,
} from "../src/lib/utils/reference-code.ts";

describe("Cryptographically Secure Reference Code Verification", () => {
  test("should generate valid reference code with MQT prefix", () => {
    const code = generateReferenceCode();
    assert.strictEqual(typeof code, "string");
    assert.ok(code.startsWith("MQT-"), "Must start with MQT-");
    assert.strictEqual(code.length, 10, "Format must be MQT-XXXXXX (10 chars)");
    assert.strictEqual(isValidReferenceCode(code), true);
  });

  test("should generate 1,000 distinct codes without collisions", () => {
    const set = new Set();
    const count = 1000;
    for (let i = 0; i < count; i++) {
      const code = generateReferenceCode();
      assert.strictEqual(isValidReferenceCode(code), true);
      set.add(code);
    }
    assert.strictEqual(set.size, count, "All 1,000 generated codes must be unique");
  });

  test("should never include visually ambiguous characters (0, O, 1, I)", () => {
    const ambiguousChars = ["0", "O", "1", "I"];
    for (let i = 0; i < 500; i++) {
      const code = generateReferenceCode();
      const payload = code.replace("MQT-", "");
      for (const char of ambiguousChars) {
        assert.ok(
          !payload.includes(char),
          `Reference code ${code} should not contain ambiguous char ${char}`
        );
      }
    }
  });

  test("should reject malformed reference codes in validator", () => {
    assert.strictEqual(isValidReferenceCode("12345"), false);
    assert.strictEqual(isValidReferenceCode("MQT-12"), false);
    assert.strictEqual(isValidReferenceCode("ABC-123456"), false);
    assert.strictEqual(isValidReferenceCode(""), false);
  });
});
