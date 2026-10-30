# MQTech — Business Requirements Specification

- **Document Version:** 1.0.0
- **Date:** 2026-10-30
- **Status:** Approved for P0 Planning & Specification
- **Product:** MQTech — Computer Service Website & Intake Platform

---

## 1. Project Background & Business Identity

### 1.1 Confirmed Business Identity
- **Brand Name:** MQTech — Computer Service.
- **Service Specialty:** Professional computer repair, hardware maintenance, software troubleshooting, networking, and IT support services.
- **Target Geography:** Buôn Ma Thuột city and neighboring wards within an approximate 15 km service radius.
- **Service Delivery Model:** 
  1. **In-Store Intake (Mang máy đến tiệm):** Walk-in intake for thorough diagnosis and component servicing.
  2. **On-Site Service (Sửa chữa tận nơi):** Mobile dispatch for home, office, and business network/PC troubleshooting.

### 1.2 Information Status & Pending Confirmations
To adhere to truthfulness and prevent fabricating business facts:
- **Domain:** `mqcomputech.com` is the proposed domain. Domain ownership, DNS availability, and SSL registration must be formally verified before production cutover.
- **Physical Address:** Exact storefront street address is *Pending Confirmation*. Regional copy specifies Buôn Ma Thuột service area without fake street numbers.
- **Direct Contact Hotline & Zalo:** Pending confirmation from business owner. Placeholders will be clearly marked as non-production in interim artifacts.
- **Business Hours:** To be confirmed with owner. Default display will reflect agreed operating schedule once verified.
- **Pricing:** No fixed prices or discount promises are published unless confirmed. Transparency is emphasized via: *"Chẩn đoán trung thực — Báo giá rõ ràng trước khi sửa"*.

---

## 2. Service Scope (Confirmed Categories)

The website shall feature exactly the 6 confirmed service categories. No speculative services, commercial sales, or PC parts e-commerce shall be introduced.

| # | Service Category | Scope & Customer Value | Delivery Channels |
| :-: | :--- | :--- | :---: |
| **1** | **Desktop & Laptop Repair**<br>*(Sửa chữa Máy tính bàn & Laptop)* | Diagnostics of hardware boot issues, screen replacements, keyboard/trackpad fixes, hinge repairs, power supply troubleshooting. | In-store & On-site |
| **2** | **Windows & Software Support**<br>*(Cài đặt & Xử lý sự cố phần mềm)* | Clean Windows OS installation, official driver setups, malware/virus eradication, software error diagnosis, speed optimization. | In-store & On-site |
| **3** | **Hardware Diagnostics & Replacement**<br>*(Chẩn đoán & Thay thế phần cứng)* | Component-level testing, RAM expansion, SSD migration, GPU/CPU maintenance, thermal paste application and cleaning. | In-store & On-site |
| **4** | **Printer Services**<br>*(Sửa chữa & Cài đặt máy in)* | Desktop printer driver setup, LAN printer sharing, paper jam diagnosis, cartridge replacement and servicing. | In-store & On-site |
| **5** | **LAN & Wi-Fi Networking**<br>*(Thi công & Xử lý mạng LAN / Wi-Fi)* | Home and small office cabling, Wi-Fi router setup, signal dead-zone elimination, network switch and connectivity troubleshooting. | On-site only |
| **6** | **Business IT Support**<br>*(Dịch vụ IT Doanh nghiệp & Văn phòng)* | Scheduled PC health audits, network monitoring, periodic maintenance, and priority technical response for local businesses. | On-site contract |

---

## 3. Customer Journey & Request Intake Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Customer Discovery & Exploration                         │
│    - Browses service categories & transparent process       │
│    - Views service area (Buôn Ma Thuột ~15 km)              │
├─────────────────────────────────────────────────────────────┤
│ 2. Request Submission via Web Form                          │
│    - Selects Delivery Mode (In-store vs On-site)            │
│    - Fills Contact, Device, Service Category, Problem Notes │
│    - System issues Random Reference Code (e.g. MQT-8X2K)    │
│    - Status set to: "Chờ xác nhận" (Awaiting Confirmation)   │
├─────────────────────────────────────────────────────────────┤
│ 3. Manual Staff Review & Customer Contact                   │
│    - Technician reviews request in Admin Dashboard          │
│    - Contacts customer via Phone or Zalo                    │
│    - Confirms appointment time, estimated cost & readiness  │
├─────────────────────────────────────────────────────────────┤
│ 4. Service Execution & Handover                             │
│    - Device intake / On-site visit                          │
│    - Diagnostic confirmation -> Customer approval -> Repair │
│    - Completion and customer handover                       │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Strict Governance on Request Status
- **Rule:** A submitted service request is **NEVER** an automated confirmed appointment.
- **System Messaging:** The customer confirmation screen and any public reference status must display:
  > *"Yêu cầu của quý khách đã được tiếp nhận và đang ở trạng thái **Chờ xác nhận**. Đội ngũ kỹ thuật viên MQTech sẽ chủ động gọi điện hoặc liên hệ Zalo với quý khách để xác nhận thời gian và phương án hỗ trợ cụ thể."*
- **Privacy & Security Safeguards:**
  - The public form strictly **FORBIDS** requesting or recording customer device passwords, Windows credentials, PINs, or email credentials.
  - Public reference codes must be cryptographically random/unpredictable. Sequential auto-increment database IDs (e.g., `/request/105`) must never be used.

---

## 4. Administration Requirements

The administrative capability is focused strictly on operational request triage and status tracking.

### 4.1 Minimal Admin Capabilities
1. **Authentication:** Secure server-side credential authentication with rate limiting and secure session cookies.
2. **Request Dashboard:**
   - Filter requests by status: `Chờ xác nhận` (New), `Đã xác nhận` (Confirmed), `Đang xử lý` (In Progress), `Hoàn thành` (Completed), `Đã hủy` (Cancelled).
   - Filter by service mode: `Tại tiệm` vs `Tận nơi`.
   - Search by reference code, customer phone number, or name.
3. **Request Detail & Status Transition:**
   - View customer contact details, problem description, submitted timestamp.
   - Update status with administrative notes and timestamped history log.
   - Add internal notes (e.g., "Đã gọi xác nhận qua Zalo lúc 10:15").
4. **User Roles:**
   - Single initial administrator account.
   - Database schema designed cleanly to support future staff roles without premature UI complexity.

---

## 5. Explicitly Out-of-Scope Items (Guardrails)

To maintain architectural focus and avoid scope creep:
- ❌ **No PC Building Configurator or Hardware Store:** E-commerce carts, price lists for thousands of components, and parts configurators are out of scope.
- ❌ **No Heavy CRM System:** Customer accounts, loyalty points, marketing newsletters, and complex customer relationship modules are excluded.
- ❌ **No Automated Booking Engines:** Real-time calendar slot reservation with automated confirmation is excluded because all appointments are manually triaged and confirmed.
- ❌ **No Online Payment Gateway:** Payment processing (Momo, VNPay, Stripe) is out of scope for initial phases; payments are settled directly between customer and shop upon service completion.
- ❌ **No Fabricated Data:** Zero fake reviews, fake customer counts, or artificial warranty claims.

---

## 6. Technical Stack Requirements

- **Framework:** Next.js (App Router), TypeScript (strict mode enabled).
- **Styling:** Tailwind CSS (configured with MQTech Design System tokens).
- **Database:** PostgreSQL (with transactional migrations, relational constraints, and parameterized queries).
- **Hosting Target:** Fly.io (treated as protected infrastructure; existing resources strictly isolated until P4 release).
