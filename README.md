# MQTech — Computer Service Web Application

> Hệ thống website dịch vụ sửa chữa máy tính MQTech (Buôn Ma Thuột & lân cận ~15 km), áp dụng kiến trúc tách biệt Web, PostgreSQL 16 tự vận hành và Cloudflare R2 với phân tách vật lý 3 bucket.

---

## 1. Giới Thiệu & Kiến Trúc Tổng Thể

MQTech là ứng dụng web dịch vụ công nghệ được thiết kế theo tiêu chuẩn an toàn cao nhất, giao diện lấy cảm hứng từ Apple-grade design language, đáp ứng quy trình tiếp nhận dịch vụ 2 chế độ:
- **Mang máy đến tiệm**: Khách hàng trực tiếp mang máy tính đến tiệm MQTech.
- **Sửa chữa tận nơi tại Buôn Ma Thuột**: Kỹ thuật viên đến tận nơi hỗ trợ trong bán kính ~15 km.

### Ngăn Xếp Công Nghệ (Tech Stack)
- **Frontend / Full-stack**: Next.js 16.4 (App Router, Turbopack, React 19).
- **Ngôn ngữ**: TypeScript 5 (Strict mode).
- **Styling**: Tailwind CSS v4.
- **Cơ sở dữ liệu**: PostgreSQL 16 (Alpine Linux) tự vận hành trên Fly.io, kết nối riêng tư qua mạng 6PN WireGuard mesh.
- **Lưu trữ tệp & media**: Cloudflare R2 với kiến trúc **3 bucket vật lý độc lập**:
  - `mqtech-media-staging`: Public media (marketing, banner, logo).
  - `mqtech-attachments-staging`: Strictly private customer attachments (ảnh máy tính khách hàng, số serial, tem bảo hành).
  - `mqtech-db-backups-staging`: Strictly private database dumps (sao lưu CSDL đã mã hóa).
- **Nền tảng hạ tầng**: Fly.io (`sin` region — Singapore) với máy ảo tối ưu chi phí (`shared-cpu-1x`, 256MB RAM).

---

## 2. Cấu Trúc Thư Mục Dự Án

```
MQTechWeb/
├── .agents/                      # Hệ thống quy tắc (rules) và kỹ năng (skills) agent
├── audit/                        # Báo cáo kiểm toán bảo mật và báo cáo các giai đoạn
│   └── P5_FINAL_REPORT.md        # Báo cáo tổng kết hoàn tất P5 & giải quyết review
├── docs/                         # Tài liệu đặc tả kiến trúc, nghiệp vụ và kế hoạch
│   ├── ACCEPTANCE_CRITERIA.md
│   ├── BUSINESS_REQUIREMENTS.md
│   ├── DESIGN_SYSTEM.md
│   ├── FLYIO_SAFETY.md
│   ├── P5_DEPLOYMENT_ARCHITECTURE.md
│   └── PHASE_PLAN.md
├── infra/                        # Cấu hình container hạ tầng
│   └── postgres/
│       ├── Dockerfile            # PostgreSQL 16 Alpine với custom config & wrapper
│       ├── entrypoint-wrapper.sh # Volume guard (/proc/mounts) & Version guard (PG 16)
│       ├── fly.toml              # Cấu hình Fly DB (mqtech-db, TCP check 5432)
│       ├── postgresql.conf       # Tinh chỉnh bộ nhớ 256MB (shared_buffers=32MB, work_mem=1MB)
│       └── init-scripts/
│           └── 01-init-roles-and-db.sh # Khởi tạo quyền least-privilege (format(%I, %L))
├── migrations/                   # Schema migrations (SQL thuần)
│   ├── 001_initial_schema.sql    # Schema khởi tạo: services, requests, admin_users
│   └── 002_media_storage.sql     # Schema metadata media với phân định visibility
├── public/                       # Tài nguyên tĩnh public (favicon, fonts, robots, sitemap)
├── scripts/                      # Kịch bản quản trị & tự động hóa an toàn
│   ├── backup.sh                 # Sao lưu CSDL an toàn (PGSERVICEFILE isolation)
│   ├── restore.sh                # Khôi phục CSDL an toàn (--single-transaction)
│   ├── credential-helper.mjs     # Quản lý pg_service.conf trong RAM tmpfs (0600)
│   ├── restore-guard.mjs         # Chặn khôi phục nhầm vào production/remote DB
│   ├── bootstrap-admin.mjs       # Khởi tạo tài khoản quản trị viên
│   └── migrate.mjs               # Trình chạy migrations kiểm tra SHA-256
├── src/                          # Mã nguồn ứng dụng Next.js
│   ├── app/                      # App Router (pages & API routes)
│   │   ├── admin/                # Dashboard quản trị & Triage yêu cầu dịch vụ
│   │   └── api/                  # API routes (service-requests, auth, attachments)
│   ├── components/               # UI components tái sử dụng
│   └── lib/                      # Domain logic, auth, db, security, storage
├── tests/                        # 22 bộ test suites tự động (152 test cases)
├── fly.toml                      # Cấu hình Fly Web canonical (app: mqtech)
├── fly.web.toml                  # Bản sao tiện ích khi chỉ định tường minh -c
├── next.config.ts                # Next.js config (images.unoptimized: true chống OOM)
└── package.json
```

---

## 3. Khởi Chạy Môi Trường Cục Bộ (Local Development)

### Yêu Cầu Tiên Quyết
- Node.js >= 20.x
- npm >= 10.x

### Các Bước Cài Đặt
1. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường**:
   Sao chép `.env.example` thành `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(Trong môi trường development, có thể bật `ALLOW_MEMORY_STORE="true"` để chạy thử nghiệm độc lập mà không cần PostgreSQL thật).*

3. **Chạy ứng dụng chế độ phát triển**:
   ```bash
   npm run dev
   ```
   Truy cập `http://localhost:3000` để xem trang web khách hàng hoặc `http://localhost:3000/admin` để truy cập trang quản trị.

---

## 4. Kiểm Thử & Đảm Bảo Chất Lượng (Quality Gates)

Trước khi thực hiện bất kỳ thay đổi nào, toàn bộ các kiểm tra sau phải vượt qua 100%:

```bash
# 1. Chạy toàn bộ 152 bài kiểm thử tự động
npm test

# 2. Kiểm tra kiểu tĩnh TypeScript (Strict Mode)
npm run typecheck

# 3. Phân tích mã nguồn tĩnh ESLint
npm run lint

# 4. Biên dịch thử nghiệm Production Build (Next.js Turbopack)
npm run build

# 5. Kiểm tra tính toàn vẹn migrations (Dry-Run)
node scripts/migrate.mjs --dry-run

# 6. Xác thực cấu hình Fly.io (Yêu cầu Fly CLI)
fly config validate -c fly.toml
fly config validate -c infra/postgres/fly.toml

# 7. Kiểm tra cú pháp shell scripts
bash -n scripts/backup.sh scripts/restore.sh infra/postgres/init-scripts/01-init-roles-and-db.sh infra/postgres/entrypoint-wrapper.sh
```

---

## 5. Quy Trình Cấp Phát Staging (Operator Runbook)

> [!IMPORTANT]
> Chỉ thực hiện các bước dưới đây khi người dùng đã cấp quyền phê duyệt triển khai rõ ràng.
> Tuyệt đối không can thiệp vào ứng dụng được bảo vệ: `openwebui-mqtech`.

### Bước 1: Khởi Tạo 3 Bucket Trên Cloudflare R2
Trên Cloudflare Dashboard:
1. Tạo bucket: `mqtech-media-staging` (bật domain phát triển `pub-staging.r2.dev`).
2. Tạo bucket: `mqtech-attachments-staging` (**STRICTLY PRIVATE** — không gắn public domain).
3. Tạo bucket: `mqtech-db-backups-staging` (**STRICTLY PRIVATE** — không gắn public domain).
4. Tạo API token R2 với quyền S3-compatible (lấy `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`).

### Bước 2: Cấp Phát Database Machine & Persistent Volume
```bash
# 1. Tạo ứng dụng database riêng tư
fly apps create mqtech-db

# 2. Tạo ổ đĩa bền vững 1GB tại Singapore
fly volumes create pgdata --region sin --size 1 --app mqtech-db

# 3. Cấu hình secrets CSDL
fly secrets set \
  POSTGRES_PASSWORD="<super_strong_postgres_password>" \
  APP_PASSWORD="<strong_app_runtime_password>" \
  MIGRATOR_PASSWORD="<strong_migrator_password>" \
  -a mqtech-db

# 4. Deploy container database
fly deploy infra/postgres -c infra/postgres/fly.toml -a mqtech-db
```

### Bước 3: Chạy Schema Migrations Qua Phiên Proxy
```bash
# Terminal 1: Thiết lập đường hầm bảo mật WireGuard
fly proxy 5433:5432 -a mqtech-db

# Terminal 2: Chạy migration với quyền migrator (DDL)
export MIGRATION_DATABASE_URL="postgres://mqtech_migrator:<migrator_password>@127.0.0.1:5433/mqtech"
node scripts/migrate.mjs

# Terminal 2: Khởi tạo tài khoản quản trị viên đầu tiên
export DATABASE_URL="postgres://mqtech_migrator:<migrator_password>@127.0.0.1:5433/mqtech"
export ADMIN_INIT_PASSWORD="<initial_admin_password>"
node scripts/bootstrap-admin.mjs

# Terminal 1: Đóng proxy (Ctrl + C)
```

### Bước 4: Cấp Phát Web Application Machine
```bash
# 1. Tạo ứng dụng web
fly apps create mqtech

# 2. Cấu hình secrets cho Web App (TUYỆT ĐỐI KHÔNG cấp MIGRATION_DATABASE_URL)
fly secrets set \
  DATABASE_URL="postgres://mqtech_app:<app_password>@mqtech-db.internal:5432/mqtech" \
  ADMIN_SESSION_SECRET="<random_32_byte_secret>" \
  R2_ACCOUNT_ID="<your_cloudflare_account_id>" \
  R2_ACCESS_KEY_ID="<your_r2_access_key_id>" \
  R2_SECRET_ACCESS_KEY="<your_r2_secret_access_key>" \
  -a mqtech

# 3. Deploy ứng dụng web
fly deploy -c fly.toml -a mqtech
```

### Bước 5: Kiểm Tra Nghiệm Thu Staging (Smoke Tests)
```bash
# 1. Kiểm tra liveness
curl -I https://mqtech.fly.dev/api/health
# Expected: HTTP 200

# 2. Kiểm tra readiness kết nối CSDL
curl -I https://mqtech.fly.dev/api/ready
# Expected: HTTP 200

# 3. Thử nghiệm nộp yêu cầu dịch vụ
# Mở trình duyệt truy cập https://mqtech.fly.dev, gửi form và kiểm tra mã xác nhận MQT-xxxx-xxxx.
```

---

## 6. Chính Sách Bảo Mật & Quyền Riêng Tư Dữ Liệu

1. **Không Thu Thập Mật Khẩu Máy Tính**: Biểu mẫu tiếp nhận dịch vụ cấm tuyệt đối và từ chối tự động mọi chuỗi có chứa mật khẩu Windows, BIOS, PIN, hoặc tài khoản cá nhân của khách hàng.
2. **Nguyên Tắc Đặc Quyền Tối Thiểu (Least Privilege)**:
   - Ứng dụng web runtime chỉ giữ quyền DML (`SELECT, INSERT, UPDATE, DELETE`) thông qua vai trò `mqtech_app`.
   - Mọi câu lệnh DDL (`CREATE TABLE`, `DROP`, `ALTER`) đều bị PostgreSQL từ chối.
3. **Bảo Mật Tệp Đính Kèm Khách Hàng**:
   - Ảnh thiết bị và số serial được lưu trữ trong bucket riêng tư `mqtech-attachments-staging`.
   - Tuyệt đối không cấp public URL.
   - Chỉ quản trị viên đã đăng nhập mới được cấp Presigned GET URL tạm thời (300 giây) thông qua API `POST /api/admin/attachments/presign-get`.
4. **Cách Ly Thông Tin Đăng Nhập Sao Lưu**:
   - Kịch bản `scripts/backup.sh` và `scripts/restore.sh` không truyền mật khẩu qua đối số dòng lệnh (`argv`), sử dụng tệp cấu hình `pg_service.conf` quyền `0600` trong RAM tmpfs.
   - Tệp sao lưu được mã hóa AES-256-GCM trước khi lưu trữ ngoài.
   - `scripts/restore-guard.mjs` bảo vệ bằng cờ `--single-transaction --exit-on-error` và từ chối mục tiêu không thuộc danh sách cho phép.
5. **Bảo Vệ Tài Nguyên Đang Chạy**:
   - Tuyệt đối không can thiệp, sửa đổi, deploy hay kết nối vào ứng dụng `openwebui-mqtech` (Machine: `2871574ae574e8`, Volume: `vol_4m3m9jdgen55793v`).

---

## 7. Giấy Phép & Bản Quyền
Dự án được xây dựng và phát triển riêng cho **MQTech — Dịch vụ máy tính Buôn Ma Thuột**. Bản quyền thuộc về MQTech © 2026.
