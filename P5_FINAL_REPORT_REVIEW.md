# MQTech — P5 Final Report Independent Review

**Review date:** 2026-10-31  
**Scope:** Review of the supplied `audit/P5_FINAL_REPORT.md` only. The updated source-code ZIP, executable test logs, Fly configuration files and R2 configuration were not included with this submission.

## Overall decision

**BLOCKED — do not approve staging deployment yet.**

The report describes meaningful remediation and transparently marks cloud-only tests as not run. However, the architecture described in the report still contradicts the previously approved public/private R2 separation, and several security claims are not supported by the listed test evidence. This is a report-level review, not source-code verification.

## Findings

### P0 — R2 public/private separation is not actually demonstrated

The report identifies only `mqtech-media-staging` as the bucket in the architecture (sections C and F), while also placing public marketing media and private customer attachments in that bucket. It additionally discusses private database backups without identifying a separate backup bucket in the architecture or resource inventory. The staging prerequisite asks for only the media bucket.

This is unsafe if public access via `r2.dev` is enabled on that bucket: Cloudflare documents that enabling public development URL access exposes the bucket's contents to the Internet. Prefixes such as `media/` and `attachments/`, `visibility=PRIVATE`, and `publicUrl=null` are application-level conventions; they do not create bucket-level access isolation.

**Required correction:** use three distinct buckets:

- `mqtech-media-staging` — public access only for approved marketing/service media.
- `mqtech-attachments-staging` — private; no `r2.dev` or public custom domain.
- `mqtech-db-backups-staging` — private; encrypted backups only.

Use distinct least-privilege credentials/policies where possible. Verify that a public URL cannot retrieve a known attachment or backup object. Do not mark the privacy boundary PASS until the code and bucket configuration enforce this separation.

### P1 — PostgreSQL privilege claims lack listed integration evidence

The report claims `mqtech_app` successfully fails DDL with `permission denied for schema public`, but the Validation Evidence table lists only shell syntax, the 12 P5 unit tests, the general test suite, typecheck, lint, build and migration dry-run. It does not list a PostgreSQL 16 integration test that creates the roles, connects as `mqtech_app`, verifies normal DML/sequence access, and attempts CREATE/ALTER/DROP.

**Required correction:** run the init script against a disposable local PostgreSQL 16 instance and execute an automated privilege matrix. Until then, mark runtime privileges and actual DDL denial **NOT VERIFIED**, not PASS.

### P1 — Backup/restore implementation is not proven by syntax checks

The report describes backup, restore, encryption and identity guards, but the listed evidence only proves shell syntax. It does not show a successful `pg_dump`, encryption, checksum verification, restore into a disposable database, post-restore integrity checks, or rejection of an unsafe target. The Git Change Summary also does not list the backup/restore helper files named in the Security Audit, so their status is unclear.

**Required correction:** include the actual scripts in the source package and run an end-to-end local backup → encrypt → verify → restore-to-disposable-DB test. Keep live R2 upload explicitly NOT RUN unless credentials and an approved test bucket are used later.

### P1 — Fly health-check terminology is misleading

The report calls `[checks.process_liveness]` a “Process Liveness” check. Current Fly configuration documentation defines top-level `[checks.<name>]` checks as HTTP or TCP monitoring checks requiring a port; these do not affect request routing. Service-level checks, such as `[[http_service.checks]]`, affect routing readiness. A failing health check does not itself restart or stop a Machine.

**Required correction:** describe `[checks.process_liveness]` as a named top-level HTTP monitoring check if that is what the TOML contains. Do not claim it is a separate Fly process-liveness/restart mechanism. Retain `/api/ready` as the service-level readiness check, and document its routing effect accurately.

### P1 — Fly cost estimate is overstated by a fixed snapshot line

The reported compute and volume arithmetic is:

- 2 × $2.19 Machines = $4.38/month
- 1GB volume = $0.15/month
- Base total = **$4.53/month**

Fly's current published pricing lists snapshots at $0.08/GB-month, but also states that the first 10GB of snapshots are free each month. Snapshot billing is based on actual stored snapshot size, not automatically 1GB merely because the volume is provisioned at 1GB. Therefore the report's fixed $0.08 snapshot charge and $4.61 headline are not a sound expected monthly estimate for this setup. A better estimate is **$4.53/month base**, plus snapshot charges only for stored snapshot data above the free 10GB/month allowance, plus other applicable usage. The user's Legacy Free allowance still remains NOT VERIFIED.

### P1 — Local build is not proof that 256MB runtime sizing is safe

A successful local build and `images.unoptimized=true` do not demonstrate that a Next.js SSR runtime will remain within 256MB under cold start, concurrent requests, admin use, database connections and media operations.

**Required correction:** retain 256MB only as a constrained staging hypothesis. Add staging acceptance checks for peak RSS, OOM/restarts, response latency and a small sustained request test before considering production readiness. Do not silently scale resources or provision extra Machines.

### P2 — Configuration/source inventory is not fully auditable

The report references both `fly.toml` and `fly.web.toml` but does not clearly state which is the sole canonical Web deployment config and exactly when each should be used. The Git summary does not enumerate every file cited in the security section, especially backup/restore helpers.

**Required correction:** declare one canonical Web config, document explicit `flyctl -c` usage for any intentionally retained alternate config, and ensure the Git inventory lists every P5-created/modified file.

## Claims that remain unverified from this submission

Because only the Markdown report was supplied, the following statements are report assertions rather than independently reproduced results:

- 144/144 tests passed, including 12 P5 tests.
- Fly CLI validation succeeded for both configurations.
- SQL role creation and password quoting are safe in the actual init script.
- The volume guard correctly distinguishes a newly provisioned empty volume from a non-empty invalid cluster.
- Runtime DDL is denied while required DML and sequence use succeed.
- R2 signatures, content validation, authorization and private access behave correctly.
- Backup/restore scripts enforce the stated safety guards.
- The working tree and protected cloud resources were not changed.

## Required next submission

Provide one updated ZIP containing the actual current source and configuration files, especially:

- `fly.toml` and `infra/postgres/fly.toml` (plus any retained alternate config)
- PostgreSQL Dockerfile, init script, entrypoint guard and `postgresql.conf`
- `migrations/002_media_storage.sql`
- R2 storage module and upload/download authorization routes
- backup/restore scripts and helper modules
- P5 unit/integration tests
- relevant test logs or captured command output

Do not include `.env`, credentials, API tokens, private keys or real database URLs. No cloud deployment or resource mutation is requested for this review.

## Decision

**P5 status: BLOCKED pending P0 R2 bucket separation and source/evidence verification.**  
Do not provision or deploy staging yet. The cloud-only tests may remain NOT RUN until explicit approval, but the local PostgreSQL and backup/restore tests should be completed before declaring internal technical blockers closed.
