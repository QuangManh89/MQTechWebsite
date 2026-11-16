#!/usr/bin/env node
/**
 * MQTech Staging Secrets Generator
 *
 * Generates cryptographically secure random values for Fly.io staging secrets.
 * Writes output to .env.staging.local (strictly gitignored).
 *
 * Usage:
 *   node scripts/generate-staging-secrets.mjs
 */

import { randomBytes } from "node:crypto";
import { writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");
const targetPath = resolve(projectRoot, ".env.staging.local");

if (existsSync(targetPath)) {
  console.log(`[NOTICE] ${targetPath} already exists.`);
  console.log("To avoid overwriting existing secrets, delete or rename it first if you wish to re-generate.");
  process.exit(0);
}

// Generate secure random strings
const postgresPassword = randomBytes(24).toString("base64url");
const sessionSecret = randomBytes(32).toString("hex");
const restoreGuardKey = randomBytes(24).toString("hex");
const backupEncryptionKey = randomBytes(32).toString("hex");
const adminInitialPassword = "MQT@" + randomBytes(12).toString("base64url") + "!";

const content = `# ==============================================================================
# MQTech Staging Secrets (Generated: ${new Date().toISOString()})
# WARNING: NEVER COMMIT THIS FILE TO VERSION CONTROL
# ==============================================================================

# 1. PostgreSQL Database App (mqtech-db)
POSTGRES_USER=mqtech
POSTGRES_DB=mqtech_production
POSTGRES_PASSWORD=${postgresPassword}

# Internal connection URL for Web App:
# postgresql://mqtech:${postgresPassword}@mqtech-db.internal:5432/mqtech_production
DATABASE_URL=postgresql://mqtech:${postgresPassword}@mqtech-db.internal:5432/mqtech_production

# 2. Next.js Web App Secrets (mqtech)
SESSION_SECRET=${sessionSecret}
ADMIN_INITIAL_EMAIL=admin@mqcomputech.com
ADMIN_INITIAL_PASSWORD=${adminInitialPassword}
RESTORE_GUARD_STAGING_KEY=${restoreGuardKey}
BACKUP_ENCRYPTION_KEY=${backupEncryptionKey}

# 3. Cloudflare R2 Credentials (Fill with values from Cloudflare Dashboard)
R2_ACCOUNT_ID=YOUR_CLOUDFLARE_ACCOUNT_ID
R2_ACCESS_KEY_ID=YOUR_R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=YOUR_R2_SECRET_ACCESS_KEY

# Bucket Names
R2_MEDIA_BUCKET=mqtech-media-staging
R2_ATTACHMENTS_BUCKET=mqtech-attachments-staging
R2_BACKUPS_BUCKET=mqtech-db-backups-staging
`;

writeFileSync(targetPath, content, { encoding: "utf8", mode: 0o600 });
console.log(`[SUCCESS] Staging secrets generated successfully at: ${targetPath}`);
console.log("Open .env.staging.local to review generated credentials and add your Cloudflare R2 tokens.");
