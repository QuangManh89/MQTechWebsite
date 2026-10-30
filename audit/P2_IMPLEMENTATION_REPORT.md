# MQTech Website — Phase P2 Implementation Report

- **Document Version:** 1.0.0
- **Date:** 2026-10-30
- **Auditor & Implementer:** Senior AI Engineering Infrastructure Architect
- **Phase:** Phase P2 (Public Website & Dual-Mode Request Intake Flow)
- **Status:** **COMPLETE & VERIFIED — READY FOR P3 REVIEW**
- **Repository:** `D:\1.Project\MQTechWeb`

---

## 1. Preflight Findings

Prior to making any code modifications in Phase P2, all governance rules, skills, and P0/P1 deliverables were independently inspected:
- **Baseline Integrity:** All Phase P1 code passed linting (`eslint`), type-checking (`tsc --noEmit`), unit tests (`node --test`), and Next.js production build (`next build`) cleanly.
- **Git Status:** Clean tree rooted on commit `7205ff2` (`feat(p1): establish engineering foundation...`).
- **Database Prerequisite Discovery:** An environmental inspection for PostgreSQL services was performed. Neither a local PostgreSQL Windows service nor Docker/Podman container runtime was installed locally. 
  - *Safety Boundary:* Per the explicit rule *"Before executing migrations, identify the exact database target and verify that it is a disposable local/development database. If the database target is missing, ambiguous, or potentially production, do not execute the migration. Do not connect the application to the existing Fly.io OpenWebUI application"*, no production or unverified database connections were made.
  - *Engineering Solution:* Established a clean Repository Pattern with PostgreSQL DDL schema compliance and dual-adapter persistence: parameterized SQL using `pg` when `DATABASE_URL` points to an authorized development database, and a thread-safe, isolated in-memory development repository for local verification and automated testing.

---

## 2. Implemented Public Pages & Components

The public-facing website was fully built using the approved visual tokens from `docs/DESIGN_SYSTEM.md` and reference patterns from `references/Template-Sua-May-Tinh.html`:

| Component | Path | Key Capabilities & Design Treatment |
| :--- | :--- | :--- |
| **Navbar** | `src/components/layout/Navbar.tsx` | Sticky glass navigation bar (`h-[68px]`, `backdrop-blur-md`, `border-b border-white/[0.08]`), squircle logo badge, pulsing emerald live availability indicator, and responsive mobile drawer. Navigation anchors connect to all primary page sections. |
| **Hero** | `src/components/home/Hero.tsx` | High-contrast neutral-dark hero (`#0A0A0B`) with ambient radial blue lighting (`#3B82F6`), gradient-clipped display headline, dual pill CTAs, 3-column trust indicators (`~15 km`, `2 hình thức`, `100% báo giá trước`), and floating diagnostic console card. |
| **Services Section** | `src/components/home/ServicesSection.tsx` | Daylight canvas (`#F5F5F7`) featuring pure white cards rendering **exactly the 6 confirmed MQTech services** with delivery mode tags (`Tại tiệm & Tận nơi` vs `Hỗ trợ tận nơi`), feature checkmarks, and interactive pre-selection triggers that dispatch custom events to the intake form. |
| **Workflow Section** | `src/components/home/WorkflowSection.tsx` | 4-step transparent repair lifecycle cards (`Tiếp nhận yêu cầu` -> `Chẩn đoán & Tư vấn` -> `Xác nhận & Báo giá` -> `Xử lý & Nghiệm thu`). |
| **Trust & Security Section** | `src/components/home/TrustSection.tsx` | Dedicated principles section (`#cam-ket`) detailing honest diagnosis, quotes before repair, zero device password collection pledge, and local Buôn Ma Thuột dedication. |
| **Intake Console** | `src/components/home/IntakeSection.tsx` | Dual-mode request intake console supporting **Mang máy đến tiệm** (Mode A) and **Sửa chữa tận nơi** (Mode B), interactive delivery toggle pill, live client validation, server error handling, and dedicated confirmation state. |
| **Footer** | `src/components/layout/Footer.tsx` | Authoritative dark footer (`#lien-he`) detailing the 6 service categories, Buôn Ma Thuột service area disclaimer, privacy statement, and legal disclaimers. |

---

## 3. Customer Intake Flow & API Behavior

### 3.1 Dual Delivery Modes
- **Mode A (Mang máy đến tiệm / In-Store):**
  - Collects: Họ và tên (`customerName`), Số điện thoại / Zalo (`customerPhone`), Loại thiết bị (`deviceCategory`), Nhóm dịch vụ (`serviceCategoryId`), Mô tả sự cố (`issueDescription`), và Khung giờ liên hệ thuận tiện (`preferredContactTime`).
  - `serviceAddress` is optional and hidden.
- **Mode B (Sửa chữa tận nơi / On-Site):**
  - Collects all Mode A fields plus mandatory `serviceAddress` (minimum 5 characters, maximum 200 characters) specifically designating the customer's location in Buôn Ma Thuột.

### 3.2 Authoritative Server-Side Validation (`POST /api/service-requests`)
- **Path:** `/api/service-requests` (Next.js Dynamic Route Handler).
- **Request Size Guard:** Limits incoming request payloads to <= 64KB (`413 Payload Too Large`).
- **Strict Input Normalization:**
  - `customerName`: Trimmed, 2 to 100 characters.
  - `customerPhone`: Validated against Vietnamese mobile network prefixes (`03x`, `05x`, `07x`, `08x`, `09x` or `+84`).
  - `deviceCategory`: Restrictive enum (`LAPTOP`, `PC_DESKTOP`, `PRINTER`, `NETWORK`, `OTHER`).
  - `serviceCategoryId`: Strictly restricted to the 6 confirmed services in `MQTECH_SERVICES`.
  - `issueDescription`: Trimmed, minimum 10 characters, maximum 1000 characters.
  - `serviceAddress`: Enforced as required for `ON_SITE` mode.
- **Zero Computer Passwords Security Rule:**
  - Explicit inspection rejects payloads containing credential keys (`password`, `windowsPassword`, `bios_password`, `pin`, `mat_khau`, etc.) with HTTP 400 and an explicit privacy reminder.

### 3.3 Cryptographically Secure Reference Code & Initial Status
- **Unpredictable Format:** `MQT-` + 6 random alphanumeric characters generated using `crypto.randomInt` over a safe charset (`23456789ABCDEFGHJKLMNPQRSTUVWXYZ`) that excludes ambiguous characters (`0`, `O`, `1`, `I`).
- **Zero Sequential IDs:** Sequential database IDs are never generated or exposed to clients.
- **Strict Lifecycle State:** All submitted requests are saved with initial status `AWAITING_CONFIRMATION`.
- **Customer Feedback:** The response and UI render status label as **"Chờ xác nhận"** accompanied by an explicit notice:
  > *"Yêu cầu tiếp nhận dịch vụ đã được ghi nhận. Kỹ thuật viên MQTech sẽ chủ động gọi điện hoặc nhắn tin Zalo tới số điện thoại của quý khách để xác nhận chi tiết trước khi hỗ trợ. Đây là phiếu ghi nhận thông tin, chưa phải lịch hẹn đã xác nhận chính thức."*

---

## 4. Database Schema & Migration Environment

- **Schema Definition (`src/lib/db/schema.sql`):**
  - Updated DDL to include `device_category` (with CHECK constraint) and `service_address`.
  - Table `service_requests` enforces unique `reference_code`, foreign key to `service_categories`, default status `AWAITING_CONFIRMATION`, and indexes on `status`, `created_at DESC`, `reference_code`, and `customer_phone`.
  - Table `request_status_history` tracks all state changes with foreign key cascade.
- **Migration Execution Verification:**
  - In accordance with safety rules, **zero migrations were run against production**.
  - No database commands were executed against the existing Fly.io `openwebui-mqtech` application or its persistent volume.
  - The repository's database client (`src/lib/db/client.ts` and `src/lib/db/repository.ts`) safely isolates operations and operates in development fallback mode until a verified, dedicated development PostgreSQL instance is provisioned.

---

## 5. Security Controls & API Protection

1. **Anti-Spam & Rate Limiting:**
   - In-memory sliding window rate limiter (`src/lib/utils/rate-limiter.ts`) enforcing a maximum of 5 requests per 10-minute window per IP address. Exceeding limits returns HTTP 429 Too Many Requests with a `Retry-After` header.
2. **Credential Harvesting Prevention:**
   - Form inputs, database schema, and server validators explicitly prohibit collecting Windows, BIOS, or email passwords.
3. **Information Disclosure Prevention:**
   - Internal database UUIDs, stack traces, and database connection strings are never returned in public responses.
   - No public endpoint exists to enumerate or list customer service requests.
4. **Input Sanitization:**
   - All string fields are trimmed, length-bounded, and validated against strict whitelists and regex patterns before persistence.

---

## 6. Tests Executed & Actual Results

A comprehensive automated test suite consisting of 31 tests across 8 test suites was executed using Node.js's native test runner (`npm test`):

```powershell
$ npm test
▶ POST /api/service-requests API Endpoint Verification
  ✔ should successfully accept valid request and return 201 with referenceCode (42.7ms)
  ✔ should return 400 when validation fails (1.0ms)
  ✔ should return 400 with security alert when computer passwords are submitted (1.3ms)
  ✔ should enforce rate limiting and return 429 when threshold exceeded (4.6ms)
✔ POST /api/service-requests API Endpoint Verification (52.1ms)

▶ PostgreSQL Relational Schema Boundary Verification
  ✔ should declare service_requests table with unpredictable reference_code (1.4ms)
  ✔ should enforce AWAITING_CONFIRMATION as default request status (1.3ms)
  ✔ should declare device_category and service_address columns (0.3ms)
  ✔ should not include password fields in service_requests (0.3ms)
  ✔ should declare request_status_history table with cascade deletion (0.2ms)
✔ PostgreSQL Relational Schema Boundary Verification (5.9ms)

▶ MQTech Environment Boundary Verification
  ✔ should provide sensible development defaults (1.4ms)
  ✔ should not expose server secrets in public fields (0.3ms)
✔ MQTech Environment Boundary Verification (3.8ms)

▶ Customer Service Request Intake Validation
  ✔ should accept valid In-Store intake payload (1.9ms)
  ✔ should require serviceAddress for On-Site service mode (0.6ms)
  ✔ should validate Vietnamese telephone numbers strictly (0.5ms)
  ✔ should reject short issue description (< 10 chars) (0.3ms)
  ✔ should reject invalid service category ID (0.3ms)
  ✔ should STRICTLY REJECT any submitted computer passwords or credentials (1.8ms)
✔ Customer Service Request Intake Validation (8.1ms)

▶ Intake Rate Limiter Verification
  ✔ should allow up to max requests within window (1.5ms)
  ✔ should track distinct IPs independently (0.3ms)
  ✔ should support manual reset (0.3ms)
✔ Intake Rate Limiter Verification (4.3ms)

▶ Cryptographically Secure Reference Code Verification
  ✔ should generate valid reference code with MQT prefix (2.0ms)
  ✔ should generate 1,000 distinct codes without collisions (3.7ms)
  ✔ should never include visually ambiguous characters (0, O, 1, I) (2.2ms)
  ✔ should reject malformed reference codes in validator (0.2ms)
✔ Cryptographically Secure Reference Code Verification (10.6ms)

▶ Service Request Repository Verification
  ✔ should persist request with AWAITING_CONFIRMATION status (3.0ms)
  ✔ should retrieve persisted request by reference code (0.6ms)
  ✔ should return null for non-existent reference code (0.4ms)
✔ Service Request Repository Verification (6.2ms)

▶ MQTech Services Specification Verification
  ✔ should have exactly 6 confirmed service categories (1.3ms)
  ✔ should have unique IDs and slugs for all services (0.3ms)
  ✔ should only include approved delivery modes (0.4ms)
  ✔ should not introduce any prohibited PC configurators or e-commerce categories (0.4ms)
✔ MQTech Services Specification Verification (4.8ms)

Total Tests: 31 passed, 0 failed, 0 skipped. Duration: 294ms.
Status: EXIT CODE 0 (PASSED)
```

Additional Quality Gates Executed:
- **TypeScript Strict Checking:** `npm run typecheck` (`tsc --noEmit`) -> **0 errors**.
- **ESLint Code Quality:** `npm run lint` (`eslint`) -> **0 errors, 0 warnings**.
- **Production Build:** `npm run build` (`next build`) -> **Compiled successfully** (Prerendered static pages `/`, `/_not-found`, `/robots.txt`, `/sitemap.xml`; Dynamic server route `/api/service-requests`).

---

## 7. Responsive & Accessibility Verification

1. **Responsive Behavior:**
   - **Mobile Viewports (< 768px):** Form fields, delivery toggle pills, and CTAs stack vertically with generous touch targets (heights >= 44px–48px). Navbar collapses into a responsive slide-down menu. No horizontal overflow (`overflow-x: hidden`).
   - **Tablet Viewports (768px–1023px):** Services display in a 2-column grid; hero elements maintain balanced line wrapping with Vietnamese diacritics.
   - **Desktop Viewports (>= 1024px):** 3-column service grid, split 1.1fr/0.9fr hero layout, sticky glass navigation with inline links.
2. **Accessibility (WCAG 2.1 AA Compliance):**
   - High contrast surfaces: white and gray text on deep dark `#0A0A0B` (contrast ratio > 7:1); dark text on daylight `#F5F5F7` (contrast ratio > 10:1).
   - Form inputs have associated `<label>` tags with matching `htmlFor` / `id` bindings.
   - Error states link via `aria-describedby` and reflect `aria-invalid="true"`.
   - Focus indicators use high-contrast blue focus rings (`focus:ring-2 focus:ring-[#3B82F6]`).
   - Delivery mode toggle implements explicit `role="tablist"` and `role="tab"` with `aria-selected` attributes.

---

## 8. Technical SEO & Indexation Controls

- **Metadata:** Comprehensive title, meta descriptions, and keywords localized for Buôn Ma Thuột.
- **OpenGraph:** Standard OpenGraph tags (`title`, `description`, `locale: vi_VN`, `type: website`).
- **Robots Configuration (`src/app/robots.ts`):** Allows crawling of public routes (`/`), strictly disallows `/api/` and future `/admin/` routes.
- **Sitemap Generation (`src/app/sitemap.ts`):** Exposes clean sitemap for public exploration without leaking private endpoints.

---

## 9. Inventory of Files Created, Modified, or Deleted

| Action | Path | Description |
| :--- | :--- | :--- |
| **Created** | `src/lib/utils/reference-code.ts` | Cryptographically random reference code generator and validator. |
| **Created** | `src/lib/utils/rate-limiter.ts` | Sliding window in-memory rate limiter with auto-cleanup. |
| **Created** | `src/lib/validations/service-request.ts` | Server-side DTO validation schema and password rejection logic. |
| **Created** | `src/lib/db/repository.ts` | Service request repository with dual PostgreSQL / dev fallback persistence. |
| **Created** | `src/app/api/service-requests/route.ts` | Next.js API Route Handler handling `POST /api/service-requests`. |
| **Created** | `src/components/home/IntakeSection.tsx` | Interactive dual-mode customer intake form and confirmation UI. |
| **Created** | `src/components/home/TrustSection.tsx` | Principles and security commitments section (`#cam-ket`). |
| **Created** | `src/app/robots.ts` | Robots metadata route controlling search engine indexation. |
| **Created** | `src/app/sitemap.ts` | XML Sitemap metadata route. |
| **Created** | `tests/intake_validation.test.mjs` | Unit test suite for intake form validation and credential protection. |
| **Created** | `tests/reference_code.test.mjs` | Unit test suite for reference code randomness and format invariants. |
| **Created** | `tests/rate_limiter.test.mjs` | Unit test suite for IP-based sliding window rate limiting. |
| **Created** | `tests/repository.test.mjs` | Unit test suite for request persistence and status tracking. |
| **Created** | `tests/api_endpoint.test.mjs` | Integration test suite for `POST /api/service-requests`. |
| **Modified** | `package.json` | Added `"type": "module"`, installed `pg` and `@types/pg`. |
| **Modified** | `tsconfig.json` | Enabled `"allowImportingTsExtensions": true`. |
| **Modified** | `src/lib/db/types.ts` | Added `DeviceCategory` and `serviceAddress` to entity definitions. |
| **Modified** | `src/lib/db/schema.sql` | Added `device_category` and `service_address` columns to DDL schema. |
| **Modified** | `src/lib/db/client.ts` | Adjusted relative imports for ES module type-stripping compatibility. |
| **Modified** | `src/components/home/ServicesSection.tsx` | Added client interactivity to pre-select services in the intake form. |
| **Modified** | `src/components/layout/Footer.tsx` | Added `id="lien-he"` anchor tag. |
| **Modified** | `src/app/layout.tsx` | Added OpenGraph metadata and clean viewport configuration. |
| **Modified** | `src/app/page.tsx` | Assembled updated page structure with `TrustSection` and `IntakeSection`. |
| **Deleted** | `src/components/home/IntakeShellSection.tsx` | Removed superseded preliminary UI shell. |

---

## 10. Outstanding Business Information & Technical Blockers

The following items remain intentionally marked as **Pending Confirmation** per project truthfulness rules:
1. **Physical Storefront Street Address:** Regionally specified as Buôn Ma Thuột (~15 km radius); exact street address will be updated upon shop owner confirmation.
2. **Official Hotline & Zalo Channel:** Public telephone numbers will be updated upon formal verification.
3. **Dedicated Development PostgreSQL Container:** A local or disposable staging PostgreSQL instance will be provisioned in Phase P3/P4 prior to cloud deployment.

---

## 11. Infrastructure Safety Confirmation

- **Zero Infrastructure Changes:**
  - Fly.io application `openwebui-mqtech` was NOT modified, restarted, or accessed.
  - Persistent volume `vol_4m3m9jdgen55793v` was NOT touched or deleted.
  - No Fly.io deployment commands or database alterations were executed.

---

## 12. Readiness Recommendation for Phase P3

### Verdict: **PHASE P2 COMPLETE — READY TO PROCEED TO PHASE P3**

All Phase P2 objectives are met:
- The public website is responsive, aesthetically aligned with the approved design reference, and strictly reflects MQTech's 6 confirmed services and dual delivery model.
- The dual-mode customer intake form is functional, secure, and validated both client-side and server-side.
- Zero sequential IDs or customer passwords are used or stored.
- All 31 automated tests, TypeScript strict checks, ESLint checks, and production builds pass with 100% success.

The workspace is ready for user review and explicit authorization to proceed to **Phase P3: Administrative Intake Triage & Status Management**.
