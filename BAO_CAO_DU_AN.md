# BÁO CÁO TỔNG QUAN DỰ ÁN: MQTech - Computer Service (BMT)

Tài liệu này tổng hợp toàn bộ kiến trúc kỹ thuật, hạ tầng vận hành, cấu trúc cơ sở dữ liệu, các phân hệ tính năng và hướng dẫn chuyển giao sang máy tính mới để phát triển/bảo trì lâu dài.

---

## 1. Thông tin chung & Hạ tầng vận hành (Production)

| Thành phần | Chi tiết cấu hình |
| :--- | :--- |
| **Tên thương hiệu** | **MQTech - Computer Service** (`DỊCH VỤ SỬA MÁY TÍNH TẠI NHÀ BMT`) |
| **Tên miền chính thức** | `https://suamaytinhbmt.id.vn` (đã trỏ SSL Let's Encrypt qua Fly.io) |
| **Địa chỉ cửa hàng** | 13/2 hẻm 4, Đường Võ Thị Sáu, P. Tân Lập, TP. Buôn Ma Thuột, Đắk Lắk |
| **Khu vực phục vụ trọng tâm** | Phường Tân Lập, Phường Tân An và toàn TP. Buôn Ma Thuột |
| **Máy chủ ứng dụng (Hosting)** | **Fly.io** — App Name: `mqtech-bmt`, Region: `sin` (Singapore), RAM `512mb`, `1 shared CPU` (`fly.toml`) |
| **Cơ sở dữ liệu (Database)** | **Neon Cloud Serverless PostgreSQL** (Region: Singapore `ap-southeast-1`) — tách biệt 100% khỏi source code web |
| **Lưu trữ hình ảnh (Storage)** | **Cloudflare R2** — Bucket: `mqtech-uploads` (lưu ảnh bài viết, dịch vụ, thiết bị) |
| **Đo lường & SEO** | Đã xác minh **Google Search Console** (`sitemap.xml` động) và gắn **Google Analytics 4 (GA4)** qua cấu hình trong Admin |
| **Thông báo đơn hàng** | **Telegram Bot** & **Email SMTP** (cấu hình trực tiếp trong Admin) |

---

## 2. Công nghệ sử dụng (Tech Stack)

- **Framework**: Next.js `15` (App Router, `output: "standalone"`, Dynamic SSR `force-dynamic`) + React `19` + TypeScript `5`.
- **Styling, Font & UI**: Tailwind CSS `3.4` (hệ semantic token chuẩn hóa trong `DESIGN.md`), `lucide-react` (Icons), `@radix-ui/react-accordion` / `react-dialog` / `react-tabs`, `sonner` (Toast). Bộ Google Fonts chuẩn 100% Tiếng Việt: **`Manrope`** (tiêu đề `.font-heading`), **`IBM Plex Sans`** (nội dung `.font-body`), **`JetBrains Mono`** (mã phiếu & giá tiền `.font-mono`), và **`Be Vietnam Pro`** (nạp riêng cho trang In hóa đơn `/admin/in-hoa-don/[id]`).
- **Database & ORM**: `drizzle-orm` + `pg` (`Pool` kết nối Neon PostgreSQL với SSL). Khi chạy dev local không có `DATABASE_URL`, code tự động fallback sang `@electric-sql/pglite` (lưu tại `.pglite-data`).
- **Xác thực & Bảo mật**: JWT (`jose`, cookie `mqtech_admin_session` HttpOnly), mã hóa mật khẩu `bcryptjs`, giới hạn tần suất request (`src/lib/rate-limit.ts`), kiểm tra đầu vào bằng `zod`.
- **Tiện ích bổ sung**: `@aws-sdk/client-s3` (upload ảnh lên Cloudflare R2), `qrcode` (tạo mã QR tra cứu bảo hành trên hóa đơn in), `nodemailer` (gửi email thông báo).

---

## 3. Kiến trúc mã nguồn (`src/`)

```text
src/
├── app/
│   ├── layout.tsx                   # Root layout, Google Fonts CDN, Canonical, GSC meta, GA4 script
│   ├── globals.css                  # CSS variables, theme Precision Bench, print styles
│   ├── robots.ts                    # Cấu hình robots.txt (chặn /admin, /api/admin)
│   ├── sitemap.ts                   # Sitemap động (Dynamic SSR) đọc từ Neon DB
│   ├── (public)/                    # Nhóm trang khách hàng công khai (Dynamic SSR)
│   │   ├── page.tsx                 # Trang chủ (Hero Slider, Dịch vụ, FAQ, Schema LocalBusiness BMT)
│   │   ├── dich-vu/                 # Danh sách dịch vụ & Chi tiết dịch vụ ([slug])
│   │   ├── bang-gia/                # Bảng giá niêm yết công khai theo tab
│   │   ├── dat-lich/                # Wizard đặt lịch sửa tại nhà / tại tiệm 3 bước
│   │   ├── tra-cuu/                 # Tra cứu tiến độ sửa chữa & bảo hành điện tử
│   │   ├── kiem-tra-may-tinh/       # Công cụ kiểm tra phần cứng online (Phím, Màn, Loa, Mic, Cam...)
│   │   ├── bai-viet/                # Kiến thức & SEO ([slug] hỗ trợ Lightbox & Markdown Table)
│   │   ├── gioi-thieu/              # Giới thiệu MQTech BMT
│   │   └── lien-he/                 # Liên hệ, form gửi câu hỏi & Google Maps nhúng
│   ├── admin/
│   │   ├── login/page.tsx           # Đăng nhập Admin / Biên tập viên
│   │   ├── in-hoa-don/[id]/page.tsx # Trang in hóa đơn riêng (không sidebar, 3 khổ A4 / A5 / K80, Be Vietnam Pro + QR)
│   │   └── (panel)/                 # Khu vực quản trị (bọc bởi AdminShell)
│   │       ├── page.tsx             # Tổng quan (Chỉ ADMIN)
│   │       ├── phieu-sua/page.tsx   # Quản lý phiếu sửa, chọn linh kiện Kho & nút In HĐ (Chỉ ADMIN)
│   │       ├── khach-hang/page.tsx  # CRM Khách hàng, tra cứu BH theo SĐT, Xuất CSV (Chỉ ADMIN)
│   │       ├── kho-hang/page.tsx    # Kho linh kiện, Nhập/Xuất, Giá vốn BQ, Cảnh báo tồn, CSV (Chỉ ADMIN)
│   │       ├── tai-chinh/page.tsx   # Sổ Thu/Chi, Báo cáo Lãi kinh doanh (P&L) & Dòng tiền, CSV (Chỉ ADMIN)
│   │       ├── dich-vu/page.tsx     # Quản lý dịch vụ (ADMIN & EDITOR; EDITOR bị ẩn nút Xóa)
│   │       ├── bang-gia/page.tsx    # Quản lý bảng giá (Chỉ ADMIN)
│   │       ├── bai-viet/page.tsx    # Quản lý bài viết SEO, Media Tray R2, Preview (ADMIN & EDITOR)
│   │       ├── lien-he/page.tsx     # Quản lý câu hỏi liên hệ (Chỉ ADMIN)
│   │       └── cai-dat/page.tsx     # Cài đặt, Telegram/SMTP, SEO/GSC/GA4, Tài khoản & Backup R2/PG
│   └── api/
│       ├── auth/                    # login, logout
│       ├── tickets/                 # Đặt lịch công khai & tra cứu (/lookup)
│       ├── contact/                 # Gửi liên hệ công khai
│       ├── upload/                  # Upload ảnh lên Cloudflare R2 (hoặc local fallback)
│       ├── health/                  # Healthcheck cho Fly.io (/api/health)
│       └── admin/                   # API quản trị (tickets, customers, inventory, finance, backup, ...)
├── components/
│   ├── admin/                       # AdminShell (RBAC), TicketItemsEditor, InvoicePrintClient, BackupManagerSection
│   ├── blog/                        # ArticleBody (Markdown Table, Link, Lightbox), BlogExplorer
│   ├── booking/                     # BookingWizard, TicketLookupClient
│   ├── device-test/                 # 6 công cụ test phần cứng trên trình duyệt
│   ├── home/                        # HeroBannerSlider, FaqAccordion, MotionReveal
│   ├── layout/                      # Navbar, Footer, BrandLogo, FloatingQuickContact
│   └── ui/                          # Breadcrumb (+ Schema), ImageLightbox, ModalDialog, ResponsiveImage
├── db/
│   ├── index.ts                     # Khởi tạo pg.Pool (Neon SSL) hoặc PGlite khi dev local
│   ├── schema.ts                    # Định nghĩa 11 bảng PostgreSQL bằng Drizzle ORM
│   ├── ensure-db.ts                 # Tạo bảng DDL & migration an toàn (đã tắt auto-seed dữ liệu mẫu)
│   └── seed-data.ts                 # Dữ liệu mẫu tham khảo (chỉ dùng cho script seed thủ công)
└── lib/
    ├── auth.ts                      # Ký/kiểm tra JWT, AdminRole (ADMIN | EDITOR), requireAdminSession()
    ├── backup.ts                    # Export snapshot 11 bảng, Upload Backup R2, Sync PostgreSQL thứ 2 & Restore
    ├── customers.ts                 # Chuẩn hóa SĐT, upsertCustomerFromTicket(), computeWarrantyStatus()
    ├── inventory.ts                 # Đồng bộ trừ/hoàn kho tự động theo phiếu sửa (syncTicketInventoryMovements)
    ├── inventory-constants.ts       # Danh mục kho/thu chi & tính giá nhập bình quân gia quyền
    ├── notifications.ts             # Gửi thông báo Telegram Bot & Email SMTP
    ├── rate-limit.ts                # Giới hạn spam API công khai
    ├── site-data.ts                 # Truy vấn dữ liệu công khai trực tiếp từ Neon DB (không fallback seed)
    ├── storage.ts                   # Tích hợp AWS S3 SDK upload ảnh lên Cloudflare R2
    ├── ticket-items.ts              # Parse/chuẩn hóa hạng mục sửa chữa (hỗ trợ gắn Kho + SL + Giá vốn)
    └── utils.ts                     # Tiện ích định dạng, TICKET_STATUS_MAP, SERVICE_CATEGORIES
```

---

## 4. Cơ sở dữ liệu PostgreSQL (11 bảng chính)

Toàn bộ dữ liệu được lưu vĩnh viễn trên **Neon PostgreSQL**. Mã nguồn **đã tắt hoàn toàn cơ chế auto-seed và không ghi đè dữ liệu/mật khẩu khi deploy**.

1. **`site_settings`**: Cấu hình thương hiệu (`id = 1`), hotline, địa chỉ, trạng thái mở cửa, `telegram_bot_token`, `telegram_chat_id`, `smtp_*`, `google_site_verification`, `google_analytics_id`, `google_maps_embed_url`.
2. **`services`**: Danh mục dịch vụ (`slug`, `category`, `price_from`, `symptoms_json`, `service_prices_json`, `is_published`).
3. **`pricing_items`**: Các dòng trong trang `/bang-gia` theo tab (`laptop-macbook`, `pc-build`, `clean-upgrade`, `onsite-it`).
4. **`posts`**: Bài viết kiến thức & SEO (`title`, `slug`, `content` Markdown, `cover_image`, `gallery_images` JSON, `seo_title`, `seo_description`).
5. **`repair_tickets`**: Phiếu sửa chữa & lịch hẹn (`ticket_code`, `customer_name`, `customer_phone`, `device_type`, `device_model`, `serial_number`, `items_json` lưu chi tiết từng hạng mục + số lượng + giá bán + `inventoryItemId`/`unitCost`, `estimated_cost`, `warranty_text`, `warranty_until`, `status`).
6. **`customers`**: Hồ sơ khách hàng (`phone` UNIQUE đã chuẩn hóa, `name`, `email`, `address`, `notes`). Tự động tạo/cập nhật mỗi khi có khách đặt lịch hoặc tạo phiếu tại quầy.
7. **`contact_inquiries`**: Thắc mắc khách hàng gửi từ trang `/lien-he`.
8. **`admin_users`**: Tài khoản quản trị (`email`, `password_hash`, `name`, `role`: `ADMIN` hoặc `EDITOR`).
9. **`inventory_items`**: Danh mục kho linh kiện (`sku` UNIQUE, `name`, `category`, `unit`, `quantity`, `avg_cost` giá nhập bình quân gia quyền, `sell_price`, `min_stock` ngưỡng cảnh báo, `supplier`).
10. **`stock_movements`**: Lịch sử nhập/xuất/hoàn kho (`item_id`, `type`: `IN | OUT_TICKET | OUT_RETAIL | RETURN_TICKET | ADJUST`, `quantity_change`, `unit_cost`, `total_cost`, `ticket_id`, `ticket_code`, `receipt_image_url` trên R2).
11. **`finance_transactions`**: Sổ Thu/Chi (`type`: `INCOME | EXPENSE`, `category`, `amount`, `title`, `transaction_date`, `payment_method`: `CASH | BANK`, `receipt_image_url` trên R2, `stock_movement_id`).

---

## 5. Phân quyền & Các phân hệ nghiệp vụ nổi bật

### 5.1. Phân quyền Admin (`ADMIN` vs `EDITOR`)
- **`ADMIN` (Quản trị viên chính)**: Toàn quyền mọi trang & API; tạo/đổi mật khẩu/xóa tài khoản Biên tập viên trong `/admin/cai-dat` (Mục 5).
- **`EDITOR` (Biên tập viên nội dung)**:
  - Chỉ nhìn thấy & truy cập **Bài viết SEO** (`/admin/bai-viet`) và **Dịch vụ** (`/admin/dich-vu`).
  - Được thêm mới, chỉnh sửa, tải ảnh R2 và đăng bài/dịch vụ.
  - **Bị chặn quyền Xóa (`DELETE` trả về `403 Forbidden`)** và bị chặn truy cập toàn bộ dữ liệu nhạy cảm (Phiếu sửa, Khách hàng, Bảng giá, Liên hệ, Cài đặt, Tài khoản).

### 5.2. Quản lý Khách hàng & Bảo hành (`/admin/khach-hang`)
- Gõ **Số điện thoại** (hoặc Tên, Mã phiếu, Tên máy, Serial) để xem toàn bộ lịch sử máy đã sửa, ngày sửa, chi phí.
- Tự động tính trạng thái bảo hành: `Còn BH • X ngày`, `Sắp hết BH • X ngày` (≤ 15 ngày), `Đã hết bảo hành`, `Chưa có BH`.
- Hỗ trợ chỉnh sửa ghi chú riêng cho khách, bấm gọi điện / Chat Zalo, bấm **Tạo phiếu sửa mới cho khách này**, và nút **Xuất Excel / CSV** để tải file dự phòng về máy.

### 5.3. Phiếu sửa đa hạng mục & In hóa đơn (`/admin/phieu-sua` & `/admin/in-hoa-don/[id]`)
- Khi tạo/cập nhật phiếu có thể bấm các nút gợi ý nhanh (`+ Sửa main`, `+ Cài Win`, `+ Thay Main [Asus B85]`, `+ Thay Nguồn`...), **chọn trực tiếp linh kiện từ Kho**, hoặc thêm dòng trống, tùy chỉnh tên linh kiện, số lượng, đơn giá và **thời hạn bảo hành riêng cho từng món** (hỗ trợ các nút chọn nhanh `1T`, `3T`, `6T`, `12T`, `24T`, `36T`, `Không BH` hoặc gõ tùy ý); hệ thống tự cộng tổng tiền.
- Chi tiết hạng mục hiển thị đồng bộ ở: **Phiếu sửa**, **Hồ sơ Khách hàng**, **File CSV**, **Hóa đơn in** và **Trang Tra cứu công khai (`/tra-cuu`)**, kèm theo thời hạn bảo hành của từng hạng mục cụ thể.
- Trang **In hóa đơn (`/admin/in-hoa-don/[id]`)** hỗ trợ **3 khổ giấy tách riêng: Khổ A4, Khổ A5 và Khổ K80 (80mm)**, sử dụng font **`Be Vietnam Pro`** sắc nét cho bản in Tiếng Việt. Thiết kế chuẩn in đơn sắc (**Monochrome Black & High Contrast**): bảng hóa đơn có các đường kẻ dọc (`border-r border-black`) phân tách rõ ràng giữa cột STT, Hạng mục sửa chữa và Thành tiền, kéo dài xuống tận hàng Tổng hóa đơn thanh toán; dưới mỗi tên linh kiện có dòng phụ hiển thị thời hạn bảo hành (`• Bảo hành: 12 tháng`); toàn bộ khung viền và chữ đều là màu đen chuẩn (`border-black`, `text-black`) trên nền trắng tinh khiết (`bg-white`); khối **Chế độ bảo hành & Mã QR tra cứu điện tử** nằm ở **dưới cùng** của trang sau phần Chữ ký xác nhận.

### 5.4. Kho linh kiện, Sổ Thu/Chi & Backup dữ liệu (`/admin/kho-hang`, `/admin/tai-chinh`, `/admin/cai-dat`)
- **Kho linh kiện (`/admin/kho-hang`)**: Quản lý tồn kho, tự động tính **Giá nhập bình quân gia quyền**, cảnh báo sắp hết hàng, hỗ trợ upload ảnh hóa đơn nhập hàng lên **Cloudflare R2**, tick tự ghi khoản Chi nhập hàng sang Sổ Thu/Chi, và tự động **trừ kho / hoàn kho** theo Phiếu sửa chữa.
- **Thu chi & Lãi lỗ (`/admin/tai-chinh`)**: Tự động tổng hợp doanh thu & giá vốn linh kiện từ phiếu `COMPLETED`, hiển thị song song **Lãi kinh doanh (P&L)** và **Dòng tiền thực tế (Cashflow)** theo tháng (không tính trùng tiền nhập hàng), kèm nút **Xuất Excel / CSV**.
- **Sao lưu & Dự phòng (`/admin/cai-dat` — Mục 6)**: Hỗ trợ tải file Backup toàn bộ 11 bảng (`.json`), lưu trực tiếp snapshot lên **Cloudflare R2**, khôi phục từ file `.json` (có hộp thoại xác nhận Radix `ConfirmDialog`), và đồng bộ 1 chạm sang **PostgreSQL thứ 2** khi cấu hình biến `BACKUP_DATABASE_URL`.

### 5.5. Kiểm tra thiết bị & Chuẩn UI/UX (`/kiem-tra-may-tinh` & Toàn hệ thống)
- **Keyboard Test (`KeyboardTester.tsx`)**: Giao diện bàn phím cơ full-size 3 cụm tối màu ANSI 104 phím (cụm chính, cụm điều hướng/mũi tên chữ T ngược, cụm Numpad đầy đủ với phím `+` và `enter` cao 2 hàng), chặn phím chức năng ở pha `capture` (`keydown`, `keypress`, `keyup`, `contextmenu`) để không làm cuộn trang hay kích hoạt phím tắt trình duyệt.
- **Chuẩn Responsive & Accessibility (`DESIGN.md`)**: Thanh Navbar công khai cân đối không tràn trên laptop (`1024px`, `1280px`, `1366px`, `1440px+`); các ô nhập liệu quản trị dùng `text-base sm:text-xs` chống auto-zoom trên iOS Safari; nút thao tác `≥ 40px` có `aria-label`; thay thế toàn bộ `window.confirm()` bằng Radix `ConfirmDialog`; hỗ trợ `prefers-reduced-motion`.

---

## 6. Hướng dẫn chuyển dự án sang máy tính mới

### Bước 1: Cài đặt môi trường trên máy mới
1. Cài **Node.js LTS** (khuyến nghị Node 20 hoặc 22).
2. Cài **Fly CLI (`flyctl`)** để deploy lên Fly.io:
   - Windows (PowerShell): `pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"`
3. Copy toàn bộ thư mục dự án (trừ thư mục `node_modules` và `.next` nếu muốn nhẹ) sang máy mới.

### Bước 2: Cài đặt thư viện & Chạy thử Local
Mở terminal tại thư mục gốc dự án:
```powershell
npm install
npm run dev
```
- Nếu chưa cấu hình file `.env.local`, hệ thống tự động tạo database PGlite local trong `.pglite-data/` để bạn test giao diện tại `http://localhost:3000`.
- Nếu muốn kết nối trực tiếp Neon PostgreSQL khi chạy local, tạo file `.env.local` dựa theo `.env.example` và điền `DATABASE_URL`, `JWT_SECRET`, thông tin `R2_*`.

### Bước 3: Kết nối Fly.io & Deploy phiên bản mới từ máy mới
1. Đăng nhập tài khoản Fly.io:
   ```powershell
   fly auth login
   ```
2. Kiểm tra trạng thái máy chủ và các biến bí mật đang chạy (các biến `DATABASE_URL`, `JWT_SECRET`, `R2_*`, `ADMIN_*`, `NEXT_PUBLIC_SITE_URL` đã được lưu sẵn trên server Fly.io, **không cần thiết lập lại** trừ khi bạn muốn đổi):
   ```powershell
   fly status
   fly secrets list
   ```
3. Kiểm tra build trước khi đẩy lên server:
   ```powershell
   npm run build
   ```
4. Deploy mã nguồn mới lên Fly.io (build trên server Depot của Fly, không tốn tài nguyên máy cá nhân):
   ```powershell
   fly deploy --remote-only
   ```

> [!IMPORTANT]
> **Lưu ý vận hành quan trọng:**
> - **Tuyệt đối không** bật biến `RESET_ADMIN_PASSWORD=true` trên Fly secrets nếu không muốn đặt lại mật khẩu Admin chính.
> - **Mọi dữ liệu** (bài viết, bảng giá, đơn hàng, khách hàng, kho hàng, thu chi, cài đặt SEO/Telegram) đều nằm trên **Neon PostgreSQL**, nên việc đổi máy tính hay deploy lại code sẽ **không bao giờ làm mất dữ liệu**.
> - Nếu muốn kích hoạt sao lưu 1 chạm sang PostgreSQL thứ 2 (Supabase hoặc Neon project phụ), chạy `fly secrets set BACKUP_DATABASE_URL="postgresql://..."` rồi bấm đồng bộ tại `/admin/cai-dat` (Mục 6).


---

## 7. Nhật ký Nâng cấp Hạ tầng, Tính năng & Lộ trình SEO (23–24/11/2026)

### 7.1. Chuyển đổi Hạ tầng Production sang Vercel Singapore (`sin1`) — Chi phí 0đ
- **Ngừng phụ thuộc Fly.io:** Đã gỡ chứng chỉ domain (`suamaytinhbmt.id.vn`, `www.suamaytinhbmt.id.vn`) khỏi Fly.io và scale máy chủ Fly về `0` để chấm dứt phát sinh chi phí.
- **Triển khai tự động qua GitHub + Vercel (`QuangManh89/MQTechWebsite`, nhánh `master`):**
  - Thêm file `vercel.json` cấu hình `"regions": ["sin1"]` (Singapore), đặt cạnh Neon Serverless PostgreSQL (`ap-southeast-1`) giúp tốc độ phản hồi tối ưu cho người dùng tại Việt Nam.
  - Cấu hình đủ biến môi trường trên Vercel (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`, `R2_*`).
  - Gỡ bỏ đoạn redirect `www` trùng lặp trong `next.config.mjs` để tránh vòng lặp chuyển hướng.
- **Chuẩn hóa Domain & DNS Cloudflare:**
  - Trỏ bản ghi CNAME `@` và `www` về `176ec2cb9a8cfb8b.vercel-dns-017.com` (chế độ **DNS only** để Vercel cấp SSL tự động).
  - Thống nhất Primary Domain trên Vercel: **`https://suamaytinhbmt.id.vn`** trả về thẳng `HTTP/1.1 200 OK`, còn **`https://www.suamaytinhbmt.id.vn`** chuyển hướng vĩnh viễn **`HTTP/1.1 308 Permanent Redirect`** về `https://suamaytinhbmt.id.vn/`.

### 7.2. Nâng cấp UI/UX, Accessibility & Nghiệp vụ Phiếu sửa chữa
- **Chuẩn tương phản WCAG AA (`Impeccable Audit` đạt 20/20 & `impeccable doctor` 0 findings):**
  - Tinh chỉnh token màu nút CTA (`--rgb-cta`) từ `#ea580c` sang cam sâu `#c2410c` (hover `#9a3412`), đạt tỷ lệ tương phản **4.7:1** với chữ trắng (vượt ngưỡng 4.5:1 WCAG AA).
  - Đồng bộ hoàn toàn `DESIGN.md` và sidecar `.impeccable/design.json`.
- **Tự động tính Hạn bảo hành đến ngày (`/admin/phieu-sua` — Modal Tạo phiếu mới):**
  - Thêm hàng nút chọn nhanh thời hạn (`Không BH`, `1T`, `3T`, `6T`, `12T`, `24T`, `36T`) kèm ghi chú mốc `Tính từ dd/mm/yyyy` (ngày lập phiếu hôm nay).
  - Mặc định khi mở form chọn sẵn `6T` (`Hôm nay + 6 tháng`), tự động tính đúng ngày cuối tháng và đồng bộ nội dung vào ô **Nội dung bảo hành** (vẫn cho phép chỉnh tay bất cứ lúc nào).

### 7.3. Hoàn thành SEO Giai đoạn 1 — Kỹ thuật & Tối ưu 11 bài viết hiện có
- **Nâng cấp Technical SEO & Liên kết 2 chiều Hub ↔ Spoke:**
  - `src/app/(public)/bai-viet/[slug]/page.tsx`: Bổ sung `alternates.canonical`, `openGraph` (`type: "article"`, `locale: "vi_VN"`, `siteName`, `publishedTime`, `modifiedTime`, `images`), `twitter` (`summary_large_image`), nâng cấp JSON-LD `Article` (`mainEntityOfPage`, `publisher.logo` chuẩn hóa URL tuyệt đối), nâng cấp khối bài liên quan ưu tiên cùng chuyên mục (3 thẻ).
  - `src/app/(public)/dich-vu/[slug]/page.tsx`: Bổ sung `alternates.canonical`, `openGraph`, `twitter`, JSON-LD `Service` (`LocalBusiness` provider, `areaServed: Buôn Ma Thuột, Đắk Lắk`), và bổ sung khối **"Kiến thức & Hướng dẫn liên quan"** (3 bài viết chấm điểm khớp theo slug/chuyên mục dịch vụ).
- **Cứu 4 bài Thin Content & Xử lý liên kết nội bộ trên Neon DB (đồng bộ `src/db/seed-data.ts`):**
  - Sao lưu toàn bộ 11 bài gốc trước khi chỉnh sửa.
  - Mở rộng 4 bài seed mỏng (#1–#4) từ 111–247 từ lên **952–1.007 từ** (đầy đủ cấu trúc `##`/`###`, bảng so sánh Markdown, 4 câu FAQ, 4–5 internal link tự nhiên).
  - Chèn internal link cho các bài đang có 0 link (#9, #10, #11) và phân tách intent cụm Cài Win (#5, #7) chống ăn thịt từ khóa.

### 7.4. Hoàn thành SEO Giai đoạn 2 — 8 Bài Viết Chuyên Sâu (Deep Search)
- **Xuất bản 8 bài viết mới (ID #12 – #19)** trên Neon DB (mỗi bài 1.390–1.996 từ, bảng Markdown chuẩn, 4 FAQ, 5–6 internal link hợp lệ, ảnh bìa HTTP 200 OK):
  - **Nhóm Phần cứng & Hệ thống (4 bài):**
    1. `laptop-khong-len-nguon-man-hinh-den-con-tro-chuot-bmt`
    2. `pc-bat-quat-quay-man-hinh-no-signal-bmt`
    3. `sua-loi-laptop-khong-bat-duoc-wifi-cham-than-vang`
    4. `laptop-sac-khong-vao-pin-thay-pin-laptop-bmt`
  - **Chuyên mục mới `Thủ Thuật Văn Phòng` (4 bài):**
    5. `sua-loi-unikey-khong-go-duoc-tieng-viet-loi-font-word-excel`
    6. `sua-loi-word-excel-product-activation-failed-khong-go-duoc-chu`
    7. `sua-loi-chia-se-may-in-mang-lan-0x0000011b-0x00000709-win-11`
    8. `huong-dan-cai-dat-tron-bo-phan-mem-van-phong-thiet-yeu-win-11`
- **Kết quả Audit tổng thể kho nội dung (19/19 bài):**
  - **19/19 bài viết** đang xuất bản trên **7 chuyên mục** (`Bảo Dưỡng Phần Cứng`, `Thủ Thuật Windows`, `Thủ Thuật Văn Phòng`, `Nâng Cấp Máy`, `Cẩm Nang MacBook`, `Sửa Chữa Tại Nhà BMT`, `Bảng Giá & Tư Vấn`).
  - **89/89 internal links hợp lệ (0 link hỏng)**, **0 lỗi hiển thị Markdown**, đã kiểm thử trực quan 0 lỗi console trên production.

### 7.5. Hoàn thành Trụ cột 1 — Google Search Console & Indexing
- Xác nhận mã xác minh **Google Search Console** (`3hjBjUrdXW7iKHNIK5NBpIizV1PxkCP8-DMXyTOsBDA`) và **Google Analytics 4** (`G-QMFWXSV7YL`) hoạt động ổn định qua `/admin/cai-dat` và `src/app/layout.tsx`.
- Gửi thành công **`/sitemap.xml`** trên Google Search Console — trạng thái **Thành công**, Google đã khám phá đủ **36 URL** (9 trang tĩnh + 8 trang dịch vụ + 19 bài viết).
- Đã gửi **Yêu cầu lập chỉ mục (Request Indexing)** thành công cho **5 trang chủ lực** (`/dich-vu/sua-may-tinh-tai-nha-bmt`, `/dich-vu/cai-win-10-11-phan-mem-tai-nha-bmt`, `/dich-vu/sua-laptop-windows`, `/dich-vu/nang-cap-ram-ssd-linh-kien`, `/bang-gia`) và các bài viết mới.
- **Lộ trình tiếp theo (Trụ cột 2–5 trong 90 ngày):** Đẩy mạnh **Google Business Profile (Google Maps + Review 5 sao)**, thay ảnh chụp thực tế tại tiệm vào 5 trang chủ lực, bổ sung FAQ Schema trên trang dịch vụ, triển khai **Giai đoạn 3 SEO** (kéo traffic công cụ `/kiem-tra-may-tinh` & MacBook BMT) và tối ưu định kỳ theo dữ liệu GSC.
