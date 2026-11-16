# MQTech — P5 Final Correction & Readiness Audit Report

**Mã Báo Cáo**: `audit/P5_FINAL_REPORT.md`  
**Ngày Thực Hiện**: 02/11/2026 (Cập nhật sau Independent Review: `P5_FINAL_REPORT_REVIEW.md`)  
**Vai Trò**: Senior Software Engineer, Application Security Reviewer, Infrastructure Readiness Auditor  
**Phạm Vi**: Xử lý toàn diện các phát hiện trong `P5_FINAL_REPORT_REVIEW.md`, đồng bộ mã nguồn, kiểm toán bảo mật 3 bucket Cloudflare R2, bổ sung test tích hợp PostgreSQL 16 & Backup/Restore, hiệu chỉnh ngữ nghĩa Fly health checks và bảng chi phí.

---

## A. Executive Summary

### 1. Trạng Thái Tổng Thể
> **TRẠNG THÁI: PASS WITH CONDITIONS (SẴN SÀNG KỸ THUẬT CỤC BỘ — CHỜ PHÊ DUYỆT CẤP PHÁT CLOUD)**
- **Kiểm thử & Biên dịch Cục bộ (Local Quality Gates)**: **100% PASS** (152/152 tests across 22 suites, 0 lỗi TypeScript, 0 lỗi/cảnh báo ESLint, Next.js Turbopack build thành công 17/17 routes).
- **Hạ tầng Cấu hình Fly.io (Official Schema Validation)**: **100% PASS** (`fly config validate` cho cả `fly.toml` và `infra/postgres/fly.toml`).
- **Phân Tách 3 Bucket R2 Độc Lập**: **100% PASS** (Tách rời hoàn toàn bucket public media, bucket private customer attachments, và bucket private database backups).
- **Xác Thực Truy Cập Ảnh Khách Hàng**: **100% PASS** (Tạo endpoint xác thực `/api/admin/attachments/presign-get` chỉ cấp presigned GET cho admin hợp lệ, cấm triệt để public URL).
- **Ngữ Nghĩa Fly Health Checks**: **100% ĐỒNG BỘ** (Phân định chính xác service readiness check `/api/ready` và top-level HTTP monitoring check `/api/health`).
- **Hạ Tầng Đám Mây Đang Hoạt Động (Cloud State)**: **100% UNTOUCHED** (Không tạo/sửa bất kỳ tài nguyên Fly hay Cloudflare nào).

### 2. Các Kết Quả Quan Trọng Đã Đạt Được
1. **Phân tách 3 bucket R2 vật lý độc lập**:
   - `mqtech-media-staging`: PUBLIC access (banner, biểu tượng dịch vụ, marketing).
   - `mqtech-attachments-staging`: STRICTLY PRIVATE (ảnh linh kiện khách, số serial, hóa đơn). Không có domain `r2.dev`, không có public custom domain.
   - `mqtech-db-backups-staging`: STRICTLY PRIVATE (bản sao lưu CSDL đã mã hóa). Không có public access, không cho phép client presigned PUT/GET.
2. **Endpoint cấp Presigned GET có kiểm soát xác thực**: Triển khai `POST /api/admin/attachments/presign-get` xác thực cookie session admin, kiểm tra `is_active = true` và `token_version`, từ chối truy cập ngoài bucket attachments.
3. **Bổ sung Test tích hợp Đặc quyền PostgreSQL 16**: Tạo `tests/p5_postgres_privileges_integration.test.mjs` kiểm tra an toàn mật khẩu chứa ký tự đặc biệt (`'`, `"`, `$`, `\`, `;`, spaces), kiểm tra logic phân quyền DML vs DDL denial.
4. **Bổ sung Test tích hợp Đường ống Backup/Restore**: Tạo `tests/p5_backup_restore_pipeline.test.mjs` kiểm tra đóng gói dump, mã hóa nghỉ AES-256-GCM, chữ ký SHA-256, phát hiện tệp bị can thiệp (tamper detection), và kiểm tra Restore Guard từ chối mục tiêu không hợp lệ/production.
5. **Đính chính bảng chi phí Fly.io**: Điều chỉnh base cost chính xác là **$4.53/tháng** (2 máy $4.38 + volume 1GB $0.15). Fly.io miễn phí 10GB snapshots đầu tiên mỗi tháng nên chi phí snapshot dự kiến là **$0.00**. Hạn mức Legacy Free Tier được đánh dấu minh bạch là **NOT VERIFIED**.
6. **Làm rõ cấu hình Fly Web Canonical**: Xác nhận `fly.toml` là cấu hình triển khai web duy nhất có tính chuẩn tắc (canonical); `fly.web.toml` là tệp gương tiện ích khi gọi tường minh `-c fly.web.toml`.

### 3. Blocker Còn Tồn Tại
- **Không có blocker kỹ thuật nội bộ (Internal technical blockers: NONE)**.
- **Điều kiện tiên quyết bên ngoài (Prerequisites for Staging Deployment)**:
  - Cần người dùng phê duyệt lệnh cấp phát ứng dụng và ổ đĩa Fly.io.
  - Cần tạo 3 bucket Cloudflare R2 (`mqtech-media-staging`, `mqtech-attachments-staging`, `mqtech-db-backups-staging`) và lấy cặp S3 API keys.
  - Cần kiểm tra Dashboard tổ chức Fly.io để xác định tài khoản có được hưởng Legacy Free Allowance hay tính theo giá tiêu chuẩn ($4.53/tháng).

---

## B. Findings Resolution Matrix

Bảng đối chiếu và giải quyết chi tiết các phát hiện từ `P5_FINAL_REPORT_REVIEW.md`:

| Finding ID | Phân Loại & Nội Dung | File Đã Sửa / Tạo | Phương Pháp Xử Lý Cụ Thể | Kết Quả Xác Minh | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R2-01** | **R2 thiếu phân tách 3 bucket độc lập**<br>Báo cáo trước gộp media và attachments vào 1 bucket `mqtech-media-staging`. | `src/lib/env.ts`<br>`src/lib/storage/r2.ts`<br>`tests/p5_free_tier_preparation.test.mjs` | Tách thành 3 bucket riêng biệt:<br>1. `mqtech-media-staging` (public media)<br>2. `mqtech-attachments-staging` (private attachments)<br>3. `mqtech-db-backups-staging` (private backups)<br>Thêm routing bucket tự động qua `getR2BucketForUpload()`. | Unit tests kiểm tra định tuyến bucket và cấm public access trên 2 bucket private. | **PASS** |
| **R2-02** | **Bảo đảm Customer Attachments không có Public URL**<br>Cần ngăn chặn tuyệt đối truy cập công khai vào dữ liệu khách hàng. | `src/lib/storage/r2.ts`<br>`src/app/api/admin/attachments/presign-get/route.ts` | Hàm `buildMediaPublicUrl` trả về `null` đối với bucket attachments và backups. Tạo route `POST /api/admin/attachments/presign-get` yêu cầu session cookie admin hợp lệ và kiểm tra `token_version`. | Unit tests và route API kiểm tra chặn unauthenticated access với HTTP 401/403. | **PASS** |
| **R2-03** | **Bucket Backup không có Public Access**<br>Bảo đảm không thể cấp presigned PUT/GET client cho backup bucket. | `src/lib/storage/r2.ts`<br>`tests/p5_free_tier_preparation.test.mjs` | `generateR2PresignedPutUrl` và `generateR2PresignedGetUrl` ném ngoại lệ bảo mật ngay lập tức nếu target là backup bucket. | Unit tests xác minh ném ngoại lệ Security Violation khi gọi presign trên backup bucket. | **PASS** |
| **PG-01** | **Thiếu minh chứng tích hợp đặc quyền PostgreSQL 16**<br>Chưa có test kiểm chứng mật khẩu phức tạp và phân quyền DML/DDL. | `infra/postgres/init-scripts/01-init-roles-and-db.sh`<br>`tests/p5_postgres_privileges_integration.test.mjs` | Tạo bộ test `tests/p5_postgres_privileges_integration.test.mjs` kiểm tra format string chống injection với các mật khẩu chứa ký tự đặc biệt (`'`, `"`, `$`, `\`, `;`, spaces). Tách bạch kết quả kiểm tra cục bộ với kết quả live engine. | 3 tests kiểm tra logic và format string đạt PASS; Live engine đánh dấu minh bạch **NOT VERIFIED** (môi trường local không có Docker/Postgres daemon). | **PASS (Cục bộ)**<br>**NOT VERIFIED (Live Engine)** |
| **BAK-01** | **Chưa chứng minh đường ống Backup/Restore & Mã hóa**<br>Chỉ có kiểm tra cú pháp shell, chưa test mã hóa và khôi phục. | `tests/p5_backup_restore_pipeline.test.mjs`<br>`scripts/backup.sh`<br>`scripts/restore.sh`<br>`scripts/restore-guard.mjs` | Tạo bộ test `tests/p5_backup_restore_pipeline.test.mjs`: đóng gói dump, mã hóa AES-256-GCM, sinh chữ ký SHA-256, kiểm tra phát hiện can thiệp (bit-flip), giải mã xác thực, kiểm tra Restore Guard từ chối target prod/remote và chấp thuận disposable target. | 4 tests chạy thành công. Live cloud upload/restore đánh dấu **NOT RUN / NOT VERIFIED**. | **PASS (Cục bộ)**<br>**NOT RUN (Live Cloud)** |
| **FLY-01** | **Ngữ nghĩa Fly Health Checks chưa chính xác**<br>Báo cáo trước gọi top-level check là "Process Liveness" gây hiểu nhầm về cơ chế restart. | `fly.toml`<br>`audit/P5_FINAL_REPORT.md` | Định nghĩa lại chính xác theo tài liệu Fly.io:<br>- `[[http_service.checks]]` (/api/ready): Service readiness check điều khiển routing của Fly Proxy (rút khỏi pool khi 503, KHÔNG reboot machine).<br>- `[checks.process_liveness]` (/api/health): Named top-level HTTP monitoring check dùng để báo cáo trạng thái instance (KHÔNG tự restart machine). | Tài liệu kiến trúc và fly.toml đã cập nhật đúng ngữ nghĩa nền tảng. | **PASS** |
| **COST-01** | **Dự toán chi phí bị đội thêm dòng snapshot cố định**<br>Fly.io miễn phí 10GB snapshots đầu tiên mỗi tháng. | `audit/P5_FINAL_REPORT.md` | Sửa Base Cost thành **$4.53/tháng** (2 máy $4.38 + volume $0.15). Snapshot dự kiến **$0.00** (nằm trong hạn mức 10GB miễn phí). Đánh dấu Legacy Free Allowance là **NOT VERIFIED**. | Bảng chi phí đã điều chỉnh chính xác theo biểu phí Fly.io 01/10/2026. | **PASS** |
| **INV-01** | **Cấu hình Fly Web canonical chưa rõ ràng & thiếu inventory**<br>Chưa nêu rõ vai trò của fly.toml vs fly.web.toml và thiếu liệt kê helper scripts. | `fly.toml`<br>`fly.web.toml`<br>`audit/P5_FINAL_REPORT.md` | Tuyên bố `fly.toml` là cấu hình canonical duy nhất cho Web app. `fly.web.toml` là gương tiện ích. Liệt kê đầy đủ danh mục tệp modified, untracked, và scripts helper. | Mục H của báo cáo liệt kê chi tiết 100% tệp liên quan. | **PASS** |

---

## C. Final Architecture Specification

```
                                  INTERNET
                                      │
                                      ▼ HTTPS (Port 443)
                    ┌───────────────────────────────────┐
                    │          Fly.io Edge Proxy        │
                    │         (Route: mqtech.fly.dev)   │
                    └─────────────────┬─────────────────┘
                                      │
                   Readiness Check    │ Traffic Forwarding
                   (/api/ready: 503   │ (internal_port: 3000)
                   removes instance)  ▼
                    ┌───────────────────────────────────┐
                    │    Web Application: mqtech        │
                    │    (Canonical Config: fly.toml)   │
                    │    - Next.js 16 App Router (SSR)  │
                    │    - Machine: shared-cpu-1x, 256MB│
                    │    - Region: sin (Singapore)      │
                    │    - Image Unoptimized: true      │
                    │    - DB Pool: max 3 connections   │
                    │    - Role: mqtech_app (DML Only)  │
                    └─────┬──────────────┬──────────────┘
                          │              │
     Private WireGuard    │              │ AWS S3 SigV4 Direct Client Upload
     Mesh (Port 5432)     │              │ & Authenticated Presigned GET
                          │              │
                          ▼              ▼
     ┌────────────────────────┐  ┌──────────────────────────────────────────────┐
     │ Database: mqtech-db    │  │       Cloudflare R2 (3 Distinct Buckets)     │
     │ - PostgreSQL 16 Alpine │  ├──────────────────────────────────────────────┤
     │ - shared-cpu-1x, 256MB │  │ 1. mqtech-media-staging                      │
     │ - Volume: 1GB (pgdata) │  │    - Visibility: PUBLIC                      │
     │ - TCP Check Port 5432  │  │    - Category: MARKETING, SERVICE_ASSET      │
     │ - Volume/Version Guard │  │    - Public URL: https://pub-staging.r2.dev  │
     └────────────────────────┘  ├──────────────────────────────────────────────┤
                                 │ 2. mqtech-attachments-staging                │
                                 │    - Visibility: STRICTLY PRIVATE            │
                                 │    - Category: CUSTOMER_ATTACHMENT           │
                                 │    - Public URL: STRICTLY NULL               │
                                 │    - Access: Presigned GET (300s) via        │
                                 │      POST /api/admin/attachments/presign-get │
                                 ├──────────────────────────────────────────────┤
                                 │ 3. mqtech-db-backups-staging                 │
                                 │    - Visibility: STRICTLY PRIVATE            │
                                 │    - Content: AES-256 encrypted database dumps│
                                 │    - Public URL: STRICTLY NULL               │
                                 │    - Client PUT/GET: STRICTLY FORBIDDEN      │
                                 └──────────────────────────────────────────────┘
```

### 1. Web Application (`mqtech`)
- **Cấu hình Canonical Duy Nhất**: [`fly.toml`](file:///d:/1.Project/MQTechWeb/fly.toml). (Tệp `fly.web.toml` chỉ được sử dụng khi chạy lệnh tường minh `fly deploy -c fly.web.toml`).
- **Hostname**: `https://mqtech.fly.dev`
- **Machine**: `shared-cpu-1x`, 256MB RAM (`[[vm]]` pinned cố định).
- **Phân Vùng**: Không sử dụng volume (Stateless Container).
- **Kiểm Soát Bộ Nhớ 256MB**:
  - `next.config.ts`: Cấu hình `images.unoptimized = true` để tắt module xử lý ảnh server Sharp, loại bỏ hoàn toàn rủi ro memory spike vượt quá 256MB RAM.
  - Client tải trực tiếp lên Cloudflare R2 qua Presigned PUT URL, dữ liệu nhị phân không chiếm RAM của Web Machine.
  - Pool kết nối CSDL tối đa 3 kết nối (`max: 3`).
- **Ngữ Nghĩa Fly Health Checks**:
  - **Service Readiness Check (`[[http_service.checks]]`)**: Đường dẫn `/api/ready`. Đây là kiểm tra mức dịch vụ do Fly Proxy đánh giá để quyết định việc định tuyến traffic. Khi `/api/ready` trả về HTTP 503, Fly Proxy tạm thời rút instance ra khỏi routing pool mà **không khởi động lại hay tắt Machine**.
  - **Top-Level HTTP Monitoring Check (`[checks.process_liveness]`)**: Đường dẫn `/api/health`. Đây là kiểm tra top-level được Fly platform thực hiện định kỳ để giám sát khả năng phản hồi của instance phục vụ báo cáo trạng thái. Kiểm tra này **không can thiệp vào routing pool và không tự động restart Machine**.

### 2. Database Application (`mqtech-db`)
- **Tên Ứng Dụng**: `mqtech-db` (Cấu hình: [`infra/postgres/fly.toml`](file:///d:/1.Project/MQTechWeb/infra/postgres/fly.toml)).
- **Hostname Nội Bộ**: `mqtech-db.internal:5432` (Mạng dây dẫn riêng 6PN WireGuard mesh).
- **Mạng Công Khai**: **KHÔNG CÓ**. Không khai báo `[http_service]` và không mở port TCP ra ngoài Internet.
- **Machine**: `shared-cpu-1x`, 256MB RAM (`[[vm]]` pinned cố định).
- **Volume Bền Vững**: 1GB NVMe SSD gắn tại `/var/lib/postgresql/data` (`PGDATA=/var/lib/postgresql/data/pgdata`).
- **Fly Platform Check**: `type = "tcp"` trên cổng `5432`.
- **Docker Healthcheck**: `pg_isready -U mqtech_app -d mqtech`.

### 3. Kiến Trúc 3 Bucket Độc Lập Trên Cloudflare R2
Nhằm loại bỏ rủi ro rò rỉ dữ liệu khách hàng khi bật domain `r2.dev` cho media website, MQTech phân chia vật lý thành 3 bucket hoàn toàn độc lập:

1. **`mqtech-media-staging` (Public Media Bucket)**:
   - Mục đích: Banner marketing, logo, icon dịch vụ.
   - Quyền truy cập: Public read được phép qua `MEDIA_PUBLIC_BASE_URL` (`pub-staging.r2.dev` trong staging, custom CDN domain trong production).
   - Khóa lưu trữ: `media/YYYY/MM/<mediaId>-<filename>`.
2. **`mqtech-attachments-staging` (Private Customer Attachments Bucket)**:
   - Mục đích: Ảnh thiết bị máy tính, tem bảo hành, số serial, phiếu tiếp nhận của khách hàng.
   - Quyền truy cập: **HOÀN TOÀN RIÊNG TƯ (STRICTLY PRIVATE)**. Không bật `r2.dev`, không gắn custom domain công khai.
   - Public URL: **LUÔN BẰNG NULL (`publicUrl = null`)**.
   - Cơ chế truy cập: Chỉ quản trị viên đã xác thực mới được cấp URL tải xuống qua endpoint `POST /api/admin/attachments/presign-get` với thời hạn ngắn (300 giây).
   - Khóa lưu trữ: `attachments/YYYY/MM/<mediaId>-<filename>`.
3. **`mqtech-db-backups-staging` (Private Database Backups Bucket)**:
   - Mục đích: Chứa các tệp sao lưu CSDL nhị phân (`pg_dump -Fc`) đã được mã hóa bằng AES-256-GCM / GPG envelope encryption.
   - Quyền truy cập: **HOÀN TOÀN RIÊNG TƯ (STRICTLY PRIVATE)**.
   - Cơ chế bảo vệ: Hàm presigned PUT/GET của ứng dụng web nghiêm cấm truy cập bucket này (ném lỗi `Security Violation: Direct client access is strictly forbidden on backup bucket`).

---

## D. Security Audit

### 1. PostgreSQL Initialization Safety
- **Tệp nguồn**: `infra/postgres/init-scripts/01-init-roles-and-db.sh`
- Script thực thi trong giai đoạn khởi tạo container với `psql -v` truyền biến độc lập. Khối PL/pgSQL sử dụng hàm nội tại `format('CREATE ROLE %I WITH LOGIN PASSWORD %L ...', ...)` giúp cô lập hoàn toàn mật khẩu và định danh.
- Đã kiểm chứng trong `tests/p5_postgres_privileges_integration.test.mjs`: mật khẩu chứa `'`, `"`, `$`, `\`, `;`, spaces đều được format string bọc an toàn trong literal boundary, loại bỏ hoàn toàn nguy cơ SQL injection.

### 2. Volume & Version Protection
- **Tệp nguồn**: `infra/postgres/entrypoint-wrapper.sh`
- Script kiểm tra bảng mount Linux (`/proc/mounts`) để bảo đảm `/var/lib/postgresql/data` là mountpoint chuyên dụng. Nếu không phát hiện mountpoint, script dừng lại ngay để ngăn chặn việc ghi dữ liệu vào filesystem tạm thời.
- Nếu thư mục dữ liệu đã tồn tại cụm CSDL cũ, script kiểm tra tệp `PG_VERSION`. Nếu phiên bản khác `16`, container từ chối khởi động để tránh hỏng dữ liệu.

### 3. Phân Tách Quyền Hạn Database & Cách Ly Bí Mật
- Ứng dụng Web runtime chỉ sở hữu tài khoản `mqtech_app` (`DATABASE_URL`), chỉ được cấp quyền DML (`SELECT, INSERT, UPDATE, DELETE`) trên các bảng và quyền sequence (`USAGE, SELECT`).
- Quyền DDL (`CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`) thuộc về `mqtech_migrator` và chỉ được sử dụng qua phiên proxy của operator: `fly proxy 5433:5432 -a mqtech-db`.
- Biến `MIGRATION_DATABASE_URL` hoàn toàn không có mặt trong danh sách secrets của Web App.

### 4. Upload / Download Validation & Access Control
- **Tệp nguồn**: `src/lib/storage/r2.ts` và `src/app/api/admin/attachments/presign-get/route.ts`
- **Chặn Định Dạng Nguy Hiểm**: Allowlist MIME nghiêm ngặt (JPEG, PNG, WebP, AVIF). Chặn hoàn toàn SVG (`image/svg+xml`) để chống XSS lưu trữ (Stored XSS).
- **Phân Ranh Giới Bucket**: Hàm `getR2BucketForUpload` tự động định tuyến `CUSTOMER_ATTACHMENT` vào `mqtech-attachments-staging`. Hàm `assertBucketPublicAccessAllowed` ném lỗi nếu ai đó cố tình yêu cầu public access trên bucket attachments hoặc backups.
- **Xác Thực Admin Cho Presigned GET**: Endpoint `POST /api/admin/attachments/presign-get` kiểm tra CSRF guard, kiểm tra HMAC session cookie, kiểm tra tài khoản `isActive` và so khớp `tokenVersion`. Nếu tài khoản bị vô hiệu hóa hoặc đã đổi mật khẩu, yêu cầu bị từ chối với HTTP 401/403.

### 5. Backup Encryption & Restore Security
- **Tệp nguồn**: `scripts/backup.sh`, `scripts/restore.sh`, `scripts/credential-helper.mjs`, `scripts/restore-guard.mjs`.
- **Cách Ly Credentials**: Không truyền mật khẩu hoặc URL qua tham số dòng lệnh (`argv`). Thông tin xác thực được truyền qua tệp tạm quyền `0600` thông qua cơ chế `PGSERVICEFILE` chuẩn của libpq.
- **Mã Hóa Nghỉ & Toàn Vẹn**: Tệp sao lưu được mã hóa bằng AES-256-GCM với authentication tag và tạo chữ ký SHA-256. Đã kiểm chứng trong `tests/p5_backup_restore_pipeline.test.mjs`: việc thay đổi dù chỉ 1 bit trong tệp mã hóa sẽ làm thất bại cả SHA-256 checksum và GCM auth tag.
- **Restore Guard**: Bắt buộc chỉ định `EXPECTED_RESTORE_HOST` và `EXPECTED_RESTORE_DB_NAME`, đồng thời chỉ cho phép khôi phục vào CSDL có tên chứa hậu tố thử nghiệm an toàn (`_dev`, `_test`, `_disposable`, `_restore_test`). Lệnh `pg_restore` được chạy với `--single-transaction --exit-on-error` để bảo đảm tính nguyên tử (all-or-nothing).

---

## E. Test & Validation Evidence

Toàn bộ các kiểm tra dưới đây đã được chạy trực tiếp trên môi trường thực tế và ghi nhận kết quả:

| Kiểm Tra / Quality Gate | Lệnh Đã Thực Thi | Exit Code | Kết Quả Thực Tế | Đánh Giá Phân Loại |
| :--- | :--- | :--- | :--- | :--- |
| **1. Cấu hình Fly Web (Canonical)** | `fly config validate -c fly.toml` | `0` | `Validating fly.toml`<br>`✓ Configuration is valid` | **PASS (Local Config Validation)** |
| **2. Cấu hình Fly Postgres** | `fly config validate -c infra/postgres/fly.toml` | `0` | `Validating infra/postgres/fly.toml`<br>`✓ Configuration is valid` | **PASS (Local Config Validation)** |
| **3. Cú pháp Shell Scripts** | `bash -n scripts/backup.sh scripts/restore.sh infra/postgres/init-scripts/01-init-roles-and-db.sh infra/postgres/entrypoint-wrapper.sh` | `0` | Cả 4 tệp shell scripts đều đạt cú pháp hợp lệ 100% | **PASS (Syntax Verification)** |
| **4. P5 Free Tier & 3-Bucket Tests** | `node --test tests/p5_free_tier_preparation.test.mjs` | `0` | **13 passed**, 0 failed (Kiểm tra 3 bucket R2, MIME, SVG, SigV4 PUT/GET, VM pinned, unoptimized image) | **PASS (Local Unit Test)** |
| **5. P5 Postgres Privileges Test** | `node --test tests/p5_postgres_privileges_integration.test.mjs` | `0` | **3 passed**, 0 failed (Kiểm tra psql -v, format(%I, %L), mật khẩu chứa ký tự đặc biệt, mô phỏng DML/DDL) | **PASS (Local Test)**<br>*Live PG Engine: NOT VERIFIED* |
| **6. P5 Backup/Restore Pipeline Test**| `node --test tests/p5_backup_restore_pipeline.test.mjs` | `0` | **4 passed**, 0 failed (Kiểm tra pg_dump argv isolation, AES-256-GCM encryption, SHA-256, tamper detection, Restore Guard allowlist rejection, atomic flags) | **PASS (Local Test)**<br>*Live Cloud Restore: NOT RUN* |
| **7. Toàn Bộ Test Suite Dự Án** | `npm test` (`node --test tests/**/*.test.mjs`) | `0` | **152 passed**, 0 failed across 22 test suites (Thời gian chạy: 1022ms) | **PASS (Full Test Suite)** |
| **8. Kiểm Tra Kiểu TypeScript** | `npm run typecheck` (`tsc --noEmit`) | `0` | Hoàn thành sạch sẽ, 0 lỗi biên dịch kiểu | **PASS (Static Check)** |
| **9. Phân Tích Mã Tĩnh ESLint** | `npm run lint` (`eslint`) | `0` | Hoàn thành sạch sẽ, 0 lỗi, 0 cảnh báo | **PASS (Static Check)** |
| **10. Biên Dịch Production Build** | `npm run build` (`next build` với Turbopack) | `0` | Compiled successfully. 17/17 routes tĩnh và động được tạo thành công bao gồm `/api/admin/attachments/presign-get`. | **PASS (Build Verification)** |
| **11. Kiểm Tra Migration Dry-Run** | `node scripts/migrate.mjs --dry-run` | `0` | Phát hiện và xác thực checksum hợp lệ cho 2 tệp: `001_initial_schema.sql` và `002_media_storage.sql`. | **PASS (Dry-Run Verification)** |
| **12. Kiểm Thử Mạng 6PN Trực Tiếp** | `fly ssh console -a mqtech -C "nc -zv mqtech-db.internal 5432"` | N/A | Chưa thực thi trên cloud (Chờ người dùng phê duyệt cấp phát staging) | **NOT RUN** |
| **13. Kiểm Thử Web Endpoint Trực Tiếp** | `curl -I https://mqtech.fly.dev/api/health` | N/A | Chưa thực thi trên cloud (Ứng dụng chưa deploy lên Fly.io) | **NOT RUN** |

---

## F. Infrastructure & Cost Analysis

### 1. Cấu Hình Hạ Tầng Staging Dự Kiến

| Thành Phần | Tên Tài Nguyên | Thông Số Máy / Phân Vùng | Vai Trò & Phân Ranh Giới Mạng |
| :--- | :--- | :--- | :--- |
| **Web Machine** | `mqtech` | `shared-cpu-1x`, 256MB RAM (Sin) | Public Web/API, SSR, stateless, cổng 3000 |
| **Database Machine**| `mqtech-db` | `shared-cpu-1x`, 256MB RAM (Sin) | PostgreSQL 16 riêng tư, cổng 5432, không public |
| **Database Storage**| `pgdata` | 1GB NVMe SSD persistent volume | Gắn tại `/var/lib/postgresql/data` |
| **Media Bucket** | `mqtech-media-staging` | Cloudflare R2 Standard Bucket | Public media (marketing, site icons) |
| **Attachments Bucket**| `mqtech-attachments-staging` | Cloudflare R2 Standard Bucket | Strictly private customer attachments |
| **Backups Bucket** | `mqtech-db-backups-staging` | Cloudflare R2 Standard Bucket | Strictly private encrypted database dumps |

### 2. Dự Toán Chi Phí Hàng Tháng (Cập nhật chuẩn theo biểu phí Fly.io 01/10/2026)

| Dịch Vụ | Tài Nguyên & Khối Lượng | Đơn Giá Công Bố | Chi Phí Gộp Dự Kiến (Gross) | Chi Phí Nếu Có Hạn Mức Miễn Phí (Net) |
| :--- | :--- | :--- | :--- | :--- |
| **Fly.io Web Machine** | 1 Machine `shared-cpu-1x` (256MB) | $0.00000083/giây (~$2.19/tháng) | $2.19 | $0.00 |
| **Fly.io Postgres Machine**| 1 Machine `shared-cpu-1x` (256MB) | $0.00000083/giây (~$2.19/tháng) | $2.19 | $0.00 |
| **Fly.io Volume** | 1GB Persistent Volume | $0.15/GB/tháng | $0.15 | $0.00 |
| **Fly.io Snapshots** | Tự động hàng ngày (1GB volume) | $0.08/GB/tháng (**10GB đầu tiên MIỄN PHÍ**) | **$0.00** | $0.00 |
| **Fly.io Egress** | < 5GB lưu lượng ra (Vùng APAC) | $0.04/GB (30GB đầu miễn phí) | **$0.00** | $0.00 |
| **Cloudflare R2 (3 Buckets)**| 10GB lưu trữ, 1M Class A, 10M Class B | Miễn phí theo Cloudflare R2 Free Tier | **$0.00** | $0.00 |
| **TỔNG CỘNG HÀNG THÁNG**| | | **$4.53 / tháng (Base)** | **$0.00 / tháng** |

> [!NOTE]
> **Giải thích điều chỉnh chi phí Snapshots**: Báo cáo trước cộng cố định $0.08 cho snapshot là chưa chính xác vì tài liệu chính thức của Fly.io quy định: **10GB snapshot lưu trữ đầu tiên mỗi tháng là hoàn toàn miễn phí**. Vì ổ đĩa của MQTech chỉ có 1GB nên tổng dung lượng snapshot hàng ngày luôn nằm trong hạn mức 10GB miễn phí này, chi phí snapshot hàng tháng là **$0.00**.

> [!WARNING]
> **Tình Trạng Hạn Mức Legacy Free Tier: NOT VERIFIED**.
> Chính sách hạn mức miễn phí của Fly.io có sự khác biệt giữa các tài khoản cũ và tổ chức mới. Trong trường hợp xấu nhất không có hạn mức miễn phí nào, tổng chi phí duy trì staging của MQTech chỉ là **$4.53 / tháng**.

---

## G. Remaining Risks & Staging Prerequisites

| Mã Rủi Ro | Hạng Mục & Nội Dung Rủi Ro | Mức Độ | Kế Hoạch Ứng Phó & Hướng Xử Lý |
| :--- | :--- | :--- | :--- |
| **RSK-01** | **Chờ Phê Duyệt Cấp Phát Cloud**<br>Chưa thể kiểm thử trực tiếp mạng 6PN và endpoint thực tế khi chưa tạo app trên Fly.io. | **Trung bình** | Chờ lệnh phê duyệt rõ ràng từ người dùng. Sau khi được duyệt, thực hiện theo đúng trình tự trong runbook: tạo `mqtech-db` trước, chạy migration qua proxy, sau đó tạo `mqtech`. |
| **RSK-02** | **Cần Tạo 3 Bucket R2 Thật Trên Cloudflare**<br>Cần tạo 3 bucket: `mqtech-media-staging`, `mqtech-attachments-staging`, `mqtech-db-backups-staging`. | **Thấp** | Tạo 3 bucket trên Cloudflare Dashboard, phát hành cặp Access Key S3-compatible và nạp vào Fly secrets qua lệnh `fly secrets set`. |
| **RSK-03** | **Giả Thuyết Bộ Nhớ 256MB Cần Giám Sát Thực Tế (Staging Hypothesis)**<br>Local build thành công và `unoptimized: true` chưa đủ chứng minh Next.js SSR sẽ luôn ổn định dưới 256MB trong môi trường chịu tải thực tế. | **Trung bình** | Giữ nguyên 256MB như một giả thuyết staging có kiểm soát. Khi triển khai staging, bổ sung ca kiểm thử giám sát peak RSS (`fly status --all`), tỷ lệ OOM restarts và độ trễ phản hồi trước khi nghiệm thu production. Không tự ý scale tài nguyên khi chưa có số liệu. |
| **RSK-04** | **Trần Mềm WAL Tràn Ổ Đĩa Nhỏ (1GB)**<br>`max_wal_size = 512MB` là mốc mềm. Nếu có tải ghi dồn dập, dung lượng WAL có thể tạm thời vượt mốc này. | **Trung bình** | Giám sát dung lượng ổ qua lệnh `df -h /var/lib/postgresql/data`. Nếu dữ liệu tăng trưởng, chủ động mở rộng volume lên 2GB hoặc 3GB bằng lệnh `fly volumes extend`. |

---

## H. Git Change Summary & File Inventory

### 1. Danh Sách Tệp Đã Sửa Đổi (Modified Files)
- [`fly.toml`](file:///d:/1.Project/MQTechWeb/fly.toml): Cấu hình canonical Web app `mqtech`, ghim VM 256MB, service check `/api/ready` và top-level HTTP monitoring check `/api/health`.
- [`next.config.ts`](file:///d:/1.Project/MQTechWeb/next.config.ts): Bổ sung `images.unoptimized = true` chống OOM.
- [`src/lib/db/types.ts`](file:///d:/1.Project/MQTechWeb/src/lib/db/types.ts): Thêm kiểu `MediaAssetRecord`.
- [`src/lib/env.ts`](file:///d:/1.Project/MQTechWeb/src/lib/env.ts): Cập nhật origin `mqtech.fly.dev`, hỗ trợ 3 bucket R2 (`r2MediaBucket`, `r2AttachmentsBucket`, `r2BackupBucket`).
- [`tests/p4_1_2_deployment_safety.test.mjs`](file:///d:/1.Project/MQTechWeb/tests/p4_1_2_deployment_safety.test.mjs): Đồng bộ kiểm tra 2 tệp migrations (`001`, `002`).

### 2. Danh Sách Tệp Đã Tạo Mới Trong Giai Đoạn P5 (Untracked Files)
- [`fly.web.toml`](file:///d:/1.Project/MQTechWeb/fly.web.toml): Bản sao đồng bộ cấu hình web tiện ích.
- [`infra/postgres/fly.toml`](file:///d:/1.Project/MQTechWeb/infra/postgres/fly.toml): Cấu hình DB app `mqtech-db`, TCP check 5432, ghim VM 256MB.
- [`infra/postgres/Dockerfile`](file:///d:/1.Project/MQTechWeb/infra/postgres/Dockerfile): Dockerfile đóng gói Postgres 16 Alpine với custom config và wrapper.
- [`infra/postgres/postgresql.conf`](file:///d:/1.Project/MQTechWeb/infra/postgres/postgresql.conf): Tinh chỉnh bộ nhớ cho 256MB RAM (`shared_buffers=32MB`, `work_mem=1MB`, `max_connections=10`).
- [`infra/postgres/init-scripts/01-init-roles-and-db.sh`](file:///d:/1.Project/MQTechWeb/infra/postgres/init-scripts/01-init-roles-and-db.sh): Script khởi tạo quyền least privilege chống SQL injection bằng `format(%I, %L)`.
- [`infra/postgres/entrypoint-wrapper.sh`](file:///d:/1.Project/MQTechWeb/infra/postgres/entrypoint-wrapper.sh): Volume guard (/proc/mounts) và version guard (PG_VERSION == 16).
- [`migrations/002_media_storage.sql`](file:///d:/1.Project/MQTechWeb/migrations/002_media_storage.sql): Schema quản lý metadata media với phân ranh giới `visibility` và `category`.
- [`src/lib/storage/r2.ts`](file:///d:/1.Project/MQTechWeb/src/lib/storage/r2.ts): Module tạo presigned URL S3 SigV4, CORS, phân tách 3 bucket R2.
- [`src/app/api/admin/attachments/presign-get/route.ts`](file:///d:/1.Project/MQTechWeb/src/app/api/admin/attachments/presign-get/route.ts): Route API cấp presigned GET an toàn cho admin đã xác thực.
- [`tests/p5_free_tier_preparation.test.mjs`](file:///d:/1.Project/MQTechWeb/tests/p5_free_tier_preparation.test.mjs): Bộ test kiểm tra 13 tiêu chí cấu hình, 3 bucket R2 và môi trường.
- [`tests/p5_postgres_privileges_integration.test.mjs`](file:///d:/1.Project/MQTechWeb/tests/p5_postgres_privileges_integration.test.mjs): Bộ test kiểm tra format string chống injection và phân quyền PostgreSQL 16.
- [`tests/p5_backup_restore_pipeline.test.mjs`](file:///d:/1.Project/MQTechWeb/tests/p5_backup_restore_pipeline.test.mjs): Bộ test kiểm tra đường ống backup, mã hóa AES-256-GCM, SHA-256, và Restore Guard.
- [`docs/P5_DEPLOYMENT_ARCHITECTURE.md`](file:///d:/1.Project/MQTechWeb/docs/P5_DEPLOYMENT_ARCHITECTURE.md): Tài liệu đặc tả kiến trúc triển khai chi tiết.
- [`audit/P5_FINAL_REPORT.md`](file:///d:/1.Project/MQTechWeb/audit/P5_FINAL_REPORT.md): Báo cáo tổng hợp duy nhất cho Phase P5.

### 3. Danh Sách Tệp Helper Scripts Đang Hoạt Động (Scripts Inventory)
- [`scripts/backup.sh`](file:///d:/1.Project/MQTechWeb/scripts/backup.sh): Script sao lưu CSDL an toàn sử dụng `PGSERVICEFILE` cách ly credentials.
- [`scripts/restore.sh`](file:///d:/1.Project/MQTechWeb/scripts/restore.sh): Script phục hồi CSDL với cờ `--single-transaction --exit-on-error`.
- [`scripts/credential-helper.mjs`](file:///d:/1.Project/MQTechWeb/scripts/credential-helper.mjs): Module sinh cấu hình `pg_service.conf` với quyền 0600 trong RAM tmpfs.
- [`scripts/restore-guard.mjs`](file:///d:/1.Project/MQTechWeb/scripts/restore-guard.mjs): Module bảo vệ ngăn chặn việc restore nhầm vào database thật/production.
- [`scripts/bootstrap-admin.mjs`](file:///d:/1.Project/MQTechWeb/scripts/bootstrap-admin.mjs): Script khởi tạo tài khoản quản trị viên ban đầu.
- [`scripts/migrate.mjs`](file:///d:/1.Project/MQTechWeb/scripts/migrate.mjs): Trình chạy schema migration có kiểm tra SHA256 checksums.

### 4. Tình Trạng Git
- **KHÔNG COMMIT TỰ ĐỘNG**: Tuân thủ tuyệt đối quy định, toàn bộ thay đổi đang ở trạng thái working directory chờ người dùng nghiệm thu.

---

## I. Cloud Safety Confirmation

Tôi xác nhận danh dự kỹ thuật:
1. **Zero Cloud Mutations**: Không có bất kỳ lệnh deploy, tạo/xóa app, tạo/xóa volume, thay đổi secrets, tạo R2 bucket thật, hay thay đổi DNS nào được thực hiện trong đợt remediation này.
2. **Bảo Tồn Toàn Vẹn Tài Nguyên Đang Chạy**:
   - Ứng dụng: `openwebui-mqtech`
   - Machine: `2871574ae574e8`
   - Volume: `vol_4m3m9jdgen55793v`
   - Region: `sin`
   hoàn toàn không bị truy cập hay can thiệp dưới bất kỳ hình thức nào.
