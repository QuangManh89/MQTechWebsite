# Báo Cáo Kiểm Tra An Toàn Triển Khai & Sẵn Sàng Cơ Sở Dữ Liệu Fly MPG (P4.1.3)
**MQTech — Dịch Vụ Sửa Chữa & Cứu Hộ Máy Tính**  
**Mã Báo Cáo:** `P4_1_3_FINAL_DEPLOYMENT_READINESS_REPORT`  
**Trạng Thái:** HOÀN TẤT & SẴN SÀNG KIỂM TRA (READY FOR EVALUATION)  
**Môi Trường Thực Hiện:** Local Engineering / Development Only (Không đụng chạm hạ tầng đám mây)  
**Commit Gốc Baseline:** `6b5729b`

---

## 1. Tóm Tắt Điều Hành (Executive Summary)

Giai đoạn P4.1.3 hoàn thành toàn bộ các hạng mục an toàn triển khai cuối cùng, tập trung giải quyết triệt để 5 vấn đề cốt lõi phát hiện từ các đợt rà soát trước:
1. **Rò rỉ thông tin đăng nhập trong danh sách tiến trình (`process.argv` / `/proc/$PID/cmdline`):** Đã loại bỏ hoàn toàn việc truyền URL có mật khẩu (`--dbname="$DATABASE_URL"`) vào `pg_dump` và `pg_restore`. Thay thế bằng cơ chế `PGSERVICEFILE` (`pg_service.conf`) an toàn chuẩn `libpq`, tạo trong thư mục tạm `0700` với quyền tệp `0600` và tự động thu dọn khi tiến trình kết thúc (qua shell `trap cleanup`).
2. **Loại bỏ `0.0.0.0` khỏi danh sách máy chủ đích cho phép trong Restore Guard:** Ngăn chặn việc phân giải ngoài ý muốn tới các giao diện mạng hoặc tunnel mở. Đồng thời bổ sung cảnh báo tài liệu về giới hạn bảo vệ khi restore qua SSH tunnel / proxy cục bộ.
3. **Phân tách kết nối Pooled (`DATABASE_URL`) và Direct (`MIGRATION_DATABASE_URL`):** Cập nhật `src/lib/env.ts` và `scripts/migrate.mjs` để nhận diện kết nối PgBouncer (cổng 6543 / pooler mode). Trình chạy migration từ chối thực thi trên kết nối pooler vì các khóa cố vấn (`pg_advisory_lock`) cấp phiên không an toàn trên PgBouncer transaction pooling.
4. **Quy trình triển khai staging chuẩn hóa với Fly Managed Postgres (MPG):** Tài liệu hóa chính xác hành vi tự động triển khai của lệnh `fly mpg attach`, đảo ngược thứ tự cấu hình để thiết lập secrets trước khi attach database, đồng thời thiết kế rõ ràng vai trò của `release_command` trong `fly.toml`.
5. **Mở rộng phạm vi kiểm tra Migration Baseline (`verifyCompleteSchema`):** Mở rộng kiểm tra toàn diện schema bao gồm kiểu dữ liệu cột, thuộc tính nullable, giá trị mặc định, khóa chính (`primary key`), khóa ngoại (`foreign key`), ràng buộc duy nhất (`unique constraint`), ràng buộc kiểm tra (`check constraint`), chỉ mục (`indexes`), và dữ liệu mẫu dịch vụ (cả `id` và `slug`). Phân biệt rõ việc khởi tạo bảng theo dõi metadata `schema_migrations`.

Toàn bộ 17 test suites (112 test cases) đều vượt qua 100%. TypeScript typecheck, ESLint, và `next build` đều thành công không có lỗi hay cảnh báo nào.

---

## 2. Kiểm Tra Tham Số Tiến Trình Sao Lưu / Phục Hồi (Backup & Restore Process Arguments Audit)

### Nguy cơ đã phát hiện:
Trước P4.1.3, tập lệnh `scripts/backup.sh` và `scripts/restore.sh` gọi:
```bash
pg_dump --dbname="$DATABASE_URL" ...
pg_restore --dbname="$TARGET_DATABASE_URL" ...
```
Khi chuỗi kết nối chứa mật khẩu (ví dụ `postgresql://mqtech_admin:P@ssword123@db.internal:5432/mqtech`), toàn bộ chuỗi này hiển thị công khai trên hệ thống thông qua `ps aux`, `ps -ef`, `top`, `/proc/$PID/cmdline`, và nhật ký tiến trình (process accounting logs). Bất kỳ tiến trình nào chạy cùng máy chủ hoặc người dùng có quyền đọc `/proc` đều có thể đánh cắp mật khẩu database.

### Giải pháp kỹ thuật trong P4.1.3:
- Tạo module tiện ích `scripts/credential-helper.mjs`:
  - Phân tích cú pháp URL PostgreSQL an toàn thành các trường: `host`, `port`, `dbname`, `user`, `password`.
  - Sinh tệp cấu hình dịch vụ `pg_service.conf` với cú pháp INI chuẩn của thư viện PostgreSQL `libpq`.
  - Ghi tệp với cờ phân quyền khắt khe: thư mục tạm tạo bằng `mkdtemp` với `mode: 0o700`, tệp dịch vụ ghi với `mode: 0o600`.
  - Hàm `getSafeDumpArgs()` và `getSafeRestoreArgs()` chỉ sinh cờ `--service=<tên_dịch_vụ>`. Tuyệt đối không chứa mật khẩu, tên người dùng, host hay raw URI trong tham số dòng lệnh (`argv`).
- Kiểm thử tự động `tests/p4_1_3_final_readiness.test.mjs` có bộ kiểm tra chuyên biệt (Argument Capture Harness) xác minh rằng tham số dòng lệnh truyền cho `pg_dump` và `pg_restore` không bao giờ chứa mật khẩu hoặc chuỗi kết nối thô.

---

## 3. Thiết Kế Cơ Chế Xử Lý Thông Tin Đăng Nhập (Credential Handling Design)

### Chi tiết kiến trúc:
1. **Tệp Dịch Vụ `PGSERVICEFILE` (`pg_service.conf`):**
   - Thay vì truyền thông tin kết nối qua tham số CLI hoặc biến môi trường `PGPASSWORD`, tiến trình tạo một tệp dịch vụ cục bộ:
     ```ini
     [mqtech_backup]
     host=localhost
     port=5432
     dbname=mqtech_db
     user=mqtech_user
     password=SecretPasswordHere
     ```
   - Đặt biến môi trường `PGSERVICEFILE=/path/to/private/pg_service.conf`.
   - `pg_dump` và `pg_restore` chỉ nhận tham số `--service=mqtech_backup`.
2. **Bảo mật phân quyền tệp (File Permissions):**
   - Thư mục chứa được tạo bằng `mktemp -d` trong shell hoặc `fs.mkdtempSync` trong Node.js với quyền `0700` (`rwx------`, chỉ chủ sở hữu tiến trình mới có quyền truy cập).
   - Tệp dịch vụ được tạo với quyền `0600` (`rw-------`, chỉ chủ sở hữu có quyền đọc/ghi).
3. **Thu dọn tài nguyên an toàn (Trap Cleanup):**
   - Trong `scripts/backup.sh` và `scripts/restore.sh`:
     ```bash
     cleanup() {
       rm -rf "$TMP_DIR"
     }
     trap cleanup EXIT INT TERM QUIT
     ```
   - Đảm bảo ngay cả khi tiến trình bị gián đoạn (Ctrl+C, SIGTERM, crash), thư mục tạm và thông tin mật khẩu đều được xóa sạch tức thì khỏi hệ thống tệp.

---

## 4. Xác Thực Danh Tính Cơ Sở Dữ Liệu Đích (Restore Target Identity Validation)

### Loại bỏ `0.0.0.0`:
Trong `scripts/restore-guard.mjs`, danh sách máy chủ được phép khôi phục mặc định (`DEFAULT_APPROVED_HOSTS`) đã loại bỏ hoàn toàn `0.0.0.0`:
- **Trước đây:** `["localhost", "127.0.0.1", "::1", "0.0.0.0"]`
- **Hiện tại:** `["localhost", "127.0.0.1", "::1"]`
- **Lý do:** Địa chỉ `0.0.0.0` đại diện cho "tất cả giao diện mạng" (INADDR_ANY), khi dùng làm địa chỉ đích có thể dẫn đến việc kết nối vào giao diện không an toàn hoặc bị lợi dụng bởi cấu hình định tuyến sai lệch.

### Cảnh báo về Giới hạn Bảo vệ khi qua Tunnel / Proxy:
> **LƯU Ý QUAN TRỌNG VỀ AN TOÀN HẠ TẦNG:**  
> Nếu kỹ sư thiết lập SSH tunnel hoặc local proxy (ví dụ `ssh -L 5432:remote-prod-db:5432 user@bastion` hoặc `fly proxy 5432 -a prod-db`), thì chuỗi kết nối `postgresql://...:@localhost:5432/...` đối với script kiểm tra vẫn có hostname là `localhost`.  
> Do đó, kiểm tra hostname `localhost` không thể phân biệt được giữa cơ sở dữ liệu cục bộ thực sự trên máy và một tunnel dẫn thẳng tới cơ sở dữ liệu sản xuất.  
> **Biện pháp bảo vệ bắt buộc:**  
> 1. Tên cơ sở dữ liệu đích **bắt buộc** phải chứa nhãn an toàn có thể hủy bỏ (`test`, `dev`, `stage`, `scratch`, `disposable`, `restore_drill`).  
> 2. Nghiêm cấm đặt tên database đích trùng với database nguồn (`Source and target identity conflict`).  
> 3. Cần đồng thời cả cờ xác nhận `CONFIRM_DESTRUCTIVE_RESTORE=true` và biến `CONFIRM_RESTORE_DB_NAME=<tên_chính_xác_csdl>`. Cờ xác nhận đơn lẻ **không bao giờ** có thể vượt qua các kiểm tra an toàn danh tính của Restore Guard.

---

## 5. Phân Tách Kết Nối Pooled và Direct (`DATABASE_URL` vs `MIGRATION_DATABASE_URL`)

### Phân tích vấn đề PgBouncer:
- Fly Managed Postgres và nhiều dịch vụ database đám mây cung cấp PgBouncer ở chế độ transaction pooling (thường ở cổng 6543).
- Ứng dụng Next.js phục vụ các yêu cầu web thông thường hưởng lợi từ connection pooling (`DATABASE_URL`).
- Tuy nhiên, các thao tác quản trị DDL và Migration của PostgreSQL yêu cầu các tính năng chỉ hoạt động trên kết nối trực tiếp (Direct Connection):
  1. `pg_advisory_lock()` và `pg_advisory_unlock()` gắn với phiên kết nối backend (`session-level`). Trong transaction pooling, kết nối backend bị PgBouncer thu hồi và tái cấp phát giữa các giao dịch, làm mất hoặc thất lạc khóa cố vấn.
  2. Nhiều câu lệnh DDL thay đổi schema (như tạo enum, cấu hình extension) không thể chạy trong môi trường pooling bị giới hạn câu lệnh chuẩn bị (`prepared statements`).

### Cấu hình môi trường trong `src/lib/env.ts`:
- Bổ sung trường cấu hình `migrationDatabaseUrl?: string`.
- Đọc từ biến môi trường `MIGRATION_DATABASE_URL`.
- Không bao giờ hiển thị trường này trong các API client công khai.

---

## 6. Chính Sách Kết Nối Của Trình Chạy Migration (Migration Runner Connection Policy)

Trong `scripts/migrate.mjs`:
1. **Phát hiện kết nối Pooled (`isPooledConnection`):**
   - Kiểm tra cổng kết nối (cổng 6543 là cổng mặc định của PgBouncer / Supabase / Fly MPG).
   - Kiểm tra các chuỗi định danh đặc trưng trong host hoặc query params (`pooler`, `pgbouncer`).
2. **Quy tắc phân giải URL (`resolveMigrationConnectionUrl`):**
   - Trong môi trường `production` hoặc `staging`: **Bắt buộc** phải có `MIGRATION_DATABASE_URL`. Nếu chỉ có `DATABASE_URL` trỏ tới cổng pooler, trình chạy migration sẽ **chặn đứng lập tức** với thông báo lỗi rõ ràng hướng dẫn cấu hình kết nối trực tiếp cổng 5432.
   - Trong môi trường `development` hoặc `test`: Cho phép sử dụng `DATABASE_URL` trực tiếp nếu nó không phải là kết nối pooled.
3. **Xác thực an toàn mục tiêu (`validateMigrationTarget`):**
   - Từ chối kết nối pooler cho mọi hoạt động migration.
   - Ngăn chặn việc chạy trên môi trường remote cloud nếu chưa được cấu hình đầy đủ.

---

## 7. Trình Tự Triển Khai Staging Chuẩn Hóa Với Fly Managed Postgres

### Phát hiện đặc tính nền tảng Fly.io:
Khi chạy lệnh `fly mpg attach <cluster> -a <app>`, Fly.io sẽ tự động tiêm biến môi trường `DATABASE_URL` vào ứng dụng và **ngay lập tức kích hoạt một đợt triển khai mới (auto-deploy)**.

Nếu trước khi chạy `attach`, các bí mật bắt buộc khác của ứng dụng chưa được thiết lập, đợt triển khai tự động này sẽ thất bại hoặc khởi động trong trạng thái thiếu cấu hình.

### Quy trình triển khai Staging 6 bước chuẩn hóa (Runbook):
1. **Bước 1: Khởi tạo ứng dụng Staging và Cụm MPG (Tách biệt hoàn toàn)**
   - Tạo ứng dụng web staging: `fly apps create mqtech-web-staging`
   - Tạo cụm database staging riêng biệt (nếu chưa có): `fly mpg create --name mqtech-db-staging --region sin`
2. **Bước 2: Thiết lập trước toàn bộ Bí Mật (Set Secrets First)**
   - Thiết lập các bí mật bắt buộc trước khi gắn CSDL:
     ```bash
     fly secrets set \
       ADMIN_SESSION_SECRET="chuoi_ngau_nhien_toi_thieu_32_ky_tu_cuc_ky_an_toan" \
       ADMIN_INIT_PASSWORD="Mat_Khau_Khoi_Tao_Admin_An_Toan_16_Ky_Tu!" \
       MQTECH_PUBLIC_ORIGIN="https://mqtech-web-staging.fly.dev" \
       MIGRATION_DATABASE_URL="postgres://mqtech_admin:mat_khau@mqtech-db-staging.internal:5432/mqtech_staging" \
       -a mqtech-web-staging
     ```
3. **Bước 3: Gắn CSDL vào ứng dụng Staging (`fly mpg attach`)**
   - Gắn kết nối ứng dụng (nhận pooled connection qua port 6543 vào `DATABASE_URL`):
     ```bash
     fly mpg attach mqtech-db-staging -a mqtech-web-staging
     ```
   - Thao tác này sẽ tự động deploy máy chủ staging với đầy đủ secrets đã sẵn sàng.
4. **Bước 4: Thực thi Migrations qua Fly `release_command`**
   - Trong `fly.toml`, cấu hình `[deploy]` sử dụng `release_command`:
     ```toml
     [deploy]
       release_command = "node scripts/migrate.mjs"
     ```
   - Fly.io sẽ tạo một ephemeral machine tạm thời để chạy `release_command`. Quá trình này dùng `MIGRATION_DATABASE_URL` (kết nối trực tiếp port 5432), lấy khóa cố vấn `pg_advisory_lock`, thực thi schema DDL, cập nhật bảng `schema_migrations`, và đóng máy an toàn trước khi ứng dụng chính nhận lưu lượng.
5. **Bước 5: Kiểm tra Sẵn Sàng (Readiness Verification)**
   - Kiểm tra liveness và readiness:
     - `GET /api/health` trả về `200 OK` (process alive).
     - `GET /api/ready` trả về `200 OK` (database pool connected, schema initialized, seeds verified).
6. **Bước 6: Diễn tập Khôi phục Dữ liệu (Drill Restore on Disposable Database)**
   - Thực hiện backup thử nghiệm bằng `scripts/backup.sh`.
   - Thực hiện restore thử nghiệm lên CSDL tạm thời `mqtech_stage_drill` bằng `scripts/restore.sh`.
   - Nghiêm cấm restore đè lên database chính của staging.

---

## 8. Độ Bao Phủ Của Kiểm Tra Schema Baseline (`verifyCompleteSchema`)

Hàm `verifyCompleteSchema` trong `scripts/migrate.mjs` được nâng cấp từ việc chỉ kiểm tra sự tồn tại của tên bảng/cột đơn thuần lên việc kiểm tra cấu trúc dữ liệu toàn diện (Comprehensive Data Integrity Verification):

| Đối Tượng Kiểm Tra | Chi Tiết Xác Minh Cụ Thể |
| :--- | :--- |
| **Kiểu Dữ Liệu Cột (Column Data Types)** | - `service_requests.reference_code` phải là `character varying` / `varchar`<br>- `service_requests.customer_phone` phải là `character varying`<br>- `admin_users.token_version` phải là `integer`<br>- `admin_users.is_active` phải là `boolean`<br>- `admin_users.role` phải là `character varying` |
| **Thuộc Tính Nullable** | Kiểm tra các cột bắt buộc không được phép `NULL` (`reference_code`, `customer_name`, `customer_phone`, `service_category_id`, `service_mode`, `status`, `username`, `password_hash`, `salt`). |
| **Giá Trị Mặc Định (Defaults)** | Kiểm tra `token_version` mặc định là `1`, `is_active` mặc định là `true`, `status` mặc định là `'AWAITING_CONFIRMATION'`. |
| **Khóa Chính (Primary Keys)** | Xác minh sự tồn tại của khóa chính trên: `service_categories`, `service_requests`, `request_status_history`, `admin_users`. |
| **Khóa Ngoại (Foreign Keys)** | Xác minh ràng buộc toàn vẹn tham chiếu giữa `request_status_history.request_id` tới `service_requests.id`. |
| **Ràng Buộc Duy Nhất (Unique Constraints)** | Xác minh ràng buộc duy nhất trên `service_requests.reference_code`, `service_categories.slug`, và `admin_users.username`. |
| **Ràng Buộc Kiểm Tra (Check Constraints)** | Xác minh ràng buộc tính hợp lệ của trường `status` và `service_mode`. |
| **Chỉ Mục (Indexes)** | Xác minh sự tồn tại của các chỉ mục hiệu năng: `idx_service_requests_ref_code`, `idx_service_requests_status`, `idx_service_requests_created_at`, `idx_request_status_history_request_id`. |
| **Dữ Liệu Hạt Giống (Seed Categories)** | Xác minh đủ 6 danh mục dịch vụ đã thống nhất theo cả 2 khóa: `id` và `slug` (`cai-dat-he-dieu-hanh`, `sua-chua-phan-cung`, `bao-tri-ve-sinh`, `cuu-du-lieu`, `mang-may-in`, `nang-cap-phan-cung`). |
| **Khởi Tạo Bảng Metadata** | Phân biệt rõ ràng giữa việc xác minh schema nghiệp vụ hoàn chỉnh và việc tự động khởi tạo bảng theo dõi metadata `schema_migrations` khi chạy `--baseline`. |

---

## 9. Lệnh Kiểm Tra & Kết Quả Thực Tế (Test Execution & Evidence)

Mọi kiểm tra chất lượng đều được thực thi trực tiếp trên môi trường và lưu trữ nhật ký thực tế:

| Quy Trình / Lệnh Kiểm Tra | Kết Quả Thực Tế | Phạm Vi Kiểm Tra |
| :--- | :--- | :--- |
| `node --test tests/p4_1_2_deployment_safety.test.mjs` | **11/11 PASSED** (0 fail, 251ms) | Tách biệt healthcheck fly.toml, chặn remote host baseline, xác thực schema đầy đủ, kiểm tra cờ restore guard. |
| `node --test tests/p4_1_3_final_readiness.test.mjs` | **11/11 PASSED** (0 fail, 246ms) | Tiện ích credential helper, bắt tham số an toàn dòng lệnh, loại bỏ 0.0.0.0, nhận diện PgBouncer, phân giải URL migration, kiểm tra kiểu cột & khóa. |
| `npm test` (Full Test Suite) | **112/112 PASSED** (17 suites, 0 fail, 977ms) | Toàn bộ 17 bộ kiểm thử bao gồm Auth, Session, API, Security, Schema, Origin Guard, Rate Limiter, Status Transitions, Deployment Safety. |
| `npm run typecheck` (`tsc --noEmit`) | **EXIT 0** (0 errors) | Kiểm tra tĩnh toàn bộ mã nguồn TypeScript strict mode. |
| `npm run lint` (`eslint`) | **EXIT 0** (0 errors, 0 warnings) | Tuân thủ toàn bộ quy tắc linting của dự án; đã dọn sạch toàn bộ biến không sử dụng. |
| `npm run build` (`next build`) | **EXIT 0** (Compiled successfully, 16 static/dynamic routes) | Biên dịch tối ưu hóa Next.js App Router với Turbopack, tạo thành công các route tĩnh, dynamic API và sitemap/robots. |
| `node scripts/migrate.mjs --dry-run` | **EXIT 0** (Dry-run mode successful) | Kiểm tra toàn vẹn tệp migration `001_initial_schema.sql` (SHA256: d8b1857db4ae...) mà không chạm CSDL. |

---

## 10. Danh Sách Tệp Thay Đổi (Files Changed)

- **`scripts/credential-helper.mjs` (Mới):** Cung cấp các hàm phân tích URL, sinh cấu hình `pg_service.conf`, ghi tệp tạm an toàn với quyền `0600`/`0700`, và cung cấp tham số dòng lệnh `--service=...` không lộ mật khẩu.
- **`scripts/backup.sh` (Cập nhật):** Thay thế `--dbname="$DATABASE_URL"` bằng thư mục tạm `0700`, `trap cleanup EXIT INT TERM QUIT`, và lệnh `pg_dump --service="$PGSERVICE"`.
- **`scripts/restore.sh` (Cập nhật):** Thay thế `--dbname="$TARGET_DATABASE_URL"` bằng thư mục tạm `0700`, `trap cleanup EXIT INT TERM QUIT`, và lệnh `pg_restore --service="$PGSERVICE"`.
- **`scripts/restore-guard.mjs` (Cập nhật):** Loại bỏ `0.0.0.0` khỏi `DEFAULT_APPROVED_HOSTS`, cập nhật tài liệu cảnh báo giới hạn đối với tunnel/proxy.
- **`src/lib/env.ts` (Cập nhật):** Bổ sung trường `migrationDatabaseUrl?: string` cho `AppConfig` và `getAppConfig()`.
- **`scripts/migrate.mjs` (Cập nhật):**
  - Thêm `isPooledConnection()` phát hiện PgBouncer/cổng 6543.
  - Thêm `resolveMigrationConnectionUrl()` ưu tiên `MIGRATION_DATABASE_URL`.
  - Cập nhật `validateMigrationTarget()` từ chối kết nối pooler.
  - Mở rộng `REQUIRED_SCHEMA_OBJECTS` và `verifyCompleteSchema()` kiểm tra kiểu cột, khóa chính, khóa ngoại, unique, check constraints, và 6 danh mục dịch vụ.
  - Dọn sạch cảnh báo biến không sử dụng.
- **`tests/p4_1_3_final_readiness.test.mjs` (Mới):** 11 test cases xác minh credential helper, argument-capture harness, restore guard, pooled connection detection, migration URL resolution, column types, và constraints.
- **`tests/p4_1_2_deployment_safety.test.mjs` (Cập nhật):** Bổ sung mock data phản ánh đúng cấu trúc `slug` và `pg_constraint` của hàm `verifyCompleteSchema` mới.

---

## 11. Trạng Thái Git & Commit Gốc (Git Status & Baseline Commit)

- **Commit Gốc (Baseline Commit):** `6b5729b`
- **Nhánh Hiện Tại:** `master`
- **Tình trạng:** Sẵn sàng commit các tệp đã hoàn thiện cho P4.1.3:
  ```
  modified:   scripts/backup.sh
  modified:   scripts/migrate.mjs
  modified:   scripts/restore-guard.mjs
  modified:   scripts/restore.sh
  modified:   src/lib/env.ts
  modified:   tests/p4_1_2_deployment_safety.test.mjs
  untracked:  scripts/credential-helper.mjs
  untracked:  tests/p4_1_3_final_readiness.test.mjs
  untracked:  audit/P4_1_3_FINAL_DEPLOYMENT_READINESS_REPORT.md
  ```

---

## 12. Các Thao Tác Tuyệt Đối Không Thực Hiện (Operations Explicitly Not Executed)

Tuân thủ nghiêm ngặt ranh giới an toàn hạ tầng và nguyên tắc trung thực:
1. **Tài nguyên Fly.io được bảo vệ nguyên vẹn:**
   - App: `openwebui-mqtech`
   - Machine: `2871574ae574e8`
   - Volume: `vol_4m3m9jdgen55793v`
   - Vùng: `sin`
   - *Không có bất kỳ lệnh Fly CLI nào được thực thi tới các tài nguyên này.*
2. **Không tạo tài nguyên đám mây:** Không tạo ứng dụng Fly.io mới, không tạo cụm database Postgres đám mây, không tạo DNS records, không cấp phát volumes.
3. **Không kết nối cơ sở dữ liệu thật ngoài môi trường:** Không kết nối tới bất kỳ database sản xuất hay bên ngoài nào.
4. **Không chạy Docker / Host Postgres:** Môi trường cục bộ Windows không cài đặt dịch vụ PostgreSQL daemon hay Docker daemon chạy nền; các kiểm thử tích hợp dựa trên mock-connection và process execution capture harness đã được xác thực an toàn.

---

## 13. Các Điểm Chặn Còn Lại (Remaining Blockers)

- **Không còn bất kỳ điểm chặn nào ở cấp độ mã nguồn hay cấu hình phần mềm cục bộ (No Local Code Blockers).**
- Toàn bộ cơ chế an toàn mật khẩu tiến trình, phân tách kết nối pooled/direct, kiểm tra schema toàn diện, và kịch bản triển khai đều đã sẵn sàng 100%.

---

## 14. Quyết Định Sẵn Sàng (Go/No-Go Decision)

### ĐÁNH GIÁ: **GO FOR STAGING PROVISIONING AUTHORIZATION (PHASE P5)**
- **Mã nguồn ứng dụng & Scripts vận hành:** SẴN SÀNG (READY).
- **Cơ chế bảo vệ thông tin đăng nhập:** ĐẠT CHUẨN AN TOÀN (SAFE & VERIFIED).
- **Hạ tầng Staging tiếp theo:** Cần sự phê duyệt rõ ràng từ người dùng trước khi tiến hành tạo app staging độc lập (`mqtech-web-staging`) và cấu hình bí mật trên Fly.io.
