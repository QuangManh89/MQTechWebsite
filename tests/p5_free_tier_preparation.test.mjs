/**
 * P5 Fly.io Free-Tier Preparation Test Suite (Post-Review Corrections)
 * 
 * Verifies:
 * 1. Web application Fly configuration (fly.toml / fly.web.toml) naming: mqtech, pinned VM.
 * 2. Database application Fly configuration (infra/postgres/fly.toml): mqtech-db, TCP check on 5432, pinned VM.
 * 3. PostgreSQL memory tuning & initialization scripts (format(%I, %L), entrypoint volume & version guards).
 * 4. Cloudflare R2 media validation (MIME allowlist, SVG rejection, size limits, privacy separation).
 * 5. S3 SigV4 presigned PUT & GET URL generation for public vs private customer attachments.
 * 6. Environment labeling with MQTECH_DEPLOYMENT_ENV.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  validateMediaUpload,
  generateMediaObjectKey,
  buildMediaPublicUrl,
  generateR2PresignedPutUrl,
  generateR2PresignedGetUrl,
  getR2BucketForUpload,
  assertBucketPublicAccessAllowed,
  DEFAULT_MEDIA_BUCKET,
  DEFAULT_ATTACHMENTS_BUCKET,
  DEFAULT_BACKUPS_BUCKET,
  R2_CORS_CONFIGURATION,
  ALLOWED_MEDIA_MIME_TYPES,
  FORBIDDEN_MIME_TYPES,
} from "../src/lib/storage/r2.ts";
import { getAppConfig, validateServerEnv } from "../src/lib/env.ts";

describe("P5 Fly.io Free-Tier Preparation: Web, Postgres & R2 Media", () => {
  // =========================================================================
  // 1. Web Application Fly Configuration Verification
  // =========================================================================
  test("Web Config: fly.toml specifies app = mqtech, pinned VM, and readiness checks", () => {
    const webConfigPath = path.resolve(process.cwd(), "fly.toml");
    assert.ok(fs.existsSync(webConfigPath), "fly.toml must exist");

    const content = fs.readFileSync(webConfigPath, "utf8");
    assert.ok(content.includes('app = "mqtech"'), "Must target app mqtech (not mqtech-web)");
    assert.ok(content.includes('primary_region = "sin"'), "Must be in sin region (Singapore)");
    assert.ok(content.includes('internal_port = 3000'), "Internal port must be 3000");
    assert.ok(content.includes('path = "/api/ready"'), "Must configure /api/ready for proxy routing");
    assert.ok(content.includes('path = "/api/health"'), "Must configure /api/health for monitoring");
    assert.ok(!content.includes("[mounts]"), "Web app must be stateless (no persistent volume)");
    assert.ok(content.includes("auto_stop_machines = false"), "Web app must not auto-stop unexpectedly");
    assert.ok(content.includes('size = "shared-cpu-1x"'), "Web VM size must be shared-cpu-1x");
    assert.ok(content.includes('memory = "256mb"'), "Web VM memory must be pinned to 256mb");
  });

  // =========================================================================
  // 2. Database Application Fly Configuration Verification
  // =========================================================================
  test("Database Config: infra/postgres/fly.toml is strictly private with 1GB volume & TCP check", () => {
    const dbConfigPath = path.resolve(process.cwd(), "infra/postgres/fly.toml");
    assert.ok(fs.existsSync(dbConfigPath), "infra/postgres/fly.toml must exist");

    const content = fs.readFileSync(dbConfigPath, "utf8");
    assert.ok(content.includes('app = "mqtech-db"'), "Must target mqtech-db");
    assert.ok(content.includes('primary_region = "sin"'), "Must be in sin region");
    assert.ok(content.includes('[mounts]'), "Must have persistent volume mount");
    assert.ok(content.includes('initial_size = "1gb"'), "Initial volume size must be 1GB");
    assert.ok(content.includes('destination = "/var/lib/postgresql/data"'), "Mount path must be /var/lib/postgresql/data");
    assert.ok(!content.includes("[http_service]"), "Database must NOT have public http_service");
    assert.ok(!content.includes("[[services]]"), "Database must NOT expose public TCP port");
    assert.ok(content.includes('type = "tcp"') && content.includes("port = 5432"), "Check must use type = tcp on port 5432");
    assert.ok(content.includes('size = "shared-cpu-1x"'), "DB VM size must be shared-cpu-1x");
    assert.ok(content.includes('memory = "256mb"'), "DB VM memory must be pinned to 256mb");
  });

  // =========================================================================
  // 3. PostgreSQL Memory Tuning & Initialization Script Verification
  // =========================================================================
  test("Postgres Tuning & Scripts: postgresql.conf tuned, safe format(%I, %L), and volume guards", () => {
    const confPath = path.resolve(process.cwd(), "infra/postgres/postgresql.conf");
    const initPath = path.resolve(process.cwd(), "infra/postgres/init-scripts/01-init-roles-and-db.sh");
    const wrapperPath = path.resolve(process.cwd(), "infra/postgres/entrypoint-wrapper.sh");

    assert.ok(fs.existsSync(confPath), "postgresql.conf must exist");
    assert.ok(fs.existsSync(initPath), "init-roles script must exist");
    assert.ok(fs.existsSync(wrapperPath), "entrypoint-wrapper script must exist");

    const conf = fs.readFileSync(confPath, "utf8");
    assert.ok(conf.includes("shared_buffers = 32MB"), "shared_buffers must be 32MB");
    assert.ok(conf.includes("work_mem = 1MB"), "work_mem must be 1MB");
    assert.ok(conf.includes("maintenance_work_mem = 16MB"), "maintenance_work_mem must be 16MB");
    assert.ok(conf.includes("max_connections = 10"), "max_connections must be 10");
    assert.ok(conf.includes("password_encryption = scram-sha-256"), "Must enforce SCRAM-SHA-256");

    const init = fs.readFileSync(initPath, "utf8");
    assert.ok(init.includes("mqtech_migrator"), "Must create mqtech_migrator role");
    assert.ok(init.includes("mqtech_app"), "Must create mqtech_app role");
    assert.ok(init.includes("format('CREATE ROLE %I WITH LOGIN PASSWORD %L"), "Must use format(%I, %L) to avoid SQL injection");
    assert.ok(init.includes("REVOKE CREATE ON SCHEMA public FROM PUBLIC"), "Must revoke public schema creation");

    const wrapper = fs.readFileSync(wrapperPath, "utf8");
    assert.ok(wrapper.includes("/proc/mounts"), "Wrapper must verify dedicated mount status via /proc/mounts");
    assert.ok(wrapper.includes("PG_VERSION"), "Wrapper must verify existing PG_VERSION == 16");
  });

  // =========================================================================
  // 4. Cloudflare R2 Media Validation & Privacy Boundary
  // =========================================================================
  test("R2 Media: accepts valid image formats (JPEG, PNG, WebP, AVIF) within 5MB", () => {
    for (const mime of ALLOWED_MEDIA_MIME_TYPES) {
      const res = validateMediaUpload({
        fileName: "customer-pc-problem.png",
        contentType: mime,
        sizeBytes: 2 * 1024 * 1024, // 2MB
      });
      assert.strictEqual(res.valid, true, `MIME ${mime} should be accepted`);
      assert.ok(res.sanitizedFileName);
    }
  });

  test("R2 Media: strictly rejects SVG, executable files, path traversal, and oversized uploads", () => {
    // 1. SVG rejection (XSS prevention)
    const resSvg = validateMediaUpload({
      fileName: "logo.svg",
      contentType: "image/svg+xml",
      sizeBytes: 1024,
    });
    assert.strictEqual(resSvg.valid, false);
    assert.ok(resSvg.error?.includes("SVG"));

    // 2. Dangerous executables
    for (const badMime of FORBIDDEN_MIME_TYPES) {
      const res = validateMediaUpload({
        fileName: "payload.bin",
        contentType: badMime,
        sizeBytes: 2048,
      });
      assert.strictEqual(res.valid, false, `MIME ${badMime} must be rejected`);
    }

    // 3. Oversized file (> 5MB)
    const resOver = validateMediaUpload({
      fileName: "huge_photo.jpg",
      contentType: "image/jpeg",
      sizeBytes: 6 * 1024 * 1024, // 6MB
    });
    assert.strictEqual(resOver.valid, false);
    assert.ok(resOver.error?.includes("giới hạn cho phép"));

    // 4. Path traversal attempt
    const resTraversal = validateMediaUpload({
      fileName: "../../etc/passwd.jpg",
      contentType: "image/jpeg",
      sizeBytes: 1024,
    });
    assert.strictEqual(resTraversal.valid, false);
  });

  test("R2 Privacy Boundary: Customer attachments default to PRIVATE and have no public URL", () => {
    const uploadReq = {
      fileName: "motherboard_serial_number.jpg",
      contentType: "image/jpeg",
      sizeBytes: 1024 * 500,
      category: "CUSTOMER_ATTACHMENT",
    };

    const validated = validateMediaUpload(uploadReq);
    assert.strictEqual(validated.valid, true);
    assert.strictEqual(validated.visibility, "PRIVATE", "Customer attachment must be PRIVATE");

    const { mediaId, objectKey } = generateMediaObjectKey(
      validated.sanitizedFileName,
      { visibility: validated.visibility, category: validated.category }
    );
    assert.ok(mediaId, "Must return mediaId");
    assert.ok(objectKey.startsWith("attachments/"), "Private attachments must use attachments/ prefix");

    const publicUrl = buildMediaPublicUrl(objectKey, validated.visibility, "https://mqtech.fly.dev/media");
    assert.strictEqual(publicUrl, null, "Private customer attachments MUST NOT have a public URL");
  });

  test("R2 Public Media: Marketing assets have public URL and media/ prefix", () => {
    const validated = validateMediaUpload({
      fileName: "banner.png",
      contentType: "image/png",
      sizeBytes: 1024 * 300,
      category: "MARKETING",
      visibility: "PUBLIC",
    });
    assert.strictEqual(validated.visibility, "PUBLIC");

    const { objectKey } = generateMediaObjectKey(
      validated.sanitizedFileName,
      { visibility: validated.visibility, category: validated.category, date: new Date("2026-10-31T10:00:00Z") }
    );
    assert.ok(objectKey.startsWith("media/2026/10/"));

    const publicUrl = buildMediaPublicUrl(objectKey, validated.visibility, "https://pub-staging.r2.dev");
    assert.strictEqual(publicUrl, `https://pub-staging.r2.dev/${objectKey}`);
  });

  // =========================================================================
  // 5. AWS S3 SigV4 Presigned PUT & GET URL Generation
  // =========================================================================
  test("R2 Presigned PUT: generates valid SigV4 PUT URL with correct headers and scope", () => {
    const fixedDate = new Date("2026-10-31T12:00:00Z");
    const presignedUrl = generateR2PresignedPutUrl({
      accountId: "abc123def456",
      accessKeyId: "KEY_ID_TEST",
      secretAccessKey: "SECRET_KEY_TEST_999",
      bucketName: "mqtech-media-staging",
      objectKey: "media/2026/10/test-photo.jpg",
      contentType: "image/jpeg",
      expiresInSeconds: 900,
      date: fixedDate,
    });

    assert.ok(presignedUrl.startsWith("https://abc123def456.r2.cloudflarestorage.com/mqtech-media-staging/"));
    assert.ok(presignedUrl.includes("X-Amz-Algorithm=AWS4-HMAC-SHA256"));
    assert.ok(presignedUrl.includes("X-Amz-Credential=KEY_ID_TEST"));
    assert.ok(presignedUrl.includes("auto%2Fs3%2Faws4_request"));
    assert.ok(presignedUrl.includes("X-Amz-Expires=900"));
    assert.ok(presignedUrl.includes("X-Amz-Signature="));
  });

  test("R2 Presigned GET: generates secure short-lived GET URL for private attachment access", () => {
    const fixedDate = new Date("2026-10-31T12:00:00Z");
    const presignedGet = generateR2PresignedGetUrl({
      accountId: "abc123def456",
      accessKeyId: "KEY_ID_TEST",
      secretAccessKey: "SECRET_KEY_TEST_999",
      bucketName: DEFAULT_ATTACHMENTS_BUCKET,
      objectKey: "attachments/2026/10/customer_invoice.jpg",
      expiresInSeconds: 300,
      date: fixedDate,
    });

    assert.ok(presignedGet.startsWith("https://abc123def456.r2.cloudflarestorage.com/mqtech-attachments-staging/attachments/"));
    assert.ok(presignedGet.includes("X-Amz-Algorithm=AWS4-HMAC-SHA256"));
    assert.ok(presignedGet.includes("X-Amz-Expires=300"));
    assert.ok(presignedGet.includes("X-Amz-SignedHeaders=host"));
    assert.ok(presignedGet.includes("X-Amz-Signature="));
  });

  test("R2 Three Distinct Buckets: physical bucket separation and strict access isolation", () => {
    // 1. Verify default bucket naming
    assert.strictEqual(DEFAULT_MEDIA_BUCKET, "mqtech-media-staging");
    assert.strictEqual(DEFAULT_ATTACHMENTS_BUCKET, "mqtech-attachments-staging");
    assert.strictEqual(DEFAULT_BACKUPS_BUCKET, "mqtech-db-backups-staging");

    // 2. Bucket routing
    assert.strictEqual(getR2BucketForUpload("CUSTOMER_ATTACHMENT", "PRIVATE"), DEFAULT_ATTACHMENTS_BUCKET);
    assert.strictEqual(getR2BucketForUpload("CUSTOMER_ATTACHMENT", "PUBLIC"), DEFAULT_ATTACHMENTS_BUCKET);
    assert.strictEqual(getR2BucketForUpload("MARKETING", "PUBLIC"), DEFAULT_MEDIA_BUCKET);

    // 3. assertBucketPublicAccessAllowed enforces private buckets cannot be public
    assert.doesNotThrow(() => assertBucketPublicAccessAllowed(DEFAULT_MEDIA_BUCKET));
    assert.throws(() => assertBucketPublicAccessAllowed(DEFAULT_ATTACHMENTS_BUCKET), /strictly forbidden/);
    assert.throws(() => assertBucketPublicAccessAllowed(DEFAULT_BACKUPS_BUCKET), /strictly forbidden/);

    // 4. Client presigned PUT cannot target backup bucket
    assert.throws(
      () =>
        generateR2PresignedPutUrl({
          accountId: "abc123def456",
          accessKeyId: "KEY_ID_TEST",
          secretAccessKey: "SECRET_KEY_TEST_999",
          bucketName: DEFAULT_BACKUPS_BUCKET,
          objectKey: "backups/test.dump",
          contentType: "application/octet-stream",
        }),
      /Direct client PUT is strictly forbidden on backup bucket/
    );

    // 5. Presigned GET cannot target backup bucket
    assert.throws(
      () =>
        generateR2PresignedGetUrl({
          accountId: "abc123def456",
          accessKeyId: "KEY_ID_TEST",
          secretAccessKey: "SECRET_KEY_TEST_999",
          bucketName: DEFAULT_BACKUPS_BUCKET,
          objectKey: "backups/test.dump",
        }),
      /Generic presigned GET is strictly forbidden on backup bucket/
    );

    // 6. Public URL builder strictly returns null for attachment or backup buckets
    const urlFromAttachmentBucket = buildMediaPublicUrl("photo.jpg", { bucketName: DEFAULT_ATTACHMENTS_BUCKET });
    assert.strictEqual(urlFromAttachmentBucket, null);

    const urlFromBackupBucket = buildMediaPublicUrl("dump.sql", { bucketName: DEFAULT_BACKUPS_BUCKET });
    assert.strictEqual(urlFromBackupBucket, null);
  });

  test("R2 CORS: restricts origin strictly to mqtech.fly.dev", () => {
    assert.ok(R2_CORS_CONFIGURATION.rules[0].AllowedOrigins.includes("https://mqtech.fly.dev"));
    assert.ok(R2_CORS_CONFIGURATION.rules[0].AllowedMethods.includes("PUT"));
    assert.ok(R2_CORS_CONFIGURATION.rules[0].AllowedMethods.includes("GET"));
  });

  // =========================================================================
  // 6. Next.js Runtime Compatibility & Staging Environment Labeling
  // =========================================================================
  test("Environment: MQTECH_DEPLOYMENT_ENV labels staging while NODE_ENV=production enforces safety", () => {
    const origNodeEnv = process.env.NODE_ENV;
    const origDeployEnv = process.env.MQTECH_DEPLOYMENT_ENV;
    const origMemory = process.env.ALLOW_MEMORY_STORE;

    try {
      process.env.NODE_ENV = "production";
      process.env.MQTECH_DEPLOYMENT_ENV = "staging";
      delete process.env.ALLOW_MEMORY_STORE;

      const config = getAppConfig();
      assert.strictEqual(config.environment, "staging");
      assert.strictEqual(config.deploymentEnv, "staging");
      assert.strictEqual(config.allowMemoryStore, false, "Staging unconditionally forbids in-memory storage");

      // Attempting to enable in-memory storage in staging throws critical violation
      process.env.ALLOW_MEMORY_STORE = "true";
      assert.throws(
        () => validateServerEnv(),
        /ALLOW_MEMORY_STORE=true is strictly forbidden in staging/
      );
    } finally {
      process.env.NODE_ENV = origNodeEnv;
      process.env.MQTECH_DEPLOYMENT_ENV = origDeployEnv;
      process.env.ALLOW_MEMORY_STORE = origMemory;
    }
  });

  test("Next.js Config: server-side image optimization is disabled to prevent OOM on 256MB machine", () => {
    const configPath = path.resolve(process.cwd(), "next.config.ts");
    const content = fs.readFileSync(configPath, "utf8");

    assert.ok(content.includes("unoptimized: true"), "next.config.ts must set images.unoptimized: true");
  });
});
