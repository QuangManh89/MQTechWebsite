# MQTech Design System Specification

- **System Version:** 1.0.0
- **Status:** Approved for P0 / P1 Engineering
- **Visual Foundation:** Inspired by Apple-grade technology service aesthetic (`Template-Sua-May-Tinh.html`)
- **Framework Target:** Next.js App Router, Tailwind CSS, TypeScript

---

## 1. Visual Token Foundations

### 1.1 Color Palette & Semantic Tokens

```
                    ┌────────────────────────┐
                    │    MQTech Palette      │
                    └───────────┬────────────┘
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
  Dark Canvas            Light Canvas           Brand Accents
  #0A0A0B (Base)         #F5F5F7 (Base)         #3B82F6 (Tech Blue)
  #121214 (Surface)      #FFFFFF (Card)         #10B981 (Active Green)
  #18181B (Elevated)     #E5E5EA (Border)       #EF4444 (Destructive)
  #323238 (Border)                              #F59E0B (Warning)
```

#### Color Token Values
| Token Name | Hex / Class | Semantic Role | Contrast Context |
| :--- | :--- | :--- | :--- |
| `surface-dark-base` | `#0A0A0B` | Deep dark hero, header, dark sections, footer | White text (`text-white`, `text-white/80`) |
| `surface-dark-card` | `#121214` | Dark cards, floating telemetry console | `border-white/[0.08]` |
| `surface-dark-elevated`| `#18181B` | Raised interactive items, input backgrounds | `border-white/10` |
| `surface-dark-border` | `#323238` | Prominent dark dividers, active borders | 3:1 against `#0A0A0B` |
| `surface-light-base` | `#F5F5F7` | Daylight section canvas, clean contrast | Dark text (`text-[#0A0A0B]`) |
| `surface-light-card` | `#FFFFFF` | Service cards, white pill buttons | `border-black/[0.06]`, `shadow-sm` |
| `surface-light-border`| `#E5E5EA` | Form borders, card outlines in light mode | Subtly structural |
| `accent-blue` | `#3B82F6` | Primary action accents, glows, focus rings | Background glows, badges, highlights |
| `accent-blue-hover` | `#2563EB` | Hover state for interactive blue controls | High contrast interactive |
| `accent-blue-subtle`| `rgba(59,130,246,0.15)`| Underlines, selection tint, badge backgrounds | Tinted indicator surfaces |
| `status-green` | `#10B981` | Real-time status dot, verified badges | Pulsing operational indicator |
| `status-amber` | `#F59E0B` | "Chờ xác nhận" (Pending confirmation) badge | Accessible status chip |
| `status-red` | `#EF4444` | Validation error messages, critical alerts | High-alert visibility |

#### Typography & Content Opacity Stops
- **On Dark Surfaces:**
  - High Emphasis (100%): `text-white`
  - Medium Emphasis (80%): `text-white/80`
  - Subdued / Body (60%): `text-white/60`
  - Subtle / Metadata (40%): `text-white/40`
  - Dividers / Outlines: `border-white/[0.08]` to `border-white/15`
- **On Light Surfaces:**
  - High Emphasis: `text-[#0A0A0B]`
  - Medium Emphasis: `text-[#0A0A0B]/75`
  - Subdued / Body: `text-[#0A0A0B]/60`
  - Metadata: `text-[#0A0A0B]/40`
  - Dividers / Outlines: `border-black/[0.06]` to `border-black/10`

---

### 1.2 Typography Hierarchy

- **Font Stack:**
  ```css
  font-sans: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-mono: "SF Mono", ui-monospace, Menlo, Monaco, Consolas, monospace;
  ```

| Scale Role | Font Size | Line Height | Tracking | Weight | Semantic HTML / Tailwind Classes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | 40px–72px | 0.95 | `-0.05em` | Bold (700) | `text-[40px] lg:text-[64px] xl:text-[72px] font-bold leading-[0.95] tracking-[-0.05em]` |
| **Section Title** | 28px–36px | 1.10 | `-0.03em` | Bold (700) | `text-[28px] lg:text-[36px] font-bold leading-[1.1] tracking-[-0.03em]` |
| **Card Heading** | 18px–20px | 1.25 | `-0.02em` | SemiBold (600)| `text-[18px] lg:text-[20px] font-semibold leading-[1.25] tracking-[-0.02em]` |
| **Body Large** | 16px | 1.60 | `-0.01em` | Regular (400) | `text-[16px] leading-[1.6] tracking-[-0.01em]` |
| **Body Regular** | 14px–15px | 1.50 | `0` | Regular (400) | `text-[14px] lg:text-[15px] leading-[1.5]` |
| **Small / Helper**| 12px–13px | 1.40 | `0` | Medium (500) | `text-[12.5px] lg:text-[13px] leading-[1.4]` |
| **Micro Badge** | 10px–11px | 1.00 | `+0.12em` | Medium / Semi | `text-[10px] lg:text-[11px] uppercase tracking-[0.12em] font-medium` |

---

### 1.3 Spacing, Grid, & Elevation

- **Base Layout Grid:** 8pt modular scale (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`, `80px`, `96px`).
- **Max Width Container:**
  - Primary Content: `max-w-[1280px] mx-auto px-6 lg:px-8`.
  - Focused Intake / Form: `max-w-[640px] mx-auto`.
  - Admin Dashboard: `max-w-[1440px] mx-auto px-6`.
- **Corner Radii (`border-radius`):**
  - Pill Controls & Badges: `rounded-full` (`9999px`).
  - Major Cards & Modals: `rounded-[20px]` or `rounded-[24px]`.
  - Interactive Panels & Tables: `rounded-[16px]`.
  - Input Fields & Dropdowns: `rounded-[12px]`.
  - Icon Squircle Badges: `rounded-[10px]`.
- **Elevation & Shadows:**
  - Glass Navbar: `backdrop-blur-md bg-[#0A0A0B]/80 border-b border-white/[0.08]`.
  - Light Card Elevation: `shadow-[0_4px_24px_rgba(0,0,0,0.04)]` with hover `hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5`.
  - Dark Card Hover: `border border-white/[0.08] hover:border-white/20 hover:-translate-y-0.5`.
  - Pill Button Glow: `shadow-[0_12px_32px_rgba(255,255,255,0.14)] hover:shadow-[0_16px_40px_rgba(255,255,255,0.22)]`.

---

## 2. Component Specifications

### 2.1 Buttons & Interactive Controls

```html
<!-- 1. Primary Solid Pill Button -->
<button class="group inline-flex h-[48px] items-center gap-3 rounded-full bg-white px-6 text-[14px] font-semibold text-[#0A0A0B] shadow-[0_12px_32px_rgba(255,255,255,0.14)] transition-all hover:bg-[#F5F5F7] hover:shadow-[0_16px_40px_rgba(255,255,255,0.22)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]">
  <span>Yêu cầu dịch vụ</span>
  <span class="grid h-7 w-7 place-items-center rounded-full bg-[#0A0A0B] text-white transition-transform group-hover:translate-x-0.5">
    <!-- Arrow icon -->
  </span>
</button>

<!-- 2. Secondary Glass Pill Button -->
<button class="inline-flex h-[48px] items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 text-[14px] font-medium text-white/80 backdrop-blur transition-all hover:bg-white/[0.12] hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]">
  <span>Xem dịch vụ</span>
</button>

<!-- 3. Dual-Mode Intake Toggle (In-Store vs On-Site) -->
<div class="inline-flex rounded-full bg-black/5 p-1 border border-black/10 dark:bg-white/5 dark:border-white/10">
  <button class="rounded-full px-5 py-2 text-[13px] font-semibold bg-white text-[#0A0A0B] shadow-sm transition-all">
    Mang máy đến tiệm
  </button>
  <button class="rounded-full px-5 py-2 text-[13px] font-medium text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white transition-all">
    Sửa chữa tận nơi
  </button>
</div>
```

---

### 2.2 Card Specifications

1. **Service Card (Light Canvas):**
   - Container: `rounded-[20px] bg-white border border-black/[0.06] p-6 lg:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between`.
   - Header: Icon squircle `grid h-11 w-11 rounded-[12px] bg-[#3B82F6]/10 text-[#3B82F6] place-items-center mb-4`.
   - Title: `text-[19px] font-bold text-[#0A0A0B] tracking-[-0.02em]`.
   - Description: `mt-2 text-[14.5px] leading-[1.55] text-[#0A0A0B]/65`.
   - Features List: Unordered list with clean check icons and concise value bullets.
   - Footer: Direct link/action "Tư vấn dịch vụ này" with arrow cue.

2. **Telemetry / Diagnostic Console Card (Hero Dark Canvas):**
   - Container: `rounded-[24px] bg-[#121214] border border-white/10 p-6 shadow-2xl backdrop-blur relative overflow-hidden`.
   - Top Bar: Simulated hardware telemetry (`Nhiệt độ phòng Lab • 24°C`, `Trạng thái: Sẵn sàng tiếp nhận`).
   - Center Display: Visual device check status with clear, professional diagnostic metrics.
   - Trust Seal: Explicit statement that diagnostic inspection is presented to customer before repair.

3. **Process Sequence Card (1-2-3-4 Steps):**
   - Container: Clean horizontal or grid progression.
   - Step Number: Bold pill index `text-[12px] font-bold rounded-full bg-white text-[#0A0A0B] px-3 py-1`.
   - Process Flow:
     - Bước 1: Tiếp nhận yêu cầu (In-store hoặc Tận nơi).
     - Bước 2: Chẩn đoán & Báo giải pháp minh bạch.
     - Bước 3: Xác nhận từ khách hàng (Điện thoại / Zalo).
     - Bước 4: Xử lý kỹ thuật & Bàn giao nghiệm thu.

---

### 2.3 Form & Input Design (Service Request Intake)

- **Input Surface:**
  - Dark container mode: `bg-white/[0.04] border border-white/10 rounded-[12px] px-4 py-3 text-[14.5px] text-white placeholder-white/30 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none transition`.
  - Light container mode: `bg-white border border-black/15 rounded-[12px] px-4 py-3 text-[14.5px] text-[#0A0A0B] placeholder-black/35 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none transition`.
- **Form Controls:**
  - Customer Full Name (`Họ và tên`).
  - Contact Telephone Number (`Số điện thoại liên hệ`).
  - Service Delivery Mode (`Mang máy đến tiệm` vs `Sửa tận nơi tại Buôn Ma Thuột`).
  - Service Category (`Chọn dịch vụ cần hỗ trợ` — Dropdown with 6 core categories).
  - Issue Description (`Mô tả tình trạng sự cố của máy`).
  - Preferred Contact Time (`Khung giờ thuận tiện nhận cuộc gọi / tin nhắn Zalo`).
- **Mandatory Submission Disclaimer:**
  - Alert Box: `rounded-[12px] bg-[#3B82F6]/10 border border-[#3B82F6]/20 p-4 text-[13px] leading-[1.5] text-white/80 dark:text-white/90`.
  - Copy: *"Lưu ý: Yêu cầu của quý khách sẽ được kỹ thuật viên MQTech liên hệ xác nhận qua Điện thoại hoặc Zalo trước khi tiếp nhận chính thức. Chúng tôi không bao giờ yêu cầu cung cấp mật khẩu máy tính cá nhân qua biểu mẫu."*

---

## 3. Light and Dark Transitions

The site uses purposeful, high-contrast chapter transitions to differentiate functional areas:

| Section | Theme | Background | Primary Purpose |
| :--- | :---: | :---: | :--- |
| **Navbar** | Dark Glass | `#0A0A0B`/80 | Persistent navigation, brand presence, live status |
| **Hero** | Deep Dark | `#0A0A0B` | Brand authority, visual punch, immediate CTA, telemetry card |
| **Services Grid** | Light Canvas| `#F5F5F7` | Clean daylight readability, detailed comparison of services |
| **Process Steps** | Light Canvas| `#FFFFFF` | Structured, transparent, easy-to-digest workflow steps |
| **Why MQTech** | Deep Dark | `#0A0A0B` | Technical credibility, local dedication, security guarantees |
| **Intake Form** | Deep Dark | `#0A0A0B` / `#121214` | Focused, high-trust booking console with clear validation |
| **Footer** | Deep Dark | `#0A0A0B` | Service area, working hours, copyright, legal disclaimer |

---

## 4. Accessibility & Performance Principles

1. **Color Contrast:**
   - All body text meets WCAG 2.1 AA standards (minimum 4.5:1 contrast against background).
   - Display headings and large text meet minimum 3:1 contrast.
   - Form inputs have prominent focus indicators (`focus-visible:ring-2 focus-visible:ring-[#3B82F6]`).
2. **Accessible Form Architecture:**
   - Every input has an associated semantic `<label>`.
   - Real-time validation uses `aria-describedby` for error text.
   - Status indicators do not rely on color alone (text status accompany colored dots).
3. **Reduced Motion:**
   - Respects user preference `prefers-reduced-motion: reduce`.
   - Radial ambient glows and pulsing status indicators disable animations when reduced motion is requested.
4. **Clean Web Standards:**
   - No bloated UI libraries. All styling realized through standard Tailwind utility classes.
   - Zero layout shift (CLS < 0.05).
