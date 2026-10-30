# MQTech Design Reference Analysis

- **Document Version:** 1.0.0
- **Date:** 2026-10-30
- **Status:** Approved for P0 Planning
- **Reference Artifact:** `references/Template-Sua-May-Tinh.html` (Single-Page React & Tailwind Application)
- **Role & Scope:** Architectural analysis of visual design characteristics, reusable design patterns, and strict separation between visual reference and MQTech business requirements.

---

## 1. Executive Summary

This document presents a comprehensive visual analysis of the single-page HTML application `references/Template-Sua-May-Tinh.html`. 

The reference showcases an **Apple-inspired, high-precision technology service aesthetic** featuring a deep neutral-dark canvas (`#0A0A0B`), crisp light contrast sections (`#F5F5F7`), tech-blue ambient accents (`#3B82F6`), high-legibility typography (`SF Pro Display`), refined glassmorphism, and restrained micro-interactions.

### Strict Governance Boundary: Visual System vs. Business Truth
Per project governance and safety rules:
- **Visual Design Reference ONLY:** Typography scale, color tokens, surface hierarchy, pill controls, glass headers, card borders, telemetry badges, and responsive layouts are extracted and adopted.
- **Business Content REJECTED:** The business identity ("TuanVan Tech"), founder persona ("Anh Tuấn"), address ("123 Lê Duẩn"), phone numbers, social handles, fabricated testimonials ("5000+ khách hàng"), unverified ratings ("4.9/5"), price tables, warranties, parts store / e-commerce configurators, and mockup toast notifications are **strictly discarded**.
- **MQTech Precedence:** All visual components are adapted exclusively to MQTech's verified brand identity, 6 core service categories, dual service model (in-store and on-site in Buôn Ma Thuột), and manual telephone/Zalo confirmation workflow.

---

## 2. Page Composition & Section Hierarchy

The reference page is structured as a vertical single-page journey with alternating surface contrast:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Header / Navbar (Sticky Glass, h-[68px], max-w-[1280px])  │
├─────────────────────────────────────────────────────────────┤
│ 2. Hero Section (Deep Dark #0A0A0B, Radial Blue Glow)       │
│    - Left: Badge, Display Headline, Value Subheading, CTAs  │
│    - Right: Floating Telemetry / Diagnostic Console Card    │
│    - Bottom: 3-Column Metric / Trust Indicators            │
├─────────────────────────────────────────────────────────────┤
│ 3. Core Services Grid (Light Canvas #F5F5F7)                │
│    - Section Tag, Bold Headline, Detailed Value Pitch       │
│    - Responsive Service Cards (Hover Elevation, Badges)     │
├─────────────────────────────────────────────────────────────┤
│ 4. Trust & Brand Positioning (Deep Dark #0A0A0B)            │
│    - Credibility Pillars, Technical Standards               │
├─────────────────────────────────────────────────────────────┤
│ 5. Transparent Process / Workflow (Light Canvas #F5F5F7)     │
│    - 3-Step Clear Diagnostic & Repair Sequence              │
├─────────────────────────────────────────────────────────────┤
│ 6. Contact & Service Request Intake (Dark Surface #0A0A0B)  │
│    - Left: Direct Contact Info, Working Hours, Channels     │
│    - Right: Service Intake Booking Form                     │
├─────────────────────────────────────────────────────────────┤
│ 7. Footer (Deep Dark #0A0A0B, Regulatory & Copyright)       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Visual Characteristics & Design System Analysis

### 3.1 Header & Navigation Layout
- **Container:** Sticky top bar, `z-50`, height `68px` (`h-[68px]`), maximum content width `1280px` (`max-w-[1280px]`), horizontal padding `px-6 lg:px-8`.
- **Surface:** Glassmorphic background `bg-[#0A0A0B]/80` with backdrop blur (`backdrop-blur-md` / `glass`) and subtle boundary `border-b border-white/[0.08]`.
- **Brand Lockup:**
  - Mark: Rounded squircle badge `h-9 w-9 rounded-[10px] bg-white text-[#0A0A0B] font-bold text-[13px] tracking-[-0.02em]`.
  - Wordmark: Bold uppercase text `font-bold tracking-[-0.04em] text-white text-[15px]`.
  - Subtitle: Uppercase micro-label `text-[10px] tracking-[0.18em] text-white/40 font-medium uppercase`.
- **Live Status Indicator:** Real-time indicator pill `hidden lg:flex items-center gap-2 text-white/50 text-[12px]`:
  - Glowing dot: `h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse`.
  - Text: Operational status and schedule indicator.
- **Navigation Links:** Horizontal inline navigation `hidden md:flex items-center gap-8` with subtle opacity transitions (`text-white/60 hover:text-white transition-colors text-[14px]`).
- **Primary CTA:** White pill button `rounded-full bg-white px-5 h-10 text-[13.5px] font-semibold text-[#0A0A0B] hover:shadow-[0_8px_24px_rgba(255,255,255,0.18)] active:scale-[0.98]`.
- **Mobile Navigation:** Responsive hamburger toggle (`h-10 w-10 rounded-full bg-white/10`) triggering a clean slide-down panel (`bg-[#0A0A0B] border-t border-white/10 px-6 py-6`) with stacked links and a full-width CTA.

### 3.2 Typography Scale & Text Styling
- **Primary Font Family:** Apple SF Pro Display typography: `font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- **Headline Hierarchy:**
  - **Display Hero:** `text-[40px] font-bold leading-[0.95] tracking-[-0.05em] lg:text-[64px] xl:text-[72px]`.
  - **Section Title:** `text-[28px] lg:text-[36px] font-bold tracking-[-0.03em] leading-[1.1]`.
  - **Card / Subsection Title:** `text-[18px] lg:text-[20px] font-bold tracking-[-0.02em]`.
  - **Body Text:** `text-[15px] lg:text-[16px] leading-[1.6] tracking-[-0.01em]`.
  - **Micro-Labels & Badges:** `text-[10px]` to `text-[12px]` with generous letter spacing (`tracking-[0.12em]` to `tracking-[0.18em] uppercase font-medium`).
- **Visual Heading Accents:**
  - Gradient text clipping: `bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent`.
  - Skewed accent underlay: subtle rotated colored bar beneath focal keywords (`bg-[#3B82F6]/30 h-[0.28em] -rotate-[1deg]`).

### 3.3 Color Palette & Semantic Contrast
- **Base Dark Surface:** `#0A0A0B` (neutral dark black) — primary hero, dark section, and footer background.
- **Card Dark Surface:** `#121214` to `#18181B` — elevated dark cards, telemetry cards, and form inputs.
- **Base Light Surface:** `#F5F5F7` (Apple light gray) — primary light canvas providing high-readability daylight contrast.
- **Card Light Surface:** `#FFFFFF` (pure white) — elevated light cards with crisp borders.
- **Tech Accent Blue:** `#3B82F6` (Tailwind blue-500) — focal glows, highlight bars, primary accents, selection state (`selection:bg-[#3B82F6]/20`).
- **Status Green:** `#10B981` (emerald-500) with pulsating glow for active availability.
- **Monochrome Opacity Stops:**
  - `text-white` (100%), `text-white/80` (80%), `text-white/60` (60%), `text-white/40` (40%).
  - `border-white/10`, `border-white/[0.08]`, `border-white/[0.05]`.
  - Light mode equivalents: `text-[#0A0A0B]`, `text-[#0A0A0B]/70`, `text-[#0A0A0B]/40`, `border-black/5`, `border-black/10`.

### 3.4 Buttons & Action Hierarchy
1. **Primary CTA (Pill Solid):**
   - Classes: `inline-flex h-[48px] items-center gap-3 rounded-full bg-white px-6 text-[14px] font-semibold text-[#0A0A0B] shadow-[0_12px_32px_rgba(255,255,255,0.14)] hover:shadow-[0_16px_40px_rgba(255,255,255,0.22)] active:scale-[0.98] transition-all`.
   - Visual cue: Circular inner icon badge (`grid h-7 w-7 rounded-full bg-[#0A0A0B] text-white`).
2. **Secondary CTA (Glass Outlined):**
   - Classes: `inline-flex h-[48px] items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 text-[14px] font-medium text-white/80 backdrop-blur hover:bg-white/[0.1] hover:text-white transition`.
3. **Tertiary / Inline Action:**
   - Text link with subtle arrow transition (`group-hover:translate-x-1 transition-transform`).

### 3.5 Surface Treatment, Cards, & Elevation
- **Corner Radii:** Consistent radius hierarchy:
  - Outer cards: `rounded-[20px]` or `rounded-[24px]`.
  - Control pills & tags: `rounded-full`.
  - Inner icon boxes / badges: `rounded-[10px]` to `rounded-[12px]`.
- **Card Styling (Dark Mode):**
  - Background `bg-white/[0.02]` or `bg-[#121214]`.
  - Border `border border-white/[0.08]`.
  - Hover: `hover:border-white/20 hover:-translate-y-1 transition-all duration-300`.
- **Card Styling (Light Mode):**
  - Background `#FFFFFF`.
  - Border `border border-black/[0.06]`.
  - Shadow: `shadow-[0_4px_20px_rgba(0,0,0,0.04)]` with hover lift.

### 3.6 Ambient Lighting & Visual Accents
- **Radial Ambient Glow:** Two large defocused radial blurs in the dark hero:
  - Top center: `h-[900px] w-[1200px] bg-[#3B82F6]/20 blur-[160px]`.
  - Bottom right: `h-[600px] w-[600px] bg-[#3B82F6]/10 blur-[120px]`.
- **Telemetry Console Card:** The reference hero features a floating hardware diagnostic card ("Nhiệt độ CPU: 42°C", "Trạng thái sẵn sàng"). This pattern provides high technical credibility and will be adapted to display MQTech intake and diagnostic readiness.

### 3.7 Responsive Architecture
- **Desktop (>= 1024px):**
  - Multi-column grids (2-column hero `lg:grid-cols-[1.05fr_0.95fr]`, 3-column service cards, horizontal metric strips).
  - Sticky glass header with full navigation.
- **Tablet (768px - 1023px):**
  - 2-column service cards.
  - Collapsed secondary navigation into mobile menu.
- **Mobile (< 768px):**
  - Single-column flow (`grid-cols-1`).
  - Hero layout stacks vertically with generous vertical rhythm (`gap-8`, `py-14`).
  - Full-width touch-friendly button targets (height minimum 44px–48px).
  - Floating sticky action bar or persistent mobile header.

---

## 4. Separation Audit: What to Adopt vs. What to Discard

| Aspect | In Reference Template (`Template-Sua-May-Tinh.html`) | Decision | MQTech Production Plan |
| :--- | :--- | :---: | :--- |
| **Visual Aesthetics** | Apple-style dark/light hybrid, `#0A0A0B`, `#F5F5F7`, blue glow | **ADOPT** | Use as core visual tokens for Tailwind CSS config. |
| **Navbar & Header** | Sticky glass bar, rounded logo squircle, status dot, CTA | **ADOPT** | Adapt with MQTech brand lockup and verified hours. |
| **Hero Layout** | Split display headline, dual pill CTA, floating diagnostic card | **ADOPT** | Hero messaging for MQTech computer repair & IT services. |
| **Service Cards** | Rounded cards with badge tags, key checkmarks, hover lift | **ADOPT** | Map to MQTech's 6 confirmed service categories. |
| **Process Steps** | 3-step numbered diagnostic and repair workflow | **ADOPT** | Map to Intake -> Diagnostic -> Confirmation -> Repair. |
| **Brand Identity** | "TuanVan Tech", "TuanVan Lab", "Anh Tuấn - Founder" | **DISCARD** | Use verified brand: **MQTech — Computer Service**. |
| **Shop Address** | "123 Lê Duẩn, P. Tân Thành, TP. Buôn Ma Thuột" | **DISCARD** | Mark shop address as *Pending Confirmation*. State service area: Buôn Ma Thuột (~15 km). |
| **Phone & Contacts** | "0905 123 456", unverified social links | **DISCARD** | Use designated placeholders pending owner verification. |
| **Prices & Discounts** | "Từ 99K", "Từ 150K", "18.900.000đ", "Trả góp 0%" | **DISCARD** | No unverified prices. Display "Liên hệ tư vấn & báo giá minh bạch". |
| **Unverified Claims** | "Đánh giá 4.9/5", "5000+ khách hàng", "Cứu máy 60 phút" | **DISCARD** | Remove fabricated reviews and guarantees entirely. |
| **E-Commerce / Parts** | PC Configurator, GPU/CPU selector, components catalog | **DISCARD** | Out of scope. MQTech focuses on repair and IT support. |
| **Mockup Toasts** | Dummy `alert`/`toast` on clicks without actual actions | **DISCARD** | Replace with real, accessible React state and server forms. |

---

## 5. Adaptation to MQTech Service Architecture

### 5.1 Service Mapping (6 Confirmed Categories)
The 6 confirmed service categories are mapped to the reference card component pattern:
1. **Desktop & Laptop Repair** (*Sửa chữa Laptop & Máy tính để bàn*): Hardware fault isolation, boot failures, screen/keyboard replacements.
2. **Windows & Software Support** (*Cài đặt & Xử lý sự cố phần mềm*): Windows reinstallation, driver optimization, software error troubleshooting.
3. **Hardware Diagnostics & Replacement** (*Chẩn đoán & Thay thế linh kiện*): Component testing, RAM/SSD upgrades, thermal paste servicing.
4. **Printer Services** (*Dịch vụ Máy in*): Printer setup, driver configuration, cartridge & basic servicing.
5. **LAN & Wi-Fi Networking** (*Thi công & Xử lý mạng LAN/Wi-Fi*): Network wiring, router configuration, office connectivity troubleshooting.
6. **Business IT Support** (*Hỗ trợ IT Doanh nghiệp & Văn phòng*): Maintenance contracts, scheduled on-site support for local businesses.

### 5.2 Service Delivery & Intake Model
- The reference template only supported walk-in intake.
- MQTech provides a **Dual Service Model**:
  - **Mang máy đến tiệm (In-store intake):** Customer brings computer to the shop.
  - **Sửa chữa tận nơi (On-site repair):** Technician visits customer location within Buôn Ma Thuột.
- **Request Form UX:**
  - Selector toggle between "Mang máy đến tiệm" and "Sửa chữa tận nơi".
  - Clear disclaimer on submission: **"Yêu cầu dịch vụ sẽ được nhân viên liên hệ xác nhận qua Điện thoại hoặc Zalo trước khi tiếp nhận."**
  - Submission state is permanently labeled: **"Chờ xác nhận" (Awaiting Confirmation)**.

---

## 6. Technical Implementation Blueprint

1. **Clean Next.js App Router Component Architecture:**
   - `components/layout/Navbar.tsx`: Sticky glass navigation with mobile sheet.
   - `components/layout/Footer.tsx`: Authoritative dark footer with verified contact info.
   - `components/home/Hero.tsx`: High-impact hero with telemetry card.
   - `components/home/Services.tsx`: 6-card responsive grid.
   - `components/home/Workflow.tsx`: 4-step transparent repair lifecycle.
   - `components/home/ServiceRequestForm.tsx`: Accessible, validated intake form.
2. **Tailwind CSS Configuration:**
   - Define custom palette (`brand-dark: #0A0A0B`, `brand-light: #F5F5F7`, `brand-blue: #3B82F6`).
   - Define custom typography classes and glass utilities.
3. **Accessibility & Usability:**
   - Contrast ratio exceeds WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text).
   - Form inputs have explicit labels and error states.
   - Reduced motion preferences honored for background glow animations.
