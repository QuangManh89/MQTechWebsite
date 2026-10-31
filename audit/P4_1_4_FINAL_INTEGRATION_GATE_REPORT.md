# Báo Cáo Kiểm Tra Cổng Tích Hợp Cuối Cùng (P4.1.4)
**MQTech — Dịch Vụ Sửa Chữa & Cứu Hộ Máy Tính**  
**Mã Báo Cáo:** `P4_1_4_FINAL_INTEGRATION_GATE_REPORT`  
**Trạng Thái:** HOÀN THÀNH & SẴN SÀNG ĐÁNH GIÁ (GATE COMPLETED — AWAITING USER REVIEW)  
**Môi Trường Thực Hiện:** Local Engineering / Development Only (Không tương tác hạ tầng đám mây)  
**Commit Gốc Baseline:** `a8e2e5c` (Baseline sau P4.1.3)

---

## 1. Tóm Tắt Điều Hành (Executive Summary)

Giai đoạn P4.1.4 đã giải quyết triệt để toàn bộ 5 phát hiện từ đợt đánh giá P4.1.3, đưa hệ thống vào trạng thái hoàn toàn chuẩn mực về cú pháp CLI PostgreSQL, tính toàn vẹn nghiệp vụ, an toàn thông tin đăng nhập và kiểm soát mục tiêu khôi phục:
1. **Sửa đổi cú pháp CLI gọi dịch vụ PostgreSQL:** Loại bỏ hoàn toàn giả định không có thật về cờ dòng lệnh `--service` của `pg_dump` và `pg_restore`. Chuyển sang cú pháp chính thức được tài liệu PostgreSQL hỗ trợ: `--dbname="service=${PGSERVICE}"` kết hợp cờ `--no-password` (`-w`) và biến môi trường `PGSERVICEFILE`. Tuyệt đối không để mật khẩu hoặc raw URI xuất hiện trong `process.argv`.
2. **Xử lý an toàn tệp thông tin đăng nhập & Giới hạn của Shell Trap:** Hỗ trợ giải mã URI chuẩn RFC 3986 với các ký tự đặc biệt (`#`, `;`, `=`, `\`, dấu cách, unicode tiếng Việt, chuỗi percent-encoded). Ngăn chặn triệt để tấn công INI Injection bằng cách cấm ký tự xuống dòng (`\r`, `\n`) và kiểm soát tên `serviceName`. Ghi nhận trung thực rằng shell trap chỉ dọn dẹp theo cơ chế *best-effort*, không thể bắt được `SIGKILL` hoặc sự cố sập nguồn phần cứng, và ưu tiên sử dụng bộ nhớ tạm `tmpfs` (`/dev/shm` hoặc `XDG_RUNTIME_DIR`) để thông tin đăng nhập nằm hoàn toàn trong RAM và tự biến mất khi tắt máy.
3. **Thắt chặt an toàn danh tính mục tiêu khôi phục (Restore Target Identity):** Xác định rõ ràng các nhãn CSDL như `_test` hay `_disposable` không phải là bằng chứng duy nhất đảm bảo an toàn. Bổ sung cơ chế đối chiếu danh tính máy chủ kỳ vọng (`EXPECTED_RESTORE_HOST`), tên CSDL kỳ vọng (`EXPECTED_RESTORE_DB_NAME`), cơ chế xác minh định danh hệ thống máy chủ (`serverIdentifier`), kiểm tra xung đột nguồn/đích, và cảnh báo về giới hạn bảo vệ khi thao tác qua SSH tunnel/proxy trên `localhost`. Cờ xác nhận không bao giờ có thể ghi đè khi xác thực danh tính thất bại.
4. **Đối chiếu & Khôi phục 6 nhóm dịch vụ kinh doanh kinh điển của MQTech:** Đã rà soát và xác định nguyên nhân: Codebase (`src/lib/constants/services.ts`, `migrations/001_initial_schema.sql`, `src/lib/db/schema.sql`, UI, API validation) luôn lưu giữ và thực thi đúng 6 nhóm dịch vụ đã phê duyệt từ P0/P1. Sự sai lệch xuất phát từ bảng tóm tắt bằng chữ trong báo cáo P4.1.3 cũ. Bổ sung bộ kiểm thử tự động độc lập `tests/services.test.mjs` kiểm tra khớp 100% từng ID, slug, tiêu đề hiển thị và phương thức phục vụ theo `docs/BUSINESS_REQUIREMENTS.md`.
5. **Xác minh kết nối Pooled vs Direct:** Nâng cấp hàm nhận diện kết nối `isPooledConnection` phát hiện chính xác các mô hình Fly Managed Postgres (PgBouncer cổng 6543, host `*.flycast`, tên host chứa `pgbouncer`/`pooler`/`supavisor`, tham số `pgbouncer=true`). Loại bỏ `0.0.0.0` khỏi danh sách máy chủ migration nội bộ. Trình chạy migration từ chối kết nối pooled trên mọi môi trường và bắt buộc kết nối direct trong staging/production.

Toàn bộ 18 test suites (124 test cases) đều vượt qua 100%. TypeScript typecheck, ESLint và Next.js production build đều thành công không có lỗi hay cảnh báo nào.

---

## 2. Sửa Đổi Cú Pháp CLI Gọi Tệp Dịch Vụ PostgreSQL (PostgreSQL CLI Invocation Correction)

### Rà soát tài liệu chính thức PostgreSQL:
Theo tài liệu chính thức của PostgreSQL:
- [pg_dump documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [pg_restore documentation](https://www.postgresql.org/docs/current/app-pgrestore.html)
- [libpq connection service files](https://www.postgresql.org/docs/current/libpq-pgservice.html)

Cả `pg_dump` và `pg_restore` **không hề có** tham số dòng lệnh `--service`. Việc sử dụng `--service=...` trong các phiên bản trước là giả định sai lệch và sẽ bị binary PostgreSQL từ chối với lỗi: `unrecognized option '--service'`.

### Giải pháp kỹ thuật được triển khai:
Trong PostgreSQL `libpq`, một dịch vụ kết nối được lựa chọn thông qua:
1. Đặt biến môi trường `PGSERVICEFILE` trỏ tới tệp cấu hình dịch vụ an toàn (phân quyền `0600`).
2. Đặt biến môi trường `PGSERVICE` trỏ tới tên section dịch vụ.
3. Chỉ định chuỗi kết nối qua tham số `--dbname` hoặc `-d`:
   ```bash
   --dbname="service=mqtech_backup"
   ```
4. Bổ sung cờ `--no-password` (`-w`) để đảm bảo trong các kịch bản chạy tự động, tiến trình sẽ báo lỗi và dừng ngay lập tức thay vì treo đợi nhập mật khẩu trên terminal nếu cấu hình xác thực gặp sự cố.

### Cập nhật mã nguồn:
- **`scripts/credential-helper.mjs`:**
  - `getSafeDumpArgs({ serviceName, filePath })`: Trả về `["--dbname=service=" + serviceName, "--no-password", "--format=c", "--no-owner", "--no-privileges", "--file=" + filePath]`.
  - `getSafeRestoreArgs({ serviceName, backupFilePath })`: Trả về `["--dbname=service=" + serviceName, "--no-password", "--clean", "--if-exists", "--no-owner", "--no-privileges", backupFilePath]`.
  - Tuyệt đối không chứa `--service`.
- **`scripts/backup.sh`:**
  ```bash
  export PGSERVICEFILE="${SECURE_TMP_DIR}/pg_service.conf"
  export PGSERVICE="mqtech_backup"
  node scripts/credential-helper.mjs write-service "${PGSERVICE}" "${PGSERVICEFILE}"

  pg_dump \
    --dbname="service=${PGSERVICE}" \
    --no-password \
    --format=c \
    --no-owner \
    --no-privileges \
    --file="${BACKUP_FILEPATH}"
  ```
- **`scripts/restore.sh`:**
  ```bash
  export PGSERVICEFILE="${SECURE_TMP_DIR}/pg_service.conf"
  export PGSERVICE="mqtech_restore"
  node scripts/credential-helper.mjs write-service "${PGSERVICE}" "${PGSERVICEFILE}"

  pg_restore \
    --dbname="service=${PGSERVICE}" \
    --no-password \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    "${BACKUP_FILE}"
  ```
- **Kiểm thử tự động:** `tests/p4_1_4_final_gate.test.mjs` kiểm tra xác nhận rằng các tham số sinh ra không chứa `--service`, sử dụng `--dbname=service=...`, có `--no-password`, và không để lộ mật khẩu hay URI trong `process.argv`.

---

## 3. Xử Lý An Toàn Tệp Thông Tin Đăng Nhập & Giới Hạn Của Shell Trap (Credential Serializer & Cleanup Review)

### Phân tích cú pháp URI & Trích xuất an toàn:
Trong `scripts/credential-helper.mjs`:
- Hàm `parseDatabaseUrl` sử dụng API chuẩn `URL` của Node.js kết hợp `decodeURIComponent` có bọc khối `try/catch` để xử lý an toàn các ký tự mã hóa percent-encoding theo chuẩn RFC 3986:
  - `%23` (`#`), `%3B` (`;`), `%3D` (`=`), `%20` (dấu cách), `%5C` (`\`), `%40` (`@`).
  - Ký tự unicode tiếng Việt (ví dụ `%E1%BA%BF` cho `ế`, `%E1%BA%AD` cho `ậ`).
  - Xử lý an toàn mật khẩu trống hoặc không có mật khẩu.
  - Báo lỗi rõ ràng `Malformed percent-encoded credentials` nếu chuỗi mã hóa bị cắt cụt.

### Phòng chống tấn công INI Injection:
Trong định dạng INI của `pg_service.conf`, việc chèn ký tự xuống dòng (`\r` hoặc `\n`) có thể phá vỡ cấu trúc section, chèn thêm các tham số nguy hiểm như `sslmode=disable` hoặc tạo thêm section độc hại.
- **Hàm `validateServiceName(serviceName)`:** Chỉ cho phép ký tự `^[a-zA-Z0-9_-]+$`. Mọi tên dịch vụ chứa ký tự xuống dòng, dấu ngoặc vuông `[]`, dấu cách, chấm phẩy `;`, dấu thăng `#` đều bị ném lỗi chặn đứng.
- **Hàm `escapeIniValue(val)`:**
  - Nếu phát hiện ký tự `\r` hoặc `\n`, ném lỗi chặn đứng `Phát hiện ký tự xuống dòng (newline) trong thông tin kết nối CSDL`.
  - Các giá trị chứa dấu cách, `#`, `;`, `=`, hoặc dấu ngoặc kép được bọc an toàn trong cặp dấu ngoặc kép hoặc đơn theo đúng đặc tả của PostgreSQL libpq.

### Đánh giá trung thực về giới hạn dọn dẹp của Shell Trap:
- **Tuyên bố kỹ thuật chính xác:** Lệnh `trap cleanup EXIT INT TERM QUIT HUP` trong Bash cung cấp cơ chế thu dọn tệp tạm trên tinh thần **nỗ lực tối đa (best-effort)**. Shell trap chỉ có thể hoạt động khi tiến trình thoát bình thường hoặc nhận các tín hiệu có thể chặn được (catchable signals).
- **Các trường hợp Trap không thể dọn dẹp:**
  1. Tín hiệu `SIGKILL` (`kill -9`) do hệ điều hành hoặc OOM Killer gửi tới.
  2. Sự cố Kernel panic của hệ điều hành máy chủ.
  3. Mất điện đột ngột hoặc tắt máy cưỡng bức của node phần cứng.
  4. Docker container bị terminate đột ngột bằng lệnh `docker kill` mà không qua giai đoạn shutdown.
- **Biện pháp giảm thiểu rủi ro tồn dư (Mitigation):**
  - **Ưu tiên bộ nhớ tạm tmpfs trong RAM:** `scripts/backup.sh` và `scripts/restore.sh` ưu tiên tạo thư mục tạm tại `/dev/shm` hoặc `XDG_RUNTIME_DIR`. Tệp thông tin đăng nhập nằm hoàn toàn trong bộ nhớ RAM, không ghi xuống đĩa từ/SSD, và sẽ tự động biến mất khi hệ thống khởi động lại.
  - **Phân quyền tối thiểu:** Thư mục tạm luôn tạo với quyền `0700`, tệp dịch vụ luôn phân quyền `0600`.
  - **Cách ly tuyệt đối:** Không bao giờ ghi tệp dịch vụ hoặc tệp chứa mật khẩu vào bên trong thư mục chứa bản sao lưu (`./backups`).

---

## 4. Thắt Chặt An Toàn Danh Tính Mục Tiêu Khôi Phục (Restore Identity Validation)

### Nguyên tắc cốt lõi:
Ký hiệu tên CSDL như `_dev`, `_test` hay `_disposable` là điều kiện cần nhưng **không phải là bằng chứng đầy đủ** để chứng minh mục tiêu là an toàn.

### Nguy cơ qua Tunnel / Proxy:
Khi quản trị viên mở một SSH tunnel (`ssh -L 5432:remote-production:5432 user@server`) hoặc chạy local proxy trung gian, kết nối tới `localhost:5432` thực chất đang trỏ tới cơ sở dữ liệu thật từ xa. Do đó, kiểm tra `targetHost === "localhost"` không thể ngăn chặn được rủi ro này nếu thiếu các lớp bảo vệ danh tính khác.

### Cơ chế bảo vệ đa tầng trong `scripts/restore-guard.mjs`:
1. **Kiểm tra danh tính máy chủ kỳ vọng (`expectedHost`):** Nếu có khai báo `EXPECTED_RESTORE_HOST`, máy chủ đích phải khớp chính xác tuyệt đối.
2. **Kiểm tra danh tính CSDL kỳ vọng (`expectedDbName`):** Nếu có khai báo `EXPECTED_RESTORE_DB_NAME`, tên CSDL đích phải khớp chính xác tuyệt đối.
3. **Danh sách máy chủ được duyệt khắt khe:** Chỉ chấp nhận giao diện loopback cục bộ (`localhost`, `127.0.0.1`, `::1`). Loại bỏ hoàn toàn `0.0.0.0`.
4. **Loại trừ từ khóa sản xuất:** Cấm hoàn toàn các từ khóa `prod`, `production`, `live`, `openwebui`, `fly.dev` trong host và dbName.
5. **Ký hiệu CSDL dùng một lần:** Bắt buộc phải có một trong các nhãn `_dev`, `_test`, `_disposable`, `_restore_test`, `mqtech_test`.
6. **Xác định danh tính nguồn & Chống tự ghi đè hủy diệt:** Tự động lấy nguồn từ `SOURCE_DATABASE_URL` hoặc `DATABASE_URL`. Nếu máy chủ nguồn và đích trùng nhau VÀ tên CSDL nguồn và đích trùng nhau, từ chối thực thi ngay lập tức.
7. **Xác minh định danh máy chủ CSDL (`serverIdentifier`):** Hỗ trợ đối chiếu định danh hệ thống máy chủ CSDL (`system_identifier`) với giá trị kỳ vọng khi kết nối được thiết lập.
8. **Xác nhận kép từ người vận hành:** Bắt buộc đồng thời:
   - `CONFIRM_DESTRUCTIVE_RESTORE=true`
   - `CONFIRM_RESTORE_DB_NAME="<tên_chính_xác_csdl>"`
9. **Nguyên tắc Fail-closed:** Nếu bất kỳ bước xác thực nào ở trên không đạt, tiến trình **lập tức từ chối**. Cờ xác nhận của người vận hành **không bao giờ có thể ghi đè (override)** khi xác thực danh tính thất bại.

---

## 5. Đối Chiếu Danh Mục Dịch Vụ Cốt Lõi Của MQTech (Canonical Services Reconciliation)

### Kết quả điều tra thực tế trong mã nguồn:
Rà soát toàn bộ kho mã nguồn cho thấy:
- **`src/lib/constants/services.ts`:** Khai báo chính xác 6 nhóm dịch vụ kinh điển của MQTech từ ngày đầu dự án.
- **`migrations/001_initial_schema.sql`:** Lệnh `INSERT INTO service_categories` khởi tạo đúng 6 nhóm dịch vụ kinh điển với các ID và slug chuẩn.
- **`src/lib/db/schema.sql`:** Tệp schema định nghĩa chuẩn xác 6 dịch vụ.
- **`src/lib/validations/service-request.ts`:** Sử dụng `MQTECH_SERVICES` để tạo tập whitelist hợp lệ cho form tiếp nhận yêu cầu.
- **`src/components/home/ServicesSection.tsx`:** Giao diện người dùng render trực tiếp từ `MQTECH_SERVICES`.
- **`scripts/migrate.mjs`:** Mảng `REQUIRED_SCHEMA_OBJECTS.serviceCategories` xác minh đúng 6 ID và slug kinh điển.

### Nguồn gốc sự sai lệch:
Sự sai lệch được phát hiện trong phần văn bản diễn giải tại Mục 8 của báo cáo `audit/P4_1_3_FINAL_DEPLOYMENT_READINESS_REPORT.md`, nơi người soạn thảo đã ghi nhầm danh sách slug mang tính mô tả chung chung (`cai-dat-he-dieu-hanh`, `sua-chua-phan-cung`, `bao-tri-ve-sinh`, `cuu-du-lieu`, `mang-may-in`, `nang-cap-phan-cung`) thay vì danh sách thực tế của dự án. Không có bất kỳ thay đổi phá vỡ nào trong mã nguồn hay cơ sở dữ liệu.

### Bảng đối chiếu 6 nhóm dịch vụ kinh điển MQTech:

| STT | Mã Dịch Vụ (`id`) | Đường Dẫn Tĩnh (`slug`) | Tên Hiển Thị Phê Duyệt (`title`) | Kênh Phục Vụ (`deliveryModes`) |
| :-: | :--- | :--- | :--- | :--- |
| **1** | `svc_desktop_laptop` | `sua-chua-laptop-pc` | Sửa Chữa Laptop & PC | Tại tiệm (`IN_STORE`) & Tận nơi (`ON_SITE`) |
| **2** | `svc_windows_software` | `cai-dat-windows-phan-mem` | Cài Đặt Windows & Phần Mềm | Tại tiệm (`IN_STORE`) & Tận nơi (`ON_SITE`) |
| **3** | `svc_hardware_upgrade` | `chan-doan-nang-cap-phan-cung` | Chẩn Đoán & Nâng Cấp Phần Cứng | Tại tiệm (`IN_STORE`) & Tận nơi (`ON_SITE`) |
| **4** | `svc_printer_service` | `dich-vu-may-in` | Dịch Vụ Máy In Văn Phòng | Tại tiệm (`IN_STORE`) & Tận nơi (`ON_SITE`) |
| **5** | `svc_network_wifi` | `thi-cong-xu-ly-mang-lan-wifi` | Mạng LAN & Wi-Fi Nội Bộ | Tận nơi (`ON_SITE`) |
| **6** | `svc_business_it` | `ho-tro-it-doanh-nghiep` | Hỗ Trợ IT Doanh Nghiệp | Tận nơi (`ON_SITE`) |

Bộ kiểm thử `tests/services.test.mjs` đã được cập nhật để kiểm tra nghiêm ngặt từng trường thông tin của 6 dịch vụ này trên cả tệp hằng số và tệp migration SQL.

---

## 6. Xác Minh Kết Nối Direct vs Pooled (Fly MPG Connection Verification)

### Nguyên tắc phân tách:
1. `DATABASE_URL`: Kết nối ứng dụng web (ưu tiên kết nối pooled qua PgBouncer cổng 6543 để tái sử dụng connection pool, tiết kiệm RAM trên Fly.io).
2. `MIGRATION_DATABASE_URL`: Kết nối trực tiếp dành riêng cho tác vụ Migration (cổng 5432, kết nối trực tiếp tới Postgres daemon). Bắt buộc để thực thi DDL và duy trì phiên khóa cố vấn `pg_advisory_lock()`.

### Nâng cấp nhận diện kết nối Pooled trong `scripts/migrate.mjs`:
Hàm `isPooledConnection(databaseUrl)` nhận diện kết nối pooler thông qua đa dấu hiệu:
- Cổng kết nối: Cổng `6543`.
- Tên host chứa các chuỗi: `pooler`, `pgbouncer`, `supavisor`.
- Tên host Fly MPG Flycast: Kết thúc bằng `.flycast` (ví dụ `app-db.flycast:5432` của Fly PgBouncer).
- Tham số truy vấn: Chứa `pgbouncer=true` hoặc `pool_mode=`.

### Chính sách cưỡng chế an toàn:
- Trình chạy migration từ chối kết nối pooled trên bất kỳ môi trường nào (kể cả khi người dùng cố tình truyền qua `MIGRATION_DATABASE_URL`).
- Trong môi trường `production` hoặc `staging`, `MIGRATION_DATABASE_URL` là **bắt buộc**.
- Trong môi trường `development` hoặc `test`, chỉ cho phép kết nối direct trên các host loopback được duyệt (`localhost`, `127.0.0.1`, `::1`). `0.0.0.0` đã bị loại bỏ hoàn toàn.
- Thông tin mật khẩu luôn được che giấu (`***`) trong toàn bộ log thông báo và lỗi.

---

## 7. Lệnh Kiểm Tra & Kết Quả Thực Tế (Test Execution & Evidence)

Mọi kiểm tra chất lượng đều được thực thi trực tiếp trên hệ thống cục bộ:

| Quy Trình / Lệnh Kiểm Tra | Kết Quả Thực Tế | Phạm Vi Kiểm Tra |
| :--- | :--- | :--- |
| `node --test tests/p4_1_4_final_gate.test.mjs` | **10/10 PASSED** (13ms) | Cú pháp CLI `--dbname=service=...`, `--no-password`, không chứa `--service`, giải mã percent-encoding (`#`, `;`, `=`, `\`, unicode), chặn INI injection (newlines), quyền tệp `0600`/`0700`, Restore Guard `expectedHost`/`expectedDbName`/`serverIdentifier`, nhận diện Fly MPG pooler. |
| `node --test tests/services.test.mjs` | **6/6 PASSED** (12ms) | Đối chiếu chính xác 100% 6 nhóm dịch vụ kinh điển (ID, slug, title, deliveryModes), kiểm tra tính duy nhất, kiểm tra tệp migration seed, cấm từ khóa cấu hình thương mại. |
| `node --test tests/p4_1_3_final_readiness.test.mjs` | **11/11 PASSED** (17ms) | Credential Helper, argv capture harness không lộ mật khẩu, Restore Guard host allowlist, PgBouncer detection, schema constraint verification. |
| `npm test` (Full Test Suite) | **124/124 PASSED** (18 suites, 0 fail, 994ms) | Toàn bộ 18 bộ kiểm thử: Authentication, Session, Cookie, API Routes, Schema, Rate Limiting, Status Lifecycle, Origin Guard, Deployment Safety, Canonical Services. |
| `npm run typecheck` (`tsc --noEmit`) | **EXIT 0** (0 errors) | Kiểm tra tĩnh toàn bộ mã nguồn TypeScript strict mode. |
| `npm run lint` (`eslint`) | **EXIT 0** (0 errors, 0 warnings) | Kiểm tra toàn bộ mã nguồn theo chuẩn ESLint; không còn bất kỳ biến thừa hay cảnh báo nào. |
| `npm run build` (`next build`) | **EXIT 0** (Compiled successfully, 16 static/dynamic routes) | Biên dịch tối ưu hóa Next.js App Router với Turbopack; các trang công khai, admin, dynamic API routes đều tạo thành công. |
| `node scripts/migrate.mjs --dry-run` | **EXIT 0** (Dry-run mode successful) | Kiểm tra toàn vẹn cú pháp và mã băm SHA-256 tệp migration `001_initial_schema.sql` (d8b1857db4ae...) mà không chạm cơ sở dữ liệu thật. |

---

## 8. Danh Sách Tệp Thay Đổi (Files Changed)

- **`scripts/credential-helper.mjs` (Cập nhật):**
  - Chuyển `getSafeDumpArgs` và `getSafeRestoreArgs` sang cú pháp chuẩn: `--dbname=service=<name>` và `--no-password`.
  - Thêm `validateServiceName` ngăn chặn section injection trong INI.
  - Thêm `escapeIniValue` cấm tuyệt đối ký tự xuống dòng (`\r`, `\n`) và bọc dấu ngoặc kép an toàn cho các ký tự `#`, `;`, `=`, khoảng trắng.
  - Hoàn thiện `parseDatabaseUrl` giải mã percent-encoding RFC 3986 và kiểm tra giao thức `postgres:` / `postgresql:`.
- **`scripts/backup.sh` (Cập nhật):**
  - Chuyển lệnh gọi sang `pg_dump --dbname="service=${PGSERVICE}" --no-password`.
  - Bổ sung tìm kiếm thư mục tmpfs (`/dev/shm`, `XDG_RUNTIME_DIR`) cho tệp cấu hình tạm.
  - Ghi rõ tài liệu về giới hạn dọn dẹp của shell trap đối với `SIGKILL` và sự cố phần cứng.
- **`scripts/restore.sh` (Cập nhật):**
  - Chuyển lệnh gọi sang `pg_restore --dbname="service=${PGSERVICE}" --no-password`.
  - Bổ sung tìm kiếm thư mục tmpfs cho tệp cấu hình tạm và cập nhật tài liệu dọn dẹp.
- **`scripts/restore-guard.mjs` (Cập nhật):**
  - Bổ sung kiểm tra `expectedHost` và `expectedDbName`.
  - Bổ sung hook xác minh định danh hệ thống CSDL `serverIdentifier` / `expectedSystemIdentifier`.
  - Tự động lấy nguồn từ `SOURCE_DATABASE_URL` hoặc `DATABASE_URL` để chống tự ghi đè hủy diệt.
  - Ghi nhận chi tiết nguy cơ của SSH tunnel/proxy trên `localhost`.
- **`scripts/migrate.mjs` (Cập nhật):**
  - Loại bỏ `0.0.0.0` khỏi `ALLOWED_LOCAL_HOSTS`.
  - Mở rộng `isPooledConnection` phát hiện host `*.flycast`, `supavisor`, và tham số `pool_mode=`.
- **`tests/services.test.mjs` (Cập nhật):** Bổ sung bộ kiểm thử đối chiếu chính xác 6 nhóm dịch vụ kinh điển (ID, slug, title, deliveryModes) với `docs/BUSINESS_REQUIREMENTS.md` và `migrations/001_initial_schema.sql`.
- **`tests/p4_1_3_final_readiness.test.mjs` (Cập nhật):** Cập nhật assertion tham số CLI sang `--dbname=service=...` và `--no-password`.
- **`tests/p4_1_4_final_gate.test.mjs` (Mới):** Bộ 10 bài kiểm thử tích hợp chuyên sâu cho toàn bộ yêu cầu của P4.1.4.

---

## 9. Trạng Thái Git & Commit Gốc (Git Status & Baseline Commit)

- **Commit Gốc (Baseline Commit):** `a8e2e5c`
- **Nhánh Hiện Tại:** `master`
- **Tình trạng:** Sẵn sàng commit các tệp đã hoàn thiện cho P4.1.4:
  ```
  modified:   scripts/backup.sh
  modified:   scripts/credential-helper.mjs
  modified:   scripts/migrate.mjs
  modified:   scripts/restore-guard.mjs
  modified:   scripts/restore.sh
  modified:   tests/p4_1_3_final_readiness.test.mjs
  modified:   tests/services.test.mjs
  untracked:  tests/p4_1_4_final_gate.test.mjs
  untracked:  audit/P4_1_4_FINAL_INTEGRATION_GATE_REPORT.md
  ```

---

## 10. Các Thao Tác Tuyệt Đối Không Thực Hiện (Operations Explicitly Not Executed)

Tuân thủ nghiêm ngặt nguyên tắc trung thực và bảo vệ hạ tầng:
1. **Tài nguyên Fly.io được bảo vệ nguyên vẹn:**
   - App: `openwebui-mqtech`
   - Machine: `2871574ae574e8`
   - Volume: `vol_4m3m9jdgen55793v`
   - Khu vực: `sin`
   - *Không có bất kỳ lệnh Fly CLI nào được gọi tới các tài nguyên này.*
2. **Không kết nối hoặc tạo tài nguyên đám mây:** Không tạo ứng dụng Fly.io mới, không tạo cụm PostgreSQL trên đám mây, không tạo bí mật trên đám mây, không cấu hình DNS.
3. **Không thực thi lệnh restore dữ liệu:** Script restore không được chạy trong giai đoạn này.
4. **Không kết nối cơ sở dữ liệu thật:** Không kết nối tới bất kỳ database ngoài nào.
5. **Không chạy Docker / Host Postgres:** Môi trường cục bộ Windows không có Docker daemon hay PostgreSQL binary runtime cục bộ; toàn bộ kiểm tra sử dụng process argument capture harness và mock query fixtures trung thực.

---

## 11. Các Điểm Chặn Runtime Còn Lại (Remaining Runtime Blockers)

- **Không còn bất kỳ điểm chặn nào ở cấp độ mã nguồn phần mềm, kịch bản vận hành hay định nghĩa nghiệp vụ.**
- Để chuyển sang giai đoạn Staging thực tế (Phase P5), cần sự phê duyệt rõ ràng từ người dùng để:
  1. Cấp quyền chạy Fly CLI tạo ứng dụng staging độc lập (`mqtech-web-staging`).
  2. Tạo cụm database Fly Managed Postgres staging riêng biệt (`mqtech-db-staging`).
  3. Cung cấp các giá trị bí mật staging thực tế (`ADMIN_SESSION_SECRET`, `ADMIN_INIT_PASSWORD`).

---

## 12. Quyết Định Sẵn Sàng Cuối Cùng (Final GO/NO-GO Decision)

### ĐÁNH GIÁ: **GO FOR USER REVIEW & STAGING PROVISIONING GATE**
- **Cú pháp CLI PostgreSQL:** ĐẠT CHUẨN (Hợp lệ theo tài liệu chính thức của libpq).
- **An toàn thông tin đăng nhập:** ĐẠT CHUẨN (Chống INI injection, percent-decoding RFC 3986, giải pháp tmpfs/trap an toàn).
- **Kiểm soát mục tiêu Restore:** ĐẠT CHUẨN (Fail-closed, kiểm tra danh tính kép, chống tự ghi đè).
- **Dịch vụ kinh doanh cốt lõi:** ĐỒNG BỘ 100% (6 nhóm dịch vụ kinh điển đã được kiểm chứng khớp hoàn toàn trên UI, API, Schema và Migration).
- **Phân tách kết nối Pooled/Direct:** ĐẠT CHUẨN (Tự động nhận diện PgBouncer/Fly MPG, bảo vệ khóa migration).

Hệ thống đã hoàn thành trọn vẹn Phase P4.1.4 và đang dừng tại cổng hoàn tất để chờ người dùng đánh giá và phê duyệt trước khi tiến hành bất kỳ thao tác nào trên hạ tầng đám mây.
