# MQTech — Quality Gates & Acceptance Criteria

- **Document Version:** 1.0.0
- **Date:** 2026-10-30
- **Status:** Approved for P0 Planning & Verification
- **Scope:** Complete acceptance criteria across Visual Design, Business Fidelity, User Journeys, Accessibility, Security, and Engineering Standards.

---

## 1. Visual Design & Reference Fidelity

| # | Acceptance Criterion | Verification Method | Pass / Fail Rule |
| :-: | :--- | :--- | :--- |
| **AC-VD-01** | **Visual Character Alignment** | Visual audit against `references/Template-Sua-May-Tinh.html` | Page features dark glass navbar (`#0A0A0B`/80), deep hero canvas, light service canvas (`#F5F5F7`), tech-blue glows (`#3B82F6`), and pill CTAs. |
| **AC-VD-02** | **Strict Identity Separation** | Content string search | Zero occurrences of "TuanVan Tech", "Anh Tuấn", "123 Lê Duẩn", "0905 123 456", fake reviews, or parts shop configurators. |
| **AC-VD-03** | **MQTech Brand Integration** | DOM inspection | Brand logo squircle, wordmark "MQTech — Computer Service", and Buôn Ma Thuột service area clearly displayed. |
| **AC-VD-04** | **Typography & Hierarchy** | CSS inspection | Clean sans-serif font stack (`SF Pro Display`), negative headline tracking (`tracking-[-0.03em]` to `-0.05em`), and micro-badge uppercase labels. |
| **AC-VD-05** | **Light/Dark Chapter Transitions** | Visual rendering | Distinct transition between dark hero, daylight service grid, and dark contact/intake section without visual discord. |

---

## 2. Business Scope & Service Workflow

| # | Acceptance Criterion | Verification Method | Pass / Fail Rule |
| :-: | :--- | :--- | :--- |
| **AC-BS-01** | **6 Confirmed Services** | Visual & DOM inspection | Exactly 6 confirmed service categories present. No speculative PC-part e-commerce or unapproved offerings. |
| **AC-BS-02** | **Dual Intake Delivery Mode** | Form testing | User can explicitly toggle between "Mang máy đến tiệm" and "Sửa chữa tận nơi tại Buôn Ma Thuột". |
| **AC-BS-03** | **Clear Confirmation Status** | Request intake submission | Submitted request displays status badge **"Chờ xác nhận"**. Mandatory copy states staff will call/Zalo to confirm before work. |
| **AC-BS-04** | **Zero Password Collection** | Form inspection | Form does NOT contain fields for Windows/BIOS passwords or sensitive credentials. Prominent security notice warns users never to share passwords. |
| **AC-BS-05** | **Honest Pricing & Information** | Copy inspection | No fabricated diagnostic fees, discounts, or repair-time guarantees. Transparent copy: *"Chẩn đoán trung thực — Báo giá rõ ràng trước khi sửa"*. |

---

## 3. Responsive Behavior & Usability

| # | Acceptance Criterion | Verification Method | Pass / Fail Rule |
| :-: | :--- | :--- | :--- |
| **AC-RU-01** | **Mobile Layout (< 768px)** | Viewport test (375px–430px) | Single column layout, no horizontal scroll (`overflow-x-clip`), touch targets >= 44px, hamburger slide-down menu fully functional. |
| **AC-RU-02** | **Tablet Layout (768px–1023px)** | Viewport test (768px, 820px) | 2-column service card layout, clean line breaks with Vietnamese text, balanced vertical spacing. |
| **AC-RU-03** | **Desktop Layout (>= 1024px)** | Viewport test (1280px, 1440px) | Sticky glass header with inline links, 3-column service grid, split hero with floating telemetry card, max width 1280px. |
| **AC-RU-04** | **No Placeholder / Fake Actions** | Interactive audit | Every button and link triggers an authentic, functional action (form submission, navigation scroll, genuine telephone/Zalo link). Zero dummy toasts. |

---

## 4. Accessibility & Web Performance

| # | Acceptance Criterion | Verification Method | Pass / Fail Rule |
| :-: | :--- | :--- | :--- |
| **AC-AP-01** | **Color Contrast (WCAG AA)** | Automated contrast tool | Minimum 4.5:1 for body copy; minimum 3:1 for large display headlines; form inputs have distinct borders. |
| **AC-AP-02** | **Keyboard Navigation** | Tab navigation test | All interactive elements navigable via Keyboard; visible focus indicators (`focus-visible:ring-2 focus-visible:ring-[#3B82F6]`). |
| **AC-AP-03** | **Form Labeling & Error States** | Screen-reader & DOM test | Every `<input>`, `<select>`, `<textarea>` has an associated `<label>`. Errors link via `aria-describedby`. |
| **AC-AP-04** | **Motion Preferences** | Media query test | `prefers-reduced-motion: reduce` disables background radial glow pulses and smooth-scroll transitions. |
| **AC-AP-05** | **Performance & Core Web Vitals**| Lighthouse / DevTools audit | LCP < 2.5s, CLS < 0.05, FID / INP < 100ms on simulated mobile network. |

---

## 5. Security & Data Protection

| # | Acceptance Criterion | Verification Method | Pass / Fail Rule |
| :-: | :--- | :--- | :--- |
| **AC-SE-01** | **Unpredictable Reference Code** | Code review & submission test | System generates random alphanumeric reference codes (e.g., `MQT-8X2K`). Sequential database IDs are never exposed. |
| **AC-SE-02** | **Server-Side Validation** | API test with invalid payload | Server rejects malformed phone numbers, missing fields, oversized payloads, or unexpected schema keys. |
| **AC-SE-03** | **Rate Limiting & Anti-Spam** | Burst submission test | Public request submission is rate-limited per IP; abuse triggers graceful 429 response without crashing. |
| **AC-SE-04** | **Admin Access Protection** | Direct URL test | Unauthenticated access to `/admin` or admin API endpoints redirects to login with 401/403 status. |
| **AC-SE-05** | **Zero Secrets Committed** | Repository scan | No Fly.io tokens, database passwords, or secret session keys in client code, environment templates, or git commits. |

---

## 6. Verification Procedures & Execution Evidence

Under the project governance rules, passing a quality gate requires executing concrete tests and inspecting their outputs:

1. **Linting & Code Quality:** `npm run lint` (0 errors, 0 warnings).
2. **Type Safety:** `npx tsc --noEmit` (TypeScript strict mode, 0 errors).
3. **Unit & Integration:** `npm test` (All request validation, status transitions, and utility unit tests pass).
4. **End-to-End User Journeys:** `npx playwright test` (Public intake flow, mobile viewport navigation, admin triage, and authentication tests pass).
5. **Production Build:** `npm run build` (Next.js production build completes successfully without errors or missing static references).
