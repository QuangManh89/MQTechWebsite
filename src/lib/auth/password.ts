import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

/**
 * Hashes an administrator password using scrypt with a unique 16-byte cryptographic salt.
 * Result format: "<salt_hex>:<derived_key_hex>"
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a candidate password against a stored scrypt hash using constant-time comparison.
 */
export async function verifyPassword(
  candidate: string,
  storedHash: string
): Promise<boolean> {
  if (!candidate || !storedHash || !storedHash.includes(":")) {
    return false;
  }

  const [salt, keyHex] = storedHash.split(":");
  if (!salt || !keyHex) {
    return false;
  }

  try {
    const keyBuffer = Buffer.from(keyHex, "hex");
    const derivedKey = (await scryptAsync(candidate, salt, 64)) as Buffer;
    return timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}
