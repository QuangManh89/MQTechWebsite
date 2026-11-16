# MQTech Phased Implementation Plan & Status Ledger

- **Document Version:** 2.0.0
- **Last Updated:** 2026-11-02
- **Visual Design Reference:** `references/Template-Sua-May-Tinh.html`
- **Current Phase:** All Engineering Phases (P0 - P5) COMPLETED. Ready for Operator Staging Deployment.

---

## Phase Overview & Progress Tracking

```
┌────────────────────────────────────────────────────────┐
│ P0: Discovery, Design Reference, & Specification       │ [✔ COMPLETED]
├────────────────────────────────────────────────────────┤
│ P1: Engineering Foundation & Application Shell         │ [✔ COMPLETED]
├────────────────────────────────────────────────────────┤
│ P2: Public Website & Dual-Mode Request Intake Flow     │ [✔ COMPLETED]
├────────────────────────────────────────────────────────┤
│ P3: Administrative Intake Triage & Status Management   │ [✔ COMPLETED]
├────────────────────────────────────────────────────────┤
│ P4: Production Hardening, Verification, & Readiness    │ [✔ COMPLETED]
├────────────────────────────────────────────────────────┤
│ P5: Free-Tier Staging Prep & 3-Bucket R2 Architecture  │ [✔ COMPLETED]
├────────────────────────────────────────────────────────┤
│ HANDOVER: Staging Cloud Deployment & Production Cutover│ [READY FOR DEPLOY]
└────────────────────────────────────────────────────────┘
```

---

## Detailed Phase Status

### P0 — Discovery, Design Reference Integration, and Specification
- **Status:** **COMPLETED**
- **Deliverables:**
  - `audit/SKILLS_SYSTEM_INTEGRATION_AUDIT.md`: Skills system, agent compatibility, and workspace audit.
  - `docs/DESIGN_REFERENCE_ANALYSIS.md`: Exhaustive analysis of `Template-Sua-May-Tinh.html` (adopting visual characteristics; discarding unverified business claims and dummy widgets).
  - `docs/DESIGN_SYSTEM.md`: Tokens for color, typography, spacing, glassmorphism, responsive breakpoints, and component contracts.
  - `docs/BUSINESS_REQUIREMENTS.md`: MQTech business identity, 6 core service categories, dual delivery model, manual confirmation workflow, and anti-scope guardrails.
  - `docs/ACCEPTANCE_CRITERIA.md`: Verifiable quality gates across design fidelity, responsive UX, accessibility, and security.
  - `docs/FLYIO_SAFETY.md`: Inventory-only safety guidelines protecting existing cloud resources (`openwebui-mqtech`, `2871574ae574e8`, `vol_4m3m9jdgen55793v`).

---

### P1 — Engineering Foundation & Application Shell
- **Status:** **COMPLETED**
- **Deliverables:**
  - Next.js 16 (App Router), TypeScript (strict mode), and Tailwind CSS v4 foundation configured with MQTech tokens.
  - Initial relational database schema: `migrations/001_initial_schema.sql` (`services`, `service_requests`, `request_status_history`, `admin_users`).
  - Baseline verification scripts (`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`).

---

### P2 — Public Website & Request Intake Experience
- **Status:** **COMPLETED**
- **Deliverables:**
  - Sticky glass header with live status dot, brand squircle, and responsive mobile navigation sheet.
  - High-impact dark hero with ambient radial blue glows, display headline, dual pill CTAs, and telemetry diagnostic card.
  - Light canvas service catalog featuring the 6 confirmed service categories with checkmark perks and hover transitions.
  - Transparent 4-step repair process section (Intake -> Diagnosis -> Confirmation -> Handover).
  - Validated, accessible service request intake form with toggle between "Mang máy đến tiệm" and "Sửa chữa tận nơi tại Buôn Ma Thuột".
  - Confirmation feedback displaying random reference code and explicit notice: **"Chờ xác nhận qua Điện thoại / Zalo"**.
  - Local SEO metadata, OpenGraph tags, and valid structured data (LocalBusiness schema with confirmed fields only).

---

### P3 — Administrative Intake Triage & Status Management
- **Status:** **COMPLETED**
- **Deliverables:**
  - Secure server-side admin authentication with HMAC-SHA256 session cookies and CSRF protection.
  - Request management dashboard: filter by status (`Chờ xác nhận`, `Đã xác nhận`, `Đang xử lý`, `Hoàn thành`, `Đã hủy`) and delivery mode.
  - Request detail view with customer contact information, problem description, and internal technical notes.
  - Timestamped status transition history with optimistic concurrency control.
  - Automated tests covering login, unauthorized access rejection, request status update, and IDOR prevention.

---

### P4 — Production Hardening & Remediation (P4.1 - P4.1.5)
- **Status:** **COMPLETED**
- **Deliverables:**
  - Fail-closed environment validation (`src/lib/env.ts`): unconditionally forbids in-memory fallback in staging/production.
  - Immediate token version revocation: role changes, password changes, or account deactivation revoke all active sessions.
  - Credential isolation: `scripts/credential-helper.mjs` generates secure `pg_service.conf` with 0600 permissions in RAM tmpfs. Zero passwords in command-line arguments.
  - Restore Guard (`scripts/restore-guard.mjs`): prevents accidental restore into production or remote databases; enforces atomic `--single-transaction --exit-on-error`.

---

### P5 — Free-Tier Staging Preparation & Cloudflare R2 Architecture
- **Status:** **COMPLETED**
- **Deliverables:**
  - Decoupled architecture: Web App (`mqtech`) on stateless machine + Database App (`mqtech-db`) on private 6PN WireGuard mesh with 1GB NVMe volume.
  - Memory optimization for 256MB RAM: `postgresql.conf` tuned with `shared_buffers = 32MB`, `work_mem = 1MB`, `max_connections = 10`. Next.js server image optimization disabled (`unoptimized: true`).
  - Three distinct Cloudflare R2 buckets for physical access isolation:
    1. `mqtech-media-staging` (Public media)
    2. `mqtech-attachments-staging` (Strictly private customer attachments)
    3. `mqtech-db-backups-staging` (Strictly private encrypted database dumps)
  - Dedicated authenticated API route `POST /api/admin/attachments/presign-get` for short-lived (300s) presigned GET access to customer attachments.
  - Verified Fly configuration schemas (`fly.toml` canonical, `infra/postgres/fly.toml`) with TCP checks and pinned `[[vm]]`.
  - Comprehensive report: `audit/P5_FINAL_REPORT.md` and submission package `mqtech-p5-submission.zip`.

---

## Final Handover & Deployment Gate

The local engineering and verification phases are 100% complete with 152 automated tests passing, 0 TypeScript errors, 0 ESLint warnings, and a clean Next.js Turbopack build.

The next step is the **Operator Staging Provisioning**:
1. Operator issues Fly.io provisioning commands using `flyctl` when authorized.
2. Operator creates the 3 Cloudflare R2 buckets.
3. Operator runs database migrations via temporary WireGuard proxy session.
4. Operator verifies staging smoke tests on `https://mqtech.fly.dev`.
