# MQTech Website — Phase P4.1.2 Deployment Safety Corrections Report

- **Document Version:** 1.0.0
- **Audit Date:** 2026-10-30
- **Auditor:** Senior Software Engineer, Application Security Reviewer & Infrastructure Readiness Auditor
- **Phase:** Phase P4.1.2 Deployment Safety Corrections (Local Engineering Only)
- **Repository:** `D:\1.Project\MQTechWeb`
- **Baseline Git Commit:** `1123428`
- **Status:** **COMPLETE — ALL GAPS RESOLVED — ZERO CLOUD RESOURCES TOUCHED**

---

## 1. Executive Summary

Phase P4.1.2 was authorized to execute source-level and deployment-safety corrections based on findings from `audit/P4_1_1_CLOSEOUT_REPORT.md`.

### Core Engineering Deliverables:
1. **Fly.io Healthcheck Semantics Alignment (Fix A):** Refactored `fly.toml` to align strictly with official Fly.io healthcheck specifications (https://docs.fly.io/reference/health-checks). Clarified that service-level checks (`[[http_service.checks]]`) control Fly Proxy request routing and **do not restart or stop Machines**. Separated traffic routing readiness (`/api/ready`) from top-level monitoring checks (`[checks.process_liveness]` on `/api/health`). Removed all invalid restart assumptions.
2. **Strengthened Migration Baseline Safety (Fix B):** Refactored `scripts/migrate.mjs` to require a comprehensive schema verification check (`verifyCompleteSchema`) before baselining migration `001`. The runner verifies all 4 core tables, 35 required columns and their exact nullability, 5 indexes, primary/foreign key constraints, and all 6 confirmed service category seeds. Baselining without explicit operator confirmation (`--confirm-baseline` or `CONFIRM_BASELINE=true`) or against an incomplete schema is strictly aborted.
3. **Fail-Closed Backup & Restore Target Safety (Fix C):** Upgraded `scripts/restore.sh` and created `scripts/restore-guard.mjs`. Replaced fragile blacklist-only validation with an approved host allowlist (`localhost`, `127.0.0.1`, `::1`), mandatory disposable database name markers (`_dev`, `_test`, `_disposable`, `_restore_test`, `mqtech_test`), source-destination self-clobbering prevention, and mandatory two-factor confirmation (`CONFIRM_DESTRUCTIVE_RESTORE=true` and `CONFIRM_RESTORE_DB_NAME="<exact_db_name>"`).
4. **Updated Phase P5 Provider Runbook (Fix D):** Corrected the deployment runbook to document modern Fly.io Managed Postgres CLI commands (`fly mpg` instead of legacy `fly postgres`). Explicitly documented that attaching a managed database is a **deployment-impacting operation** that automatically injects `DATABASE_URL` and triggers an immediate application deployment release. Documented alternative providers (Neon, Supabase, RDS) with open decision gates awaiting explicit user approval.
5. **Strict Safety Compliance:** Zero commands were executed against Fly.io resources. The protected OpenWebUI application (`openwebui-mqtech`, `2871574ae574e8`, `vol_4m3m9jdgen55793v`, region `sin`) remains completely untouched.

---

## 2. Fly.io Healthcheck Corrections

### Official Fly.io Healthcheck Architecture
In accordance with official Fly.io documentation (https://docs.fly.io/reference/health-checks), healthchecks operate across distinct layers with distinct operational effects:

| Check Type | Configuration Location | Target Endpoint | Operational Effect |
| :--- | :--- | :--- | :--- |
| **Service-Level Check** | `[[http_service.checks]]` | `/api/ready` | **Controls Traffic Routing:** When passing (HTTP 200), Fly Proxy routes requests to the Machine. When failing (HTTP 503), Fly Proxy halts routing to that Machine. **CRITICAL: Does NOT restart or stop the Machine.** |
| **Top-Level Monitoring Check** | `[checks.process_liveness]` | `/api/health` | **Observability & Alerting:** Runs independently; reports status to Fly.io dashboard and API metrics. Does not affect proxy routing decisions. |
| **Container Engine Healthcheck** | `Dockerfile` `HEALTHCHECK` | `/api/health` | **Container Liveness:** Evaluated locally by the container runtime to verify process responsiveness. |

### Corrected `fly.toml` Configuration:
```toml
[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

  # Service-Level Readiness Check (Controls Fly Proxy Traffic Routing):
  # Evaluates /api/ready. If PostgreSQL is unavailable, /api/ready returns HTTP 503.
  # Fly Proxy temporarily stops routing incoming requests to this Machine without
  # terminating or rebooting the instance.
  [[http_service.checks]]
    interval = "15s"
    timeout = "5s"
    grace_period = "10s"
    method = "GET"
    path = "/api/ready"
    protocol = "http"
    tls_skip_verify = false

# Top-Level Monitoring Check (Reporting & Observability):
# Monitors process liveness via /api/health independently of traffic routing.
[checks]
  [checks.process_liveness]
    port = 3000
    type = "http"
    interval = "30s"
    timeout = "5s"
    grace_period = "10s"
    method = "GET"
    path = "/api/health"
```

---

## 3. Migration Baseline Verification Logic

### The Problem Addressed
Previously, passing `--baseline` recorded migration `001` in `schema_migrations` without verifying that the existing database actually contained the full MQTech schema. If run against an empty or partially populated database, future migrations would fail unpredictably.

### Implemented Solution (`scripts/migrate.mjs`)
Added `verifyCompleteSchema(client)` which executes a comprehensive preflight audit against PostgreSQL system catalogs before allowing any baseline recording:

1. **Table Verification (`information_schema.tables`):**
   - Must contain: `service_categories`, `service_requests`, `request_status_history`, `admin_users`.
2. **Column & Nullability Verification (`information_schema.columns`):**
   - `service_categories`: 7 columns, all verified `NOT NULL`.
   - `service_requests`: 14 columns, verifies `NOT NULL` on core fields and nullable on optional fields.
   - `request_status_history`: 7 columns, all verified `NOT NULL` except `note`.
   - `admin_users`: 8 columns, explicitly checks `token_version` (`NOT NULL`) and `is_active` (`NOT NULL`).
3. **Index Verification (`pg_indexes`):**
   - Verifies 5 mandatory indexes: `idx_service_requests_status`, `idx_service_requests_created_at`, `idx_service_requests_ref_code`, `idx_service_requests_phone`, `idx_status_history_request_id`.
4. **Seed Record Verification:**
   - Verifies all 6 confirmed service categories are present: `svc_desktop_laptop`, `svc_windows_software`, `svc_hardware_upgrade`, `svc_printer_service`, `svc_network_wifi`, `svc_business_it`.
5. **Two-Factor Operator Confirmation:**
   - Requires `--confirm-baseline` flag or `CONFIRM_BASELINE=true` environment variable.
6. **Zero Side Effects:**
   - Baselining executes **zero DDL commands**. It only marks version `001` in `schema_migrations` after full verification succeeds.

### Operational Distinction:
- **Fresh Staging / Production Database:** Run migration `001` normally (`node scripts/migrate.mjs`). Creates tables, constraints, indexes, seeds, and records migration `001`.
- **Pre-Existing Database Adoption:** Run `--baseline --confirm-baseline`. Executes `verifyCompleteSchema()`, verifies every table/column/constraint/seed, and only then records version `001` as applied without running DDL.

---

## 4. Backup/Restore Target-Safety Corrections

### Vulnerability Addressed
Simple word blacklists (e.g. checking for `prod` or `fly.dev`) fail if a production host uses an unlisted domain, custom IP address, or unexpected database name.

### Implemented Safeguards (`scripts/restore.sh` & `scripts/restore-guard.mjs`):
1. **Approved Host Allowlist:**
   - Default approved hosts: `localhost`, `127.0.0.1`, `::1`, `0.0.0.0`.
   - Any remote or unrecognized hostname is rejected immediately.
2. **Mandatory Disposable Database Name Marker:**
   - Target database name must explicitly contain one of: `_dev`, `_test`, `_disposable`, `_restore_test`, `mqtech_test`.
   - Target names like `mqtech_main`, `mqtech_production`, or `customer_db` are rejected immediately.
3. **Source and Destination Identity Conflict Check:**
   - If `SOURCE_DATABASE_URL` is set, verifies host and database name.
   - If source and destination resolve to the identical database, execution is aborted to prevent accidental self-clobbering.
4. **Masked Credential Logging:**
   - Parsed target URL displays `postgresql://<user>:***@<host>:<port>/<dbname>`, never printing plain-text passwords.
5. **Two-Factor Operator Confirmation:**
   - `CONFIRM_DESTRUCTIVE_RESTORE=true` is required.
   - `CONFIRM_RESTORE_DB_NAME="<exact_target_db_name>"` is required. Both must match.
6. **Encryption Status:**
   - Formally classified as **NOT IMPLEMENTED** internally. Decryption must occur externally before passing to `restore.sh`.

---

## 5. Updated Phase P5 Provider Runbook

### Modern Fly.io Managed Postgres (`fly mpg`)
Fly.io has introduced Fly Managed Postgres (`fly mpg`) as its official managed database service:
- Documentation: https://fly.io/docs/flyctl/mpg/ and https://fly.io/mpg/
- Command family: `fly mpg create`, `fly mpg attach`, `fly mpg list`, `fly mpg status`.

> [!WARNING]
> **DEPLOYMENT-IMPACTING OPERATION ALERT**
> 
> In the Fly.io architecture, executing:
> ```bash
> fly mpg attach <database-cluster-name> --app <web-app-name>
> ```
> does **NOT** merely save configuration. It automatically injects `DATABASE_URL` into the application's secret store, which **immediately triggers an automatic redeployment and machine reboot** of `<web-app-name>`.
> 
> Therefore, database attachment must be treated as a deployment-impacting release event requiring explicit operator authorization and prepared readiness healthchecks.

### Provider Comparison & Decision Matrix (Open Decision Gate):
The final choice of PostgreSQL provider remains open awaiting user approval:

| Provider Option | Architecture Type | Singapore (`sin`) Latency | Backup Automation | Cost Consideration |
| :--- | :--- | :--- | :--- | :--- |
| **Fly MPG** | Managed Cloud Postgres | Low (< 2ms internal) | Automated snapshots | Per-cluster managed fee |
| **Supabase** | Managed PostgreSQL + Auth | Low (~5-10ms in AWS sin) | Automated daily backups | Free tier / \$25 Pro |
| **Neon** | Serverless PostgreSQL | Low (~5-10ms in AWS sin) | Point-in-time restore | Usage-based / Free tier |
| **Self-Hosted** | Single Fly.io Machine + Volume | Low (< 1ms internal) | Script-driven (`backup.sh`) | Flat machine + volume cost |

### Corrected Staging / Production Deployment Procedure:

#### Phase P5.1: Staging Provisioning
```bash
# 1. Provision isolated staging database (e.g. via fly mpg or external provider)
fly mpg create --name mqtech-staging-db --region sin

# 2. Create isolated staging application
fly apps create mqtech-web-staging

# 3. Attach staging database (triggers initial deployment)
fly mpg attach mqtech-staging-db --app mqtech-web-staging

# 4. Set staging secrets (ADMIN_SESSION_SECRET >= 32 chars, one-time ADMIN_INIT_PASSWORD)
fly secrets set \
  ADMIN_SESSION_SECRET="<generated-64-char-random-hex>" \
  ADMIN_INIT_PASSWORD="<generated-24-char-staging-password>" \
  MQTECH_PUBLIC_ORIGIN="https://mqtech-web-staging.fly.dev" \
  --app mqtech-web-staging

# 5. Run migration runner against staging database
node scripts/migrate.mjs

# 6. Verify healthcheck endpoints:
#    - /api/health -> HTTP 200 (process liveness)
#    - /api/ready  -> HTTP 200 (database readiness)

# 7. Log in as initial admin and unset bootstrap password:
fly secrets unset ADMIN_INIT_PASSWORD --app mqtech-web-staging
```

#### Phase P5.2: Production Provisioning (Gated by Explicit User Authorization)
```bash
# Await explicit user authorization before running any command below:

# 1. Provision completely isolated production database
fly mpg create --name mqtech-prod-db --region sin

# 2. Create production web application
fly apps create mqtech-web

# 3. Attach production database (deployment event)
fly mpg attach mqtech-prod-db --app mqtech-web

# 4. Inject production secrets
fly secrets set \
  ADMIN_SESSION_SECRET="<production-unique-64-char-hex>" \
  ADMIN_INIT_PASSWORD="<production-unique-24-char-password>" \
  MQTECH_PUBLIC_ORIGIN="https://mqcomputech.com" \
  --app mqtech-web

# 5. Run production migration runner over pinned connection
node scripts/migrate.mjs

# 6. Immediate Administrator Password Rotation & Secret Pruning
#    - Admin logs in immediately and updates password (increments token_version)
#    - Unset bootstrap password secret:
fly secrets unset ADMIN_INIT_PASSWORD --app mqtech-web

# 7. DNS Configuration: Configure A/AAAA/CNAME records for mqcomputech.com ONLY after verification
```

---

## 6. Tests and Exact Results

All quality gates and test suites were executed locally and inspected. All passed with zero errors:

| Test / Gate | Command Executed | Result | Details |
| :--- | :--- | :--- | :--- |
| **ESLint** | `npm run lint` | **PASS (0 errors, 0 warnings)** | Clean across all source, script, and test files |
| **TypeScript** | `npm run typecheck` | **PASS (Exit 0)** | Strict mode, zero TypeScript diagnostics |
| **Automated Tests** | `npm test` | **PASS (101/101 tests passed)** | 16 test suites passed completely |
| **Production Build** | `npm run build` | **PASS (Exit 0)** | Standalone Next.js 16 build compiled successfully |
| **Migration Dry-Run** | `node scripts/migrate.mjs --dry-run` | **PASS (Exit 0)** | SHA-256 checksum and migration syntax verified |

### Test Suite Execution Summary (16 Suites, 101 Tests):
- `tests/p4_1_2_deployment_safety.test.mjs`: **11 passed** (Healthcheck config, migration baseline target & schema checks, restore target guard, self-clobbering prevention)
- `tests/p4_1_1_closeout.test.mjs`: **5 passed** (Role revocation, CSRF allowlist, dev memory policy, safe handlers)
- `tests/p4_1_final_security.test.mjs`: **15 passed** (Token versioning, logout revocation, fail-closed auth, liveness/readiness)
- `tests/p4_security_boundary.test.mjs`: **13 passed** (Memory prohibition, optimistic locking, bootstrap target validation)
- `tests/admin_api.test.mjs`: **7 passed** (Administrative triage, auth barriers, status updates, stats)
- `tests/api_endpoint.test.mjs`: **4 passed** (Customer intake, phone validation, password rejection, rate limit)
- `tests/auth_password.test.mjs`: **5 passed** (Scrypt hashing, unique salts, constant-time verification)
- `tests/auth_session.test.mjs`: **6 passed** (HMAC tokens, tamper detection, expiry, cookie extraction)
- `tests/db_schema.test.mjs`: **5 passed** (DDL constraints, enum types, history cascade, no passwords)
- `tests/env.test.mjs`: **2 passed** (Defaults, secret isolation)
- `tests/intake_validation.test.mjs`: **6 passed** (Delivery modes, phone format, credential rejection)
- `tests/rate_limiter.test.mjs`: **3 passed** (Sliding window, IP tracking, reset)
- `tests/reference_code.test.mjs`: **4 passed** (MQT- prefix, 1000 collision check, character ambiguity)
- `tests/repository.test.mjs`: **3 passed** (AWAITING_CONFIRMATION default, lookup by reference code)
- `tests/services.test.mjs`: **4 passed** (6 confirmed service categories, slug checks, delivery modes)
- `tests/status_lifecycle.test.mjs`: **8 passed** (Valid transitions, illegal jump blocking, terminal states)

---

## 7. Changed / Added Files Summary

| File Path | Action | Description |
| :--- | :--- | :--- |
| `fly.toml` | Modified | Corrected Fly.io healthcheck configuration semantics to separate `/api/ready` from `/api/health`. |
| `scripts/migrate.mjs` | Modified | Implemented `verifyCompleteSchema()` and required operator confirmation before baselining. |
| `scripts/restore.sh` | Modified | Integrated `scripts/restore-guard.mjs` for fail-closed target verification. |
| `scripts/backup.sh` | Modified | Enforced protected directory permissions and clarified NOT IMPLEMENTED encryption status. |
| `scripts/restore-guard.mjs` | Added | Dedicated target safety engine enforcing host allowlist, disposable markers, and two-factor confirmation. |
| `tests/p4_1_2_deployment_safety.test.mjs` | Added | 11 comprehensive unit tests covering healthcheck semantics, baseline schema verification, and restore safety. |
| `audit/P4_1_2_DEPLOYMENT_SAFETY_REPORT.md` | Added | Phase P4.1.2 deployment safety deliverable report. |

---

## 8. Git Status and Commit Baseline

- **Baseline Commit:** `1123428` (`feat(p4.1.1): closeout session revocation, csrf coverage, and deployment config`)
- **Working Tree:** All modifications and new files prepared for commit.
- **Uncommitted Changes:** Strictly confined to the 7 files listed in Section 7.

---

## 9. Explicitly Unexecuted Infrastructure Operations

In accordance with mandatory project rules, the following actions were **NOT executed**:

1. **NO Fly.io Commands Executed:** Zero `flyctl`, `fly`, or `fly mpg` commands were run.
2. **NO Cloud Databases Created:** No PostgreSQL database was provisioned.
3. **NO Container Deployments:** No container was pushed or deployed to Fly.io.
4. **NO DNS Records Created:** Domain `mqcomputech.com` was not modified.
5. **NO Production Credentials Created:** No production secrets were injected.
6. **NO Live Database Migration Executed:** Migrations were run exclusively in `--dry-run` inspection mode.
7. **NO Live Backup or Restore Executed:** Scripts were tested and verified via mock harnesses and static analysis.

---

## 10. Remaining Limitations

1. **Host Runtime Environment:** The local Windows host lacks a native PostgreSQL service and Docker daemon. Real network socket operations against PostgreSQL and container runtime testing must be performed on an isolated staging environment during Phase P5.
2. **At-Rest Backup Encryption:** Backup encryption remains an external responsibility (KMS envelope encryption or asymmetric GPG) to be implemented when backups are archived to off-site cloud storage.
3. **Database Provider Decision:** Selection of managed database provider (Fly MPG, Supabase, Neon) requires user approval of architecture and cost.

---

## 11. Go / No-Go Recommendation

### Recommendation: **GO FOR PHASE P5 (STAGING PROVISIONING ONLY)**

The codebase has achieved full engineering and deployment readiness:
- All 101 automated unit and security tests pass.
- Type checking and linting pass with zero diagnostics.
- Healthcheck semantics accurately reflect official Fly.io proxy routing behavior.
- Database baselining requires comprehensive schema and seed verification.
- Backup and restore targets fail closed with two-factor confirmation.
- Protected cloud resources remain 100% untouched.

> [!IMPORTANT]
> **COMPLETION HOLD-POINT REACHED**
> 
> Phase P4.1.2 is **100% complete**.
> 
> Work is halted at this gate. **No cloud infrastructure provisioning, database creation, database attachment, container deployments, or DNS modifications will be performed without your explicit authorization.**
