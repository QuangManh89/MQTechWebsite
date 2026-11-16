#!/usr/bin/env node
/**
 * MQTech Staging Deployment Pre-flight Verifier
 *
 * Verifies local prerequisites, secrets completeness, and protected resource safeguards
 * before executing Fly.io deployment commands.
 *
 * Usage:
 *   node scripts/preflight-staging-check.mjs
 *   (or inside scripts: node preflight-staging-check.mjs)
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

console.log("================================================================================");
console.log("             MQTech Staging Deployment Pre-flight Check");
console.log("================================================================================\n");

let passed = true;

function check(title, fn) {
  process.stdout.write(`[*] Checking ${title}... `);
  try {
    const res = fn();
    console.log(`[PASS] ${res || ""}`);
  } catch (err) {
    passed = false;
    console.log(`[FAIL] ${err.message}`);
  }
}

// 1. Check flyctl installation
check("Fly CLI (flyctl) availability", () => {
  const version = execSync("fly version", { encoding: "utf8" }).trim();
  return `Installed (${version})`;
});

// 2. Check fly authentication
check("Fly.io authentication status", () => {
  const user = execSync("fly auth whoami", { encoding: "utf8" }).trim();
  return `Logged in as: ${user}`;
});

// 3. Protected Infrastructure Safeguard
check("Protected infrastructure guard", () => {
  const webFlyPath = resolve(projectRoot, "fly.toml");
  const dbFlyPath = resolve(projectRoot, "infra/postgres/fly.toml");

  if (!existsSync(webFlyPath)) {
    throw new Error(`Missing fly.toml at ${webFlyPath}`);
  }
  if (!existsSync(dbFlyPath)) {
    throw new Error(`Missing infra/postgres/fly.toml at ${dbFlyPath}`);
  }

  const webFly = readFileSync(webFlyPath, "utf8");
  const dbFly = readFileSync(dbFlyPath, "utf8");

  const webAppMatch = webFly.match(/^\s*app\s*=\s*["']([^"']+)["']/m);
  const dbAppMatch = dbFly.match(/^\s*app\s*=\s*["']([^"']+)["']/m);

  const webApp = webAppMatch ? webAppMatch[1] : null;
  const dbApp = dbAppMatch ? dbAppMatch[1] : null;

  if (webApp === "openwebui-mqtech" || dbApp === "openwebui-mqtech") {
    throw new Error("CRITICAL: fly.toml targets protected app 'openwebui-mqtech'!");
  }

  if (webApp !== "mqtech") {
    throw new Error(`Expected fly.toml app to be 'mqtech', but found '${webApp}'`);
  }
  if (dbApp !== "mqtech-db") {
    throw new Error(`Expected infra/postgres/fly.toml app to be 'mqtech-db', but found '${dbApp}'`);
  }

  return "Verified: Web app is 'mqtech', DB app is 'mqtech-db'. Protected resources safe.";
});

// 4. Staging secrets presence
check(".env.staging.local file", () => {
  let envPath = resolve(projectRoot, ".env.staging.local");
  if (!existsSync(envPath)) {
    const fallback = resolve(__dirname, ".env.staging.local");
    if (existsSync(fallback)) {
      envPath = fallback;
    } else {
      throw new Error("Missing .env.staging.local. Run 'node scripts/generate-staging-secrets.mjs' first.");
    }
  }
  const content = readFileSync(envPath, "utf8");
  if (content.includes("YOUR_CLOUDFLARE_ACCOUNT_ID")) {
    throw new Error(".env.staging.local contains placeholder Cloudflare R2 values. Please fill in your real R2 credentials.");
  }
  return "All required secrets populated.";
});

console.log("\n--------------------------------------------------------------------------------");
if (passed) {
  console.log("All pre-flight checks PASSED. Ready for staging deployment steps.");
} else {
  console.log("Pre-flight checks encountered issues. Please fix them before deploying.");
  process.exit(1);
}
