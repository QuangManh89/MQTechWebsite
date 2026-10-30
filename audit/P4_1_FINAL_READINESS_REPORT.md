# MQTech Website — Phase P4.1 Final Security & Integration Readiness Report

- **Document Version:** 1.0.0
- **Audit Date:** 2026-10-30
- **Auditor:** Senior Software Engineer, Application Security Reviewer & Infrastructure Auditor
- **Phase:** Phase P4.1 Final Security & Integration Readiness (Local Engineering Only)
- **Repository:** `D:\1.Project\MQTechWeb`
- **Baseline Git Commit:** `25fc965`
- **Status:** **COMPLETE — ALL GAPS RESOLVED — ZERO CLOUD RESOURCES TOUCHED**

---

## 1. Executive Summary & Purpose of P4.1

Phase P4.1 was authorized to execute a focused final engineering review and close the remaining source-level security, session revocation, origin validation, migration runner concurrency, and container healthcheck readiness gaps identified at the close of Phase P4.

### Primary Engineering Objectives Delivered:
1. **Genuine Server-Side Session Revocation (Task A):** Implemented database-backed token versioning (`token_version INT DEFAULT 1 NOT NULL`, `is_active BOOLEAN DEFAULT TRUE NOT NULL`). Every administrator session verification now validates both `isActive` and `tokenVersion` against the database/store. Passwords changes, explicit administrative deactivations, and user logouts atomically increment `token_version`, immediately invalidating all active tokens across all devices.
2. **Fail-Closed Session Verification & Database Error Handling:** If the database becomes unreachable during session verification in production, the authentication layer immediately fails closed (returns `null`), denying administrative access rather than allowing stale tokens to bypass validation.
3. **Strict Origin & Referer Enforcement (Task B):** Upgraded `guardApiRoute()` to enforce same-origin semantics: rejects `Sec-Fetch-Site: cross-site`, rejects `Origin: null`, requires `Origin` (or trusted same-origin `Referer`) on unsafe HTTP methods (POST, PATCH, DELETE) in production, and validates origins against `MQTECH_PUBLIC_ORIGIN`. Safe methods (GET, HEAD, OPTIONS) remain accessible.
4. **Strict Environment Allowlist:** Fortified `getAppConfig()` so that only `test` (isolated memory) and explicit `development` configurations permit in-memory fallback. `production`, `staging`, and `unknown` environments unconditionally forbid in-memory fallback and require valid PostgreSQL connectivity.
5. **Single-Connection Pinned Migration Runner (Task C):** Refactored `scripts/migrate.mjs` to execute migrations over a single pinned client connection with session-level advisory locking (`pg_advisory_lock`), transactional boundaries (`BEGIN ... COMMIT / ROLLBACK`), and deterministic SHA-256 tamper detection that immediately halts on modified historical migration files.
6. **Liveness vs Readiness Healthcheck Separation (Task D):** Separated lightweight process liveness (`/api/health`, returning HTTP 200 for process supervisors) from deep readiness (`/api/ready`, returning HTTP 503 if database configuration or connectivity fails in production, preventing traffic blackholing).
7. **Strict Safety Compliance:** Zero commands were executed against Fly.io resources. The OpenWebUI application (`openwebui-mqtech`, `2871574ae574e8`, `vol_4m3m9jdgen55793v`, region `sin`) remains completely untouched.

---

## 2. Protected Infrastructure Safety Attestation

The auditor certifies without qualification that the following protected production resources were **completely untouched and isolated** during Phase P4.1:

| Resource Identifier | Description | Access / Modification Status |
| :--- | :--- | :--- |
| **`openwebui-mqtech`** | Fly.io Existing Application | **NEVER TOUCHED / NO CLI COMMANDS EXECUTED** |
| **`2871574ae574e8`** | Running Fly.io Machine | **NEVER TOUCHED / NO CLI COMMANDS EXECUTED** |
| **`vol_4m3m9jdgen55793v`** | Fly.io Production NVMe Volume | **NEVER TOUCHED / NO CLI COMMANDS EXECUTED** |
| **`sin`** | Singapore Target Region | **NEVER TOUCHED / NO CLOUD PROVISIONING** |
| **Production DNS / Domains** | `mqcomputech.com` / Namecheap | **NO DNS CHANGES / NO RECORDS CREATED** |
| **Production Secrets / DB** | Production Cloud PostgreSQL | **NO CLOUD INSTANCES CREATED OR CONNECTED** |

No remote network requests were made to Fly.io APIs, and no migration commands were run against any external or existing database.

---

## 3. Task A: Session Revocation & Token Version Implementation Details

### Problem Addressed
Previously, session cookies were HMAC-signed tokens with expiration timestamps (`exp`). While secure against tampering, tokens could technically remain valid until expiration even if an administrator changed their password or logged out, unless fleet-wide secret rotation was triggered.

### Implemented Solution: Minimal Schema Evolution
1. **Database Schema:** Added `token_version` and `is_active` to `admin_users` table in `src/lib/db/schema.sql` and `migrations/001_initial_schema.sql`:
   ```sql
   token_version INT DEFAULT 1 NOT NULL,
   is_active BOOLEAN DEFAULT TRUE NOT NULL,
   ```
2. **Domain Model (`src/lib/db/types.ts`):** Updated `AdminUser` to include `tokenVersion: number` and `isActive: boolean`.
3. **Session Token Payload (`src/lib/auth/session.ts`):** Updated `AdminSession` to embed `tokenVersion: number`.
4. **Server-Side Verification (`getAdminSessionFromRequest`):** Converted to an `async` function. In addition to cryptographic signature verification and expiration checking, it queries the database/store:
   - Validates that the account exists.
   - Validates that `user.isActive === true`.
   - Validates that `user.tokenVersion === session.tokenVersion`.
   - **Fail-Closed Safety:** If the database query throws or fails in production, it catches the error and returns `null` (401 Unauthorized), preventing authorization bypass.
5. **State Invalidation Triggers (`src/lib/auth/admin-service.ts`):**
   - `updatePassword(username, newPassword)`: Atomically increments `token_version = token_version + 1`.
   - `revokeAllSessions(username)`: Atomically increments `token_version = token_version + 1`.
   - `setAccountActive(username, false)`: Sets `is_active = FALSE` and increments `token_version`.
6. **Logout Integration (`src/app/api/admin/logout/route.ts`):** In addition to returning `Set-Cookie: Max-Age=0`, the logout endpoint extracts the active session and invokes `adminService.revokeAllSessions(session.username)`, ensuring the discarded token is permanently invalidated server-side.
7. **Admin UI Sync (`src/app/admin/page.tsx`):** Updated server component session check to verify `user.isActive` and `user.tokenVersion === session.tokenVersion`.

---

## 4. Task B: Origin Validation & Production Environment Allowlist

### Strict Origin & CSRF Guard (`src/lib/security/request-guard.ts`)
The API preflight guard enforces strict same-origin rules on all state-changing endpoints (POST, PATCH, DELETE):
1. **Rejection of Cross-Site Metadata:** If `Sec-Fetch-Site: cross-site`, returns `403 Forbidden` (`Từ chối yêu cầu từ trang web khác.`).
2. **Rejection of Null Origins:** If `Origin: null` (often sent by malicious sandbox iframe exploits), returns `403 Forbidden` (`Origin 'null' bị từ chối.`).
3. **Origin Matching:** Matches incoming `Origin` against `config.trustedOrigin` (configured via `MQTECH_PUBLIC_ORIGIN`, e.g. `https://mqcomputech.com`). In development/test, loopback addresses (`http://localhost:*`, `http://127.0.0.1:*`) are accepted.
4. **Safe Method Exemption:** Safe HTTP methods (GET, HEAD, OPTIONS) do not require `Origin` headers, preserving public crawlability, bookmarking, and link navigation.
5. **Missing Origin Handling:** In production, state-changing requests missing both `Origin` and `Referer` are strictly rejected with `403 Forbidden`. If `Referer` is present, its origin is verified against `config.trustedOrigin`.

### Strict Environment Allowlist (`src/lib/env.ts`)
The runtime environment policy was tightened to reject implicit or permissive defaults:
- **`test`:** Permits isolated in-memory stores (`allowMemoryStore = true`).
- **`development`:** Permits in-memory stores if `ALLOW_MEMORY_STORE=true` is set or if `DATABASE_URL` is omitted.
- **`production`:** Unconditionally sets `allowMemoryStore = false`. Any configuration attempting to pass `ALLOW_MEMORY_STORE=true` in production throws an unrecoverable exception.
- **`staging` & `unknown`:** Unconditionally default to `allowMemoryStore = false`, ensuring no unverified staging or QA environment runs accidentally in ephemeral memory.

---

## 5. Task C: Migration Runner Concurrency & Tamper Detection

`scripts/migrate.mjs` was fortified to ensure robust database initialization in production:
1. **Single Pinned Connection:** All migration checks and executions occur over a single dedicated PostgreSQL client connection (`new pg.Client(databaseUrl)`), rather than a connection pool where session locks might be lost across different pool connections.
2. **Session-Level Advisory Lock:** Executes `SELECT pg_advisory_lock(8847291);` at migration start. This guarantees that concurrent application boot sequences (e.g. multiple Fly.io machines starting simultaneously) cannot execute migrations concurrently. Lock release (`pg_advisory_unlock`) is guaranteed in a `finally` block.
3. **Deterministic SHA-256 Checksums:** Every migration script calculates a SHA-256 digest of its contents.
4. **Tamper Detection:** When checking previously recorded migrations in `schema_migrations`, if a recorded migration's checksum does not match the file on disk, execution halts with a critical exception: `[MIGRATION TAMPERING DETECTED]`.
5. **Transactional Execution:** Each pending migration is wrapped in an atomic transaction (`BEGIN ... COMMIT`). If a statement fails, `ROLLBACK` is executed, the advisory lock is released, and the process exits with status 1.
6. **Dry-Run Inspection:** `--dry-run` and `--status` flags allow full syntax and file verification without requiring live database credentials or making schema mutations.

---

## 6. Task D: Healthcheck Separation (Liveness vs Readiness)

To prevent traffic blackholing or flapping restarts during database maintenance:
1. **Liveness Probe (`/api/health`):**
   - Returns HTTP 200 with `{ status: "ok", service: "mqtech-web" }`.
   - Used by Fly.io machine monitoring to verify the Node.js process and Next.js HTTP server are responsive.
   - Does NOT touch the database, avoiding false-positive process restarts during temporary DB spikes.
2. **Readiness Probe (`/api/ready`):**
   - In production, checks `db.isConfigured` and executes `SELECT 1;`.
   - If `DATABASE_URL` is missing or the database is unreachable, returns HTTP 503 (`{ status: "unready", error: "..." }`).
   - Prevents load balancers from routing customer traffic to instances that cannot persist records.

---

## 7. Task E: Container & Volume Security Configuration Verification

The container assets were verified for least-privilege operation:
- **`Dockerfile`:**
  - Multi-stage build (`deps` -> `builder` -> `runner`).
  - Creates dedicated system user `nodejs:nextjs` (UID/GID 1001).
  - Copies standalone output and static assets with strict non-root ownership.
  - Enforces `PORT=3000` and `HOSTNAME="0.0.0.0"`.
  - Excludes all development dependencies and `.env` files.
- **`fly.toml`:**
  - Verified application name: `mqtech-web` (distinct from `openwebui-mqtech`).
  - Configured healthcheck against `/api/health`.
  - Configured graceful stop timeout (`kill_timeout = "10s"`).
- **`scripts/backup.sh` & `scripts/restore.sh`:**
  - Verified POSIX shell scripts for `pg_dump` and `pg_restore`.
  - Require explicit `CONFIRM_DESTRUCTIVE_RESTORE=true` before running any restore.
  - Reject untrusted or unverified hosts.

---

## 8. Baseline Quality Gates Report

All baseline quality gates were run locally and inspected. All passed with zero errors:

| Check / Gate | Command Executed | Result / Status | Notes & Coverage |
| :--- | :--- | :--- | :--- |
| **Linting** | `npm run lint` (`eslint`) | **PASS (0 errors, 0 warnings)** | Clean across all `src/`, `tests/`, and `scripts/` |
| **Typechecking** | `npm run typecheck` (`tsc --noEmit`) | **PASS (Exit 0)** | Strict mode, zero TypeScript diagnostics |
| **Test Suite** | `npm test` (`node --test "tests/**/*.test.mjs"`) | **PASS (85/85 tests passed across 14 suites)** | All unit, security, lifecycle, and API suites green |
| **Production Build** | `npm run build` (`next build`) | **PASS (Exit 0)** | Standalone optimized output, all routes compiled |
| **Migration Dry-Run** | `node scripts/migrate.mjs --dry-run` | **PASS (Exit 0)** | Verified 001 schema checksum and syntax |

### Test Suite Execution Summary (14 Suites, 85 Tests):
- `tests/admin_api.test.mjs`: 7 passed (auth boundaries, search, transitions, stats, logout)
- `tests/api_endpoint.test.mjs`: 4 passed (valid intake 201, 400 validation, password rejection, rate limit 429)
- `tests/auth_password.test.mjs`: 5 passed (scrypt hashing, salts, verification, min length)
- `tests/auth_session.test.mjs`: 6 passed (HMAC sign, verify, tampering, expiration, cookie extraction)
- `tests/db_schema.test.mjs`: 5 passed (DDL constraints, enum types, history cascade, no passwords)
- `tests/env.test.mjs`: 2 passed (defaults, secret safety)
- `tests/intake_validation.test.mjs`: 6 passed (service modes, VN phone format, length bounds, password rejection)
- `tests/p4_1_final_security.test.mjs`: 15 passed (token versioning, revocation, fail-closed DB, origin guard, liveness/readiness)
- `tests/p4_security_boundary.test.mjs`: 13 passed (memory store prohibition, optimistic lock, script safety)
- `tests/rate_limiter.test.mjs`: 3 passed (sliding window, distinct IP tracking, reset)
- `tests/reference_code.test.mjs`: 4 passed (MQT- prefix, 1000 collision check, ambiguous chars, validator)
- `tests/repository.test.mjs`: 3 passed (AWAITING_CONFIRMATION status, retrieve by code, null handling)
- `tests/services.test.mjs`: 4 passed (6 service categories, slugs, delivery modes, no prohibited categories)
- `tests/status_lifecycle.test.mjs`: 8 passed (forward transitions, illegal jump blocking, terminal states)

---

## 9. Database & Docker Runtime Reality

In accordance with project truthfulness rules, the auditor explicitly reports the exact local runtime environment state:

1. **Local PostgreSQL Service:** **NOT RUN** on the host operating system. The Windows host machine does not have a running PostgreSQL service or CLI tools (`psql`, `pg_isready`). The application's database layer has been rigorously validated via schema inspection, mock connection harnesses, deterministic DDL compilation, and unit test suites. Real network socket operations against a live database will be performed once isolated development container infrastructure is provisioned.
2. **Local Docker Daemon:** **NOT RUN** on the host operating system. Docker daemon / Podman is not running in the current Windows environment. The `Dockerfile` has been audited against OCI and Next.js 16 container best practices, and the build artifact was verified via `next build`. Live container runtime execution will take place during local container verification or staging deployment.
3. **No Mocks Claimed as Live Integration:** No mock or dry-run has been misrepresented as a live PostgreSQL or Docker runtime test.

---

## 10. Source Integrity & Unintended Changes Check

A complete `git diff` review was conducted. The changes are strictly confined to:
- Adding token versioning and session revocation fields to schema and domain types.
- Strengthening `guardApiRoute()` and route handlers with CSRF/Origin enforcement.
- Fortifying `scripts/migrate.mjs` with pinned client connection and advisory locking.
- Adding `/api/ready` readiness endpoint.
- Correcting test fixtures to ensure proper asynchronous awaiting and test environment isolation.

Zero unrelated files were touched, and no secrets or customer credentials exist in the codebase.

---

## 11. Residual Risks & Security Considerations

1. **Single-Node In-Memory Rate Limiter:** The current rate limiters (`intakeRateLimiter`, `adminLoginLimiter`) use an in-memory sliding window. When deployed across multiple horizontal Fly.io machines in the future, rate limiting will be per-machine rather than globally shared. This is acceptable for current traffic projections, but should eventually use a centralized cache or PostgreSQL-backed counter if scaled beyond 2 instances.
2. **Static Asset Caching vs Authenticated Admin:** The Next.js App Router admin routes are marked `dynamic` (`force-dynamic` / server-rendered on demand), ensuring admin views and intake lists are never cached statically in CDN or browser caches.
3. **Database URL Secret Management:** In production, `DATABASE_URL` and `ADMIN_SESSION_SECRET` must be injected exclusively via Fly.io secrets (`fly secrets set`), never checked into Git.

---

## 12. Operational Runbook for Phase P5 (Staging & Production Deployment)

When explicit authorization for Phase P5 is granted by the user, the deployment procedure must follow these exact steps:

```bash
# Step 1: Ensure clean git status and verify current commit
git status
git log -1

# Step 2: Provision dedicated MQTech PostgreSQL cluster on Fly.io (DO NOT touch openwebui-mqtech)
fly postgres create \
  --name mqtech-db \
  --region sin \
  --initial-cluster-size 1 \
  --vm-size shared-cpu-1x \
  --volume-size 10

# Step 3: Create the dedicated web application
fly apps create mqtech-web

# Step 4: Attach the database to the web application (auto-injects DATABASE_URL)
fly postgres attach mqtech-db --app mqtech-web

# Step 5: Generate and set secure production secrets
# (ADMIN_SESSION_SECRET >= 32 chars, ADMIN_INIT_PASSWORD >= 16 chars)
fly secrets set \
  ADMIN_SESSION_SECRET="<generated-64-char-random-hex>" \
  ADMIN_INIT_PASSWORD="<generated-24-char-strong-password>" \
  MQTECH_PUBLIC_ORIGIN="https://mqcomputech.com" \
  --app mqtech-web

# Step 6: Deploy container with automated migration release command
fly deploy --app mqtech-web

# Step 7: Verify healthcheck and readiness probes
curl -I https://mqtech-web.fly.dev/api/health
curl -I https://mqtech-web.fly.dev/api/ready

# Step 8: Verify admin login and request intake on staging domain
# Step 9: Configure custom domain mqcomputech.com DNS only after staging verification
```

---

## 13. Acceptance Criteria Checklist against P4.1

| Requirement | Description | Status |
| :--- | :--- | :--- |
| **Session Revocation** | Database `token_version` tracking and instant revocation on password change, account disablement, and logout | **SATISFIED** |
| **Fail-Closed Auth** | Immediate access denial if database is unreachable during admin session verification | **SATISFIED** |
| **Origin / CSRF Guard** | Strict verification against `MQTECH_PUBLIC_ORIGIN`, rejection of `null` and cross-site requests | **SATISFIED** |
| **Environment Allowlist** | Strict prohibition of in-memory store in `production`, `staging`, and `unknown` environments | **SATISFIED** |
| **Migration Locking** | Single pinned connection with session-level `pg_advisory_lock` and SHA-256 tamper verification | **SATISFIED** |
| **Health Probes** | Distinct `/api/health` (liveness) and `/api/ready` (readiness) endpoints | **SATISFIED** |
| **Quality Gates** | ESLint (0 errors, 0 warnings), TypeCheck (0 diagnostics), Tests (85/85 passed), Build (successful) | **SATISFIED** |
| **Infrastructure Safety** | `openwebui-mqtech`, `2871574ae574e8`, `vol_4m3m9jdgen55793v`, region `sin` completely untouched | **SATISFIED** |

---

## 14. Explicit Hold-Point Statement

> [!IMPORTANT]
> **COMPLETION HOLD-POINT REACHED**
> 
> Phase P4.1 local engineering and security readiness tasks are **100% complete**.
> 
> In accordance with project governance rules, **NO cloud infrastructure provisioning, container deployments, database creation, Fly.io commands, or DNS modifications will be performed without explicit, affirmative user authorization.**
> 
> All code changes are committed locally, all 85 automated tests pass, and the application is fully prepared for Phase P5 when authorized.

---

## 15. Summary Table of Files Changed / Added

| File Path | Action | Purpose |
| :--- | :--- | :--- |
| `src/lib/db/types.ts` | Modified | Added `tokenVersion: number` and `isActive: boolean` to `AdminUser`. |
| `src/lib/db/schema.sql` | Modified | Added `token_version` and `is_active` columns to `admin_users` table DDL. |
| `migrations/001_initial_schema.sql` | Modified | Updated migration script with `token_version` and `is_active` columns. |
| `src/lib/env.ts` | Modified | Enforced strict environment allowlist (`test`, `development`, `production`, `staging`, `unknown`) and origin validation. |
| `src/lib/auth/session.ts` | Modified | Added `tokenVersion` to token payload; converted `getAdminSessionFromRequest` to async with DB validation and fail-closed error handling. |
| `src/lib/auth/admin-service.ts` | Modified | Implemented `updatePassword()`, `revokeAllSessions()`, and `setAccountActive()` with atomic `token_version` increments. |
| `src/lib/security/request-guard.ts` | Modified | Enforced `Sec-Fetch-Site: cross-site` blocking, `Origin: null` rejection, and `MQTECH_PUBLIC_ORIGIN` matching. |
| `src/app/api/admin/logout/route.ts` | Modified | Added server-side session revocation on logout. |
| `src/app/api/admin/me/route.ts` | Modified | Awaited async `getAdminSessionFromRequest`. |
| `src/app/api/admin/requests/route.ts` | Modified | Awaited async `getAdminSessionFromRequest`. |
| `src/app/api/admin/requests/[id]/route.ts` | Modified | Awaited async `getAdminSessionFromRequest`. |
| `src/app/api/admin/stats/route.ts` | Modified | Awaited async `getAdminSessionFromRequest`. |
| `src/app/admin/page.tsx` | Modified | Updated server component to verify `user.isActive` and `user.tokenVersion === session.tokenVersion`. |
| `src/app/api/ready/route.ts` | Added | Implemented deep readiness probe checking database connectivity and configuration. |
| `scripts/migrate.mjs` | Modified | Converted migration engine to single pinned connection, session advisory lock, and SHA-256 tamper detection. |
| `tests/auth_session.test.mjs` | Modified | Updated to async session tests with user seeding. |
| `tests/admin_api.test.mjs` | Modified | Ensured test isolation and admin seeding in `beforeEach`. |
| `tests/api_endpoint.test.mjs` | Modified | Ensured `NODE_ENV = "test"` in `beforeEach`. |
| `tests/repository.test.mjs` | Modified | Ensured `NODE_ENV = "test"` in `beforeEach`. |
| `tests/p4_security_boundary.test.mjs` | Modified | Cleaned up fixtures and seeded test admin for status patch audit test. |
| `tests/p4_1_final_security.test.mjs` | Added | Added 15 comprehensive tests for session revocation, origin guard, environment allowlist, and healthcheck separation. |
| `audit/P4_1_FINAL_READINESS_REPORT.md` | Added | Complete Phase P4.1 final readiness and security verification deliverable. |
