import { randomInt } from "node:crypto";

/**
 * Character set excluding visually ambiguous characters:
 * Excluded: 0 (zero), O (capital o), 1 (one), I (capital i)
 */
const SAFE_CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generates a cryptographically random, unpredictable reference code.
 * Example output: "MQT-8X2K9P"
 *
 * Entropy: 32^6 = 1,073,741,824 possible codes per prefix.
 * Sequential auto-increment IDs are NEVER used.
 */
export function generateReferenceCode(prefix = "MQT"): string {
  const codeLength = 6;
  let code = "";
  for (let i = 0; i < codeLength; i++) {
    const randomIndex = randomInt(0, SAFE_CHARSET.length);
    code += SAFE_CHARSET[randomIndex];
  }
  return `${prefix}-${code}`;
}

/**
 * Validates whether a reference code conforms to the expected MQTech format.
 */
export function isValidReferenceCode(code: string): boolean {
  if (!code || typeof code !== "string") return false;
  const regex = /^MQT-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;
  return regex.test(code.toUpperCase());
}
