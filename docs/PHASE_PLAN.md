# MQTech Phased Implementation Plan

- **Document Version:** 1.1.0
- **Last Updated:** 2026-10-30
- **Visual Design Reference:** `references/Template-Sua-May-Tinh.html`
- **Current Phase:** Phase P0 (Discovery, Specification, and Design Integration)

---

## Phase Overview & Progress Tracking

```
┌────────────────────────────────────────────────────────┐
│ P0: Discovery, Design Reference, & Specification       │ ◄ CURRENT PHASE
├────────────────────────────────────────────────────────┤
│ P1: Engineering Foundation & Application Shell         │
├────────────────────────────────────────────────────────┤
│ P2: Public Website & Dual-Mode Request Intake Flow     │
├────────────────────────────────────────────────────────┤
│ P3: Administrative Intake Triage & Status Management   │
├────────────────────────────────────────────────────────┤
│ P4: Production Hardening, Verification, & Release      │
└────────────────────────────────────────────────────────┘
```

---

## Phase Breakdown

### P0 — Discovery, Design Reference Integration, and Specification
- **Focus:** Complete architectural discovery, integrate visual design reference, formalize business and technical requirements, define acceptance criteria, and safely inventory Fly.io hosting.
- **Key Deliverables:**
  - `audit/SKILLS_SYSTEM_INTEGRATION_AUDIT.md`: Skills system, agent compatibility, and workspace audit.
  - `docs/DESIGN_REFERENCE_ANALYSIS.md`: Exhaustive analysis of `Template-Sua-May-Tinh.html` (adopting visual characteristics; discarding unverified business claims and dummy widgets).
  - `docs/DESIGN_SYSTEM.md`: Tokens for color, typography, spacing, glassmorphism, responsive breakpoints, and component contracts.
  - `docs/BUSINESS_REQUIREMENTS.md`: MQTech business identity, 6 core service categories, dual delivery model, manual confirmation workflow, and anti-scope guardrails.
  - `docs/ACCEPTANCE_CRITERIA.md`: Verifiable quality gates across design fidelity, responsive UX, accessibility, and security.
  - `docs/FLYIO_SAFETY.md`: Inventory-only safety guidelines protecting existing cloud resources.
- **Phase Gate (Mandatory):** User reviews and approves P0 specifications before any website implementation begins.

---

### P1 — Engineering Foundation & Application Shell
- **Focus:** Initialize version-controlled repository, establish framework foundation, design tokens configuration, and database migrations.
- **Key Deliverables:**
  - Initialize Git repository, add `.gitignore`, and anchor `.agents/rules/` via root `AGENTS.md`.
  - Next.js (App Router), TypeScript (strict mode), and Tailwind CSS foundation configured with MQTech tokens.
  - PostgreSQL database schema, migrations, and ORM setup (candidate tables: `service_categories`, `services`, `service_requests`, `request_status_history`, `admin_users`).
  - Baseline verification scripts (`npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`).
  - Read-only inventory of Fly.io application resources and dependencies without modifying active services.
- **Phase Gate (Mandatory):** All automated baseline checks pass cleanly; architecture and database schema approved.

---

### P2 — Public Website & Request Intake Experience
- **Focus:** Implement the public-facing pages applying the approved Apple-grade visual design and dual-mode service request intake.
- **Key Deliverables:**
  - Sticky glass header with live status dot, brand squircle, and responsive mobile navigation sheet.
  - High-impact dark hero with ambient radial blue glows, display headline, dual pill CTAs, and telemetry diagnostic card.
  - Light canvas service catalog featuring the 6 confirmed service categories with checkmark perks and hover transitions.
  - Transparent 4-step repair process section (Intake -> Diagnosis -> Confirmation -> Handover).
  - Validated, accessible service request intake form with toggle between "Mang máy đến tiệm" and "Sửa chữa tận nơi tại Buôn Ma Thuột".
  - Confirmation feedback displaying random reference code and explicit notice: **"Chờ xác nhận qua Điện thoại / Zalo"**.
  - Local SEO metadata, OpenGraph tags, and valid structured data (LocalBusiness schema with confirmed fields only).
- **Phase Gate (Mandatory):** Mobile/desktop UX verified; form submission tested with valid and invalid inputs; zero unverified business facts exposed.

---

### P3 — Administrative Intake Triage & Status Management
- **Focus:** Implement authenticated administration interface for operational triage and request lifecycle tracking.
- **Key Deliverables:**
  - Secure server-side admin authentication with session cookies and rate limiting.
  - Request management dashboard: filter by status (`Chờ xác nhận`, `Đã xác nhận`, `Đang xử lý`, `Hoàn thành`, `Đã hủy`) and delivery mode.
  - Request detail view with customer contact information, problem description, and internal technical notes.
  - Timestamped status transition history.
  - End-to-end tests covering login, unauthorized access rejection, request status update, and IDOR prevention.
- **Phase Gate (Mandatory):** Authorization controls verified; Playwright E2E tests pass for all admin and public journeys.

---

### P4 — Production Hardening, Verification, & Release
- **Focus:** Comprehensive release auditing, backup verification, staging smoke tests, domain verification, and production release.
- **Key Deliverables:**
  - Full execution of `release-audit` workflow.
  - Complete security audit, accessibility audit (WCAG 2.1 AA), and performance audit (Core Web Vitals).
  - Database backup verification and documented rollback procedure.
  - Domain configuration for `mqcomputech.com` (only after ownership and DNS verification).
  - Production deployment to Fly.io strictly following `FLYIO_SAFETY.md` with explicit, itemized user approval for any infrastructure changes.
- **Phase Gate (Mandatory):** Release audit delivers formal GO recommendation; user provides explicit written authorization for production cutover.
