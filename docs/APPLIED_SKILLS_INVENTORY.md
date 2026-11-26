# Danh Sách Các Skill Đã Áp Dụng Vào Dự Án MQTech BMT

> **Dự án:** MQTech - Computer Service (`https://suamaytinhbmt.id.vn`)  
> **Cập nhật ngày:** 26/11/2026  
> **Nguồn skill:** Global Antigravity Skills (`~/.gemini/config/skills/`) & Bộ 53 Marketing Skills (`coreyhaines31/marketingskills`, cài tại `.agents/skills/`, lock tại `skills-lock.json`)

---

## 1. Các Skill Đã Áp Dụng Trực Tiếp Vào Dự Án (13 Skills)

### Nhóm A — Thiết Kế, UI/UX & Nhận Diện Thương Hiệu (4 Skills)

| # | Tên Skill | Nguồn | Đã áp dụng vào đâu / Kết quả cụ thể |
| :---: | :--- | :--- | :--- |
| 1 | **`impeccable`** | Global Skill | Kiểm định toàn bộ website đạt **20/20** (`impeccable doctor` 0 findings); chuẩn hóa `DESIGN.md` và `.impeccable/design.json`; nâng độ tương phản nút CTA cam (`--rgb-cta: #c2410c`) đạt **4.7:1 chuẩn WCAG AA**; xuất báo cáo tại `docs/IMPECCABLE_AUDIT_REPORT.md`. |
| 2 | **`frontend-design`** | Global Skill | Thiết kế ngôn ngữ giao diện *Precision Bench* (Titanium Cobalt + Obsidian Navy + Action Orange), bộ font chuẩn 100% tiếng Việt (`Manrope`, `IBM Plex Sans`, `JetBrains Mono`, `Be Vietnam Pro` cho hóa đơn in A4/A5/K80). |
| 3 | **`ui-ux-pro-max`** | Global Skill | Tối ưu hệ thống spacing, touch target ≥ `44x44px` trên mobile, thiết kế lại trang `/admin/tai-chinh` với bộ lọc 5 kỳ và biểu đồ tương tác `FinanceRevenueChart.tsx`. |
| 4 | **`logo-design`** | Global Skill | Xây dựng và căn chỉnh nhận diện `BrandLogo` đồng bộ giữa Navbar, Footer, hóa đơn in và ảnh chia sẻ mạng xã hội (`public/brand/og-banner.png`, bộ favicon/manifest). |

---

### Nhóm B — Marketing, SEO, CRO & AI-SEO (9 Skills từ `coreyhaines31/marketingskills`)

| # | Tên Skill | Đợt áp dụng | Đã áp dụng vào đâu / Kết quả cụ thể |
| :---: | :--- | :---: | :--- |
| 5 | **`product-marketing`** | Đợt 1 | Tạo file ngữ cảnh gốc `.agents/product-marketing.md` (chân dung khách hàng BMT, định vị, bảng giá, khu vực phục vụ, giọng văn thương hiệu) để toàn bộ 53 skill Marketing đọc đồng bộ. |
| 6 | **`ai-seo`** | Đợt 1 & Đợt 3 | Tạo route động `/llms.txt` (`src/app/llms.txt/route.ts`) đồng bộ live từ Neon DB; thêm **Direct Answer Block** (45–60 từ) trên toàn bộ trang `/dich-vu/[slug]`; lập `docs/AI_SEO_PLAYBOOK_AND_PROMPTS.md` (hướng dẫn submit Bing Webmaster Tools / Brave Search + bộ 12 Prompt theo dõi AI Visibility). |
| 7 | **`schema`** | Đợt 1 & Đợt 3 | Chuẩn hóa `LocalBusiness` JSON-LD (`openingHoursSpecification` + 8 phường BMT) trên trang chủ; thêm `LocalBusiness -> hasOfferCatalog` (`OfferCatalog`) trên `/bang-gia`; `Article` JSON-LD trên `/bai-viet/[slug]`; nâng cấp `@graph` gồm `Service` + `FAQPage` (4 câu hỏi/trang) trên `/dich-vu/[slug]`. |
| 8 | **`seo-audit`** | SEO GĐ 1–2 & Đợt 1 | Chuẩn hóa redirect `www` → root `308`, khóa `alternates.canonical` + bảo toàn `openGraph`/`twitter` cho 8 trang tĩnh và toàn bộ trang động; mở rộng 4 bài thin content lên 950–1.000+ từ; submit `/sitemap.xml` (36 URLs) lên Google Search Console. |
| 9 | **`content-strategy`** | SEO GĐ 1–2 | Xây dựng `docs/SEO_CONTENT_ROADMAP_PLAN.md`, `docs/SEO_PHASE2_PLAN.md`, `docs/TOP10_SEO_ACTION_PLAN_90DAYS.md`; phát triển kho nội dung lên **19 bài viết** trên **7 chuyên mục** (bổ sung cụm *Thủ Thuật Văn Phòng*) với **89/89 internal link hợp lệ**. |
| 10 | **`site-architecture`** | SEO GĐ 1–2 | Thiết kế liên kết nội bộ 2 chiều **Hub ↔ Spoke** tự động chấm điểm khớp giữa trang dịch vụ (`/dich-vu/[slug]`) và bài hướng dẫn kỹ thuật (`/bai-viet/[slug]`). |
| 11 | **`cro`** | Đợt 2 | Nâng cấp nút Hero CTA chính (`bg-cta`, `Đặt lịch ngay (Giảm 50.000đ)`) + 3 cam kết niềm tin; thêm `"Cài Win 10/11 & Phần mềm tại nhà BMT"` và **6 chip chọn nhanh lỗi 1 chạm** vào `BookingWizard.tsx`; thêm nút `Đặt lịch` deep-link từng dòng + khối *Cam kết 3 Không* ở `/bang-gia`; chèn **Contextual Inline CTA** giữa bài viết (`ArticleBody.tsx`). |
| 12 | **`conversion-tracking`** & **`analytics`** | Đợt 1 | Xây dựng `src/lib/analytics.ts` và `src/components/analytics/ConversionTracker.tsx` bắn 4 sự kiện chuyển đổi về GA4 (`G-QMFWXSV7YL`): `click_hotline`, `click_zalo`, `click_messenger`, và `booking_submitted` (chỉ bắn khi API `POST /api/tickets` thành công). |
| 13 | **`copywriting`** | Đợt 2 & Đợt 3 | Tối ưu nội dung CTA ưu đãi giảm `50.000đ`, khối *Cam kết 3 Không*, các đoạn **Direct Answer Block** và hệ thống câu hỏi FAQ trên từng trang dịch vụ theo ngôn ngữ thực tế, rõ ràng, không dùng câu mẫu AI. |

---

## 2. Các Skill Đã Cài Sẵn Trong `.agents/skills/` Nên Dùng Tiếp Cho MQTech

Trong 53 skill đã cài từ `coreyhaines31/marketingskills` (xem `skills-lock.json`), các skill dưới đây **chưa kích hoạt** nhưng rất hợp cho giai đoạn tiếp theo của MQTech BMT:

| Skill | Ứng dụng thực tế tiếp theo cho MQTech |
| :--- | :--- |
| **`competitor-profiling`** | Lập hồ sơ chi tiết 3–5 đối thủ trực tiếp tại BMT (*Tin Học Lưu Phương, DH Computer, Máy Tính Bàn Đắk Lắk*) về giá, dịch vụ và review Google Maps. |
| **`reverse-engineer-marketing`** | Phân tích đối thủ đang kéo khách bằng kênh nào và họ yếu ở đâu để MQTech đánh đúng khe hở. |
| **`referrals`** | Thiết kế kịch bản & mã QR xin đánh giá **5 sao Google Maps** sau mỗi ca sửa và chương trình giới thiệu bạn bè. |
| **`free-tools`** | Tối ưu hóa công cụ miễn phí `/kiem-tra-may-tinh` (test phím, màn hình, loa, mic, camera) thành phễu kéo traffic & backlink tự nhiên. |
| **`social`** | Lên lịch bài đăng Facebook Fanpage / Zalo OA tái sử dụng từ 19 bài viết SEO và các ca sửa thực tế tại BMT. |
| **`marketing-loops`** | Thiết lập quy trình kiểm tra định kỳ hàng tháng cho bộ 12 Prompt AI Visibility, thứ hạng GSC và tỷ lệ chuyển đổi GA4. |
| **`directory-submissions`** | Rà soát danh sách thư mục địa phương & ngành nghề (Bing Places, Top10BMT, Trang Vàng...) để tăng độ uy tín NAP cho Local SEO. |

---

## 3. Toàn Bộ 53 Skill Đã Cài Trong Dự Án (`skills-lock.json`)

> Nguồn: `coreyhaines31/marketingskills` (commit `8fd2fcade2fd6629026e9dfe6d133b55b36968b9`) — thư mục `.agents/skills/`

- **SEO, Content & AI Search:** `ai-seo` *(đã dùng)*, `seo-audit` *(đã dùng)*, `schema` *(đã dùng)*, `content-strategy` *(đã dùng)*, `site-architecture` *(đã dùng)*, `programmatic-seo`, `link-building`, `directory-submissions`
- **CRO, Copy & Phân tích:** `cro` *(đã dùng)*, `conversion-tracking` *(đã dùng)*, `analytics` *(đã dùng)*, `copywriting` *(đã dùng)*, `copy-editing`, `ab-testing`, `attribution`, `popups`, `signup`, `onboarding`, `paywalls`
- **Chiến lược, Định vị & Đối thủ:** `product-marketing` *(đã dùng)*, `competitor-profiling`, `competitors`, `reverse-engineer-marketing`, `customer-research`, `marketing-plan`, `marketing-ideas`, `marketing-loops`, `marketing-council`, `marketing-psychology`, `pricing`, `offers`, `launch`
- **Kênh tăng trưởng & Chăm sóc khách hàng:** `referrals`, `free-tools`, `lead-magnets`, `social`, `emails`, `cold-email`, `sms`, `ads`, `ad-creative`, `public-relations`, `influencer-marketing`, `community-marketing`, `co-marketing`, `events`, `churn-prevention`, `prospecting`, `sales-enablement`, `revops`, `aso`, `image`, `video`
