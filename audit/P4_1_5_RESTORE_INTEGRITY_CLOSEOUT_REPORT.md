# Báo Cáo Kiểm Tra Toàn Vẹn Khôi Phục & An Toàn Kết Nối (P4.1.5)
**MQTech — Dịch Vụ Sửa Chữa & Cứu Hộ Máy Tính**  
**Mã Báo Cáo:** `P4_1_5_RESTORE_INTEGRITY_CLOSEOUT_REPORT`  
**Trạng Thái:** HOÀN TẤT & ĐẠT CHUẨN (COMPLETED & READY FOR EVALUATION)  
**Môi Trường Thực Hiện:** Local Engineering / Development Only (Không tương tác hạ tầng đám mây)  
**Commit Gốc Baseline:** `d4b2d20` (Baseline sau P4.1.4)

---

## 1. Ngữ Nghĩa Thất Bại Khi Khôi Phục (Restore Failure Semantics)

Trong các phiên bản trước P4.1.5, tập lệnh khôi phục dữ liệu (`pg_restore`) sử dụng các cờ `--clean` và `--if-exists`, nhưng **không** kích hoạt các cờ kiểm soát lỗi nghiêm ngặt (`--single-transaction` và `--exit-on-error`). Mặc định của `pg_restore` khi gặp lỗi SQL là in thông báo lỗi, tiếp tục thực thi các lệnh tiếp theo và chỉ xuất ra tổng số lỗi ở cuối tiến trình. Điều này dẫn đến nguy cơ CSDL rơi vào trạng thái "khôi phục dở dang" (partial restore / corrupted schema state), làm sai lệch dữ liệu mà không bị chặn lại ngay lập tức.

### Chính sách thất bại trong P4.1.5:
1. **Cưỡng chế ngắt tiến trình ngay khi phát sinh lỗi (`--exit-on-error` / `-e`):** Ngay khi một lệnh SQL hoặc thao tác dữ liệu thất bại, `pg_restore` lập tức dừng hoạt động và trả về exit code khác 0.
2. **Loại trừ hoàn toàn khôi phục song song (`-j` / `--jobs`):** Theo tài liệu chính thức PostgreSQL, cờ `--single-transaction` không thể hoạt động cùng lúc với chế độ đa luồng (`--jobs`). Đối với quy mô dữ liệu ban đầu của MQTech, việc đảm bảo tính toàn vẹn giao dịch được ưu tiên tuyệt đối so với tốc độ chạy song song.
3. **Quy trình xử lý sự cố khôi phục không trọn vẹn (Partial Restore Recovery):** Nhờ cơ chế giao dịch đơn (xem Mục 2), khi phát sinh lỗi, CSDL đích sẽ tự động rollback về trạng thái trước khi khôi phục, không để lại bảng hay dữ liệu rác dở dang.

---

## 2. Chính Sách Giao Dịch Khi Khôi Phục (Transaction Policy)

### Thực thi giao dịch đơn tử (`--single-transaction` / `-1`):
Trong `scripts/credential-helper.mjs` và `scripts/restore.sh`, toàn bộ câu lệnh SQL phục hồi được bọc trong một giao dịch duy nhất (`BEGIN ... COMMIT`):
```bash
pg_restore \
  --dbname="service=${PGSERVICE}" \
  --no-password \
  --single-transaction \
  --exit-on-error \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  "${BACKUP_FILE}"
```
- **Tính chất nguyên tử (Atomicity):** Tất cả các câu lệnh cấu trúc (DDL) và dữ liệu (DML) từ bản sao lưu phải thành công 100% thì mới được `COMMIT`. Nếu có bất kỳ câu lệnh nào thất bại hoặc kết nối bị ngắt quãng giữa chừng, toàn bộ giao dịch sẽ tự động `ROLLBACK`.
- **An toàn cho môi trường diễn tập:** Đảm bảo CSDL kiểm thử dùng một lần (`_test`, `_disposable`) không bao giờ chứa cấu trúc nửa vời gây sai lệch kết quả đánh giá.

---

## 3. Bảo Toàn Tham Số An Toàn Kết Nối TLS (TLS Parameter Preservation)

Trong `scripts/credential-helper.mjs`, hàm `parseDatabaseUrl` và `buildPgServiceConfig` đã được nâng cấp toàn diện để trích xuất, xác thực và bảo toàn các tham số bảo mật kết nối từ URL gốc khi tạo tệp `pg_service.conf`:

### Danh mục tham số được bảo toàn:
1. **`sslmode`:**
   - Hỗ trợ đầy đủ các chế độ chuẩn PostgreSQL libpq: `disable`, `allow`, `prefer`, `require`, `verify-ca`, `verify-full`.
   - **Tuyệt đối không tự ý hạ cấp TLS (No Silent Downgrade):** Nếu chuỗi kết nối yêu cầu `verify-full`, giá trị này được giữ nguyên chính xác 100%, không bao giờ bị chuyển đổi thành `prefer` hay `require`.
   - **Từ chối cấu hình mơ hồ:** Mọi giá trị `sslmode` không thuộc danh sách chuẩn (ví dụ `sslmode=insecure`, `sslmode=yes`) đều bị ném lỗi chặn đứng ngay lập tức thay vì tự ý đoán định.
2. **`sslrootcert`, `sslcert`, `sslkey`:**
   - Trích xuất và truyền nguyên vẹn đường dẫn chứng chỉ CA gốc, chứng chỉ máy khách và khóa bí mật máy khách.
   - Kiểm tra và cấm ký tự xuống dòng (`\r`, `\n`) để ngăn ngừa tấn công INI injection.
   - **Bảo mật tuyệt đối:** Nội dung khóa riêng tư (`sslkey`) và mật khẩu không bao giờ được ghi vào log hệ thống.
3. **`connect_timeout`:**
   - Xác thực số nguyên dương hợp lệ. Ngăn chặn treo tiến trình vô hạn nếu máy chủ không phản hồi.
4. **`target_session_attrs`:**
   - Kiểm tra và bảo toàn cấu hình phiên kết nối (`any`, `read-write`, `read-only`, `primary`, `standby`, `prefer-standby`).
5. **`application_name`:**
   - Bảo toàn định danh ứng dụng cho việc giám sát phiên trên PostgreSQL `pg_stat_activity`.

---

## 4. Yêu Cầu An Toàn Danh Tính Mục Tiêu Khôi Phục (Restore Target Identity Requirements)

Trong `scripts/restore-guard.mjs`, cơ chế xác minh danh tính được thiết kế theo nguyên tắc **Fail-closed độc lập với URL**:

### Các yêu cầu bắt buộc khi khôi phục phá hủy (Destructive Restore):
1. **Khai báo máy chủ kỳ vọng độc lập (`EXPECTED_RESTORE_HOST`):** Bắt buộc người vận hành phải chỉ định rõ hostname kỳ vọng (ví dụ `localhost`). Nếu hostname trích xuất từ `TARGET_DATABASE_URL` không khớp chính xác, tiến trình lập tức từ chối.
2. **Khai báo CSDL kỳ vọng độc lập (`EXPECTED_RESTORE_DB_NAME`):** Bắt buộc người vận hành phải chỉ định rõ tên CSDL kỳ vọng. Nếu tên CSDL trong URL không khớp, tiến trình lập tức từ chối.
3. **Ký hiệu CSDL dùng một lần (`DISPOSABLE_MARKERS`):** Tên CSDL đích bắt buộc phải chứa nhãn an toàn (`_dev`, `_test`, `_disposable`, `_restore_test`, `mqtech_test`).
4. **Chống tự ghi đè hủy diệt (Source/Destination Mismatch):** Phân tích nguồn gốc `SOURCE_DATABASE_URL` (hoặc `DATABASE_URL`). Nếu nguồn và đích trùng máy chủ và tên CSDL, lập tức chặn đứng.
5. **Xác minh định danh hệ thống CSDL (`expectedSystemIdentifier` / `serverIdentifier`):** Khi chính sách an toàn yêu cầu xác minh máy chủ (`requireSystemIdentifier`), nếu không lấy được định danh hệ thống hoặc định danh bị sai lệch, tiến trình lập tức từ chối.
6. **Cờ xác nhận không thể ghi đè (No Confirmation Override):** Cờ `CONFIRM_DESTRUCTIVE_RESTORE=true` chỉ được xem xét sau khi toàn bộ các kiểm tra danh tính và an toàn ở trên đều vượt qua. Nếu bất kỳ kiểm tra danh tính nào thất bại, cờ xác nhận hoàn toàn vô hiệu.

### Giới hạn của nền tảng đám mây quản lý (Cloud Managed Postgres Limitations):
- Trên các dịch vụ CSDL được quản lý (như Fly Managed Postgres, AWS RDS, Supabase), người dùng ứng dụng thông thường không có quyền superuser để thực thi hàm hệ thống `SELECT system_identifier FROM pg_control_system()`.
- Trong môi trường này, hệ thống áp dụng cơ chế phòng thủ đa tầng (defense-in-depth): bắt buộc khai báo `EXPECTED_RESTORE_HOST`, `EXPECTED_RESTORE_DB_NAME`, đối chiếu nguồn/đích, nhãn disposable, danh sách loopback allowlist và xác nhận kép từ người vận hành.

---

## 5. Trạng Thái Kiểm Tra Tương Thích PostgreSQL Client Bản Địa (Native Client Verification Status)

### Kiểm tra thực tế trên môi trường:
Đã thực thi kiểm tra sự tồn tại của các công cụ dòng lệnh PostgreSQL trên máy trạm Windows:
- `Get-Command pg_dump` -> **NOT FOUND (Code 1)**
- `Get-Command pg_restore` -> **NOT FOUND (Code 1)**
- `Get-Command psql` -> **NOT FOUND (Code 1)**

### Kết luận minh bạch theo nguyên tắc Truthfulness:
- Toàn bộ các bài kiểm tra chạy trực tiếp binary bản địa (`pg_dump --version`, `pg_restore --version`, kiểm thử rollback trực tiếp trên CSDL thật bằng binary PostgreSQL) được đánh dấu trung thực là: **NOT RUN**.
- Không coi các bài kiểm tra tham số (argument capture harness) hay mock objects là bằng chứng chứng minh tương thích binary client bản địa.
- Tác vụ xác thực runtime với binary `pg_dump` và `pg_restore` được ghi nhận rõ ràng là **bài kiểm tra chấp nhận bắt buộc (Mandatory Acceptance Test) tại môi trường Staging (Phase P5)**.

---

## 6. Lệnh Kiểm Tra & Kết Quả Thực Tế (Tests and Quality Gates)

Toàn bộ các bộ kiểm tra tự động của dự án đã được thực thi và xác nhận:

| Lệnh / Quy Trình | Kết Quả Thực Tế | Chi Tiết / Độ Bao Phủ |
| :--- | :--- | :--- |
| `node --test tests/p4_1_5_restore_integrity.test.mjs` | **8/8 PASSED** (10ms) | Kiểm thử `--single-transaction`, `--exit-on-error`, bảo toàn TLS (`verify-full`, certs, timeout), cấm hạ cấp TLS, xác minh danh tính restore độc lập. |
| `node --test tests/p4_1_4_final_gate.test.mjs` | **10/10 PASSED** (14ms) | Cú pháp CLI `--dbname=service=...`, `--no-password`, percent-encoding, INI injection prevention, Restore Guard expected identity, Fly MPG pooler detection. |
| `node --test tests/services.test.mjs` | **6/6 PASSED** (8ms) | Đối chiếu chính xác 100% 6 nhóm dịch vụ kinh điển MQTech theo ID, slug, title và migration SQL seed. |
| `node --test tests/p4_1_3_final_readiness.test.mjs` | **11/11 PASSED** (17ms) | Credential Helper, argv capture harness không lộ mật khẩu, Restore Guard host allowlist, PgBouncer detection, schema constraint verification. |
| `npm test` (Full Test Suite) | **132/132 PASSED** (19 suites, 989ms) | Toàn bộ 19 bộ kiểm thử đơn vị và tích hợp nội bộ của dự án vượt qua 100%. |
| `npm run typecheck` (`tsc --noEmit`) | **EXIT 0** | 0 lỗi TypeScript strict mode. |
| `npm run lint` (`eslint`) | **EXIT 0** | 0 errors, 0 warnings (đã dọn sạch toàn bộ biến thừa). |
| `npm run build` (`next build`) | **EXIT 0** | Biên dịch thành công 16 route tĩnh và động với Turbopack. |
| `node scripts/migrate.mjs --dry-run` | **EXIT 0** | Migration checksum `001_initial_schema.sql` (d8b1857db4ae...) hợp lệ. |

---

## 7. Danh Sách Tệp Thay Đổi (Changed Files)

- **`scripts/credential-helper.mjs`:**
  - Bổ sung `--single-transaction` và `--exit-on-error` trong `getSafeRestoreArgs`.
  - Nâng cấp `parseDatabaseUrl` và `buildPgServiceConfig` hỗ trợ bảo toàn các tham số TLS/an toàn kết nối (`sslmode`, `sslrootcert`, `sslcert`, `sslkey`, `connect_timeout`, `target_session_attrs`, `application_name`).
  - Thêm cơ chế cấm tự ý hạ cấp TLS và cấm ký tự xuống dòng trong chuỗi kết nối URL.
- **`scripts/restore.sh`:**
  - Bổ sung `--single-transaction` và `--exit-on-error` trong lệnh gọi `pg_restore`.
  - Bắt buộc khai báo tường minh `EXPECTED_RESTORE_HOST` và `EXPECTED_RESTORE_DB_NAME` trước khi chạy.
- **`scripts/restore-guard.mjs`:**
  - Cập nhật cơ chế yêu cầu danh tính độc lập (`requireExplicitIdentity`).
  - Cập nhật tài liệu giới hạn hệ thống của Fly Managed Postgres đối với `pg_control_system()`.
- **`tests/p4_1_4_final_gate.test.mjs`:**
  - Bổ sung assertion kiểm tra `--single-transaction` và `--exit-on-error`.
- **`tests/p4_1_5_restore_integrity.test.mjs` (Mới):**
  - 8 test cases chuyên sâu kiểm tra toàn diện chính sách giao dịch, bảo toàn TLS, cấm hạ cấp TLS và an toàn danh tính Restore Guard.

---

## 8. Trạng Thái Git & Commit Gốc (Git Status & Baseline Commit)

- **Commit Gốc (Baseline Commit):** `d4b2d20`
- **Nhánh Hiện Tại:** `master`
- **Tình trạng:** Sẵn sàng commit các tệp hoàn thiện cho P4.1.5:
  ```
  modified:   scripts/credential-helper.mjs
  modified:   scripts/restore-guard.mjs
  modified:   scripts/restore.sh
  modified:   tests/p4_1_4_final_gate.test.mjs
  untracked:  tests/p4_1_5_restore_integrity.test.mjs
  untracked:  audit/P4_1_5_RESTORE_INTEGRITY_CLOSEOUT_REPORT.md
  ```

---

## 9. Các Thao Tác Tuyệt Đối Không Thực Hiện (Operations Explicitly Not Executed)

Tuân thủ nghiêm ngặt ranh giới an toàn hạ tầng và nguyên tắc trung thực:
1. **Tài nguyên Fly.io được bảo vệ nguyên vẹn:**
   - App: `openwebui-mqtech`
   - Machine: `2871574ae574e8`
   - Volume: `vol_4m3m9jdgen55793v`
   - Khu vực: `sin`
   - *Không có bất kỳ lệnh Fly CLI nào được gọi tới các tài nguyên này.*
2. **Không kết nối hoặc tạo tài nguyên đám mây:** Không tạo ứng dụng Fly.io mới, không tạo cụm PostgreSQL trên đám mây, không tạo bí mật trên đám mây, không cấu hình DNS.
3. **Không thực thi lệnh restore dữ liệu:** Script restore không được chạy trong giai đoạn này.
4. **Không kết nối cơ sở dữ liệu thật:** Không kết nối tới bất kỳ database ngoài nào.
5. **Không cài đặt phần mềm ngoài:** Không tự ý cài đặt PostgreSQL client hay thay đổi service Windows.

---

## 10. Các Bài Kiểm Tra Chấp Nhận Staging Còn Lại (Remaining Staging Integration Tests)

Khi bước vào giai đoạn Staging (Phase P5) trên môi trường có binary PostgreSQL client và Fly Managed Postgres:
1. **Kiểm tra phiên bản Client Binary:** Chạy `pg_dump --version` và `pg_restore --version` trong container Linux để xác thực tính tương thích với PostgreSQL server 16+.
2. **Kiểm tra khôi phục nguyên tử thật (Live Single-Transaction Rollback):** Tạo một tệp dump có chủ ý chứa lỗi cú pháp SQL và kiểm tra xem `pg_restore --single-transaction --exit-on-error` có thực hiện rollback 100% trên database tạm `mqtech_stage_drill` hay không.
3. **Kiểm tra kết nối TLS thực tế:** Kết nối tới Fly Managed Postgres với `sslmode=verify-full` và kiểm chứng bắt tay TLS thành công.
4. **Kiểm tra di chuyển dữ liệu (Direct Migration Test):** Chạy `release_command = "node scripts/migrate.mjs"` qua kết nối `MIGRATION_DATABASE_URL` (port 5432) để kiểm chứng lấy khóa cố vấn `pg_advisory_lock` thành công trên hạ tầng Fly MPG thật.

---

## 11. Khuyến Nghị Sẵn Sàng Cuối Cùng (Final GO/NO-GO Recommendation)

### ĐÁNH GIÁ: **GO FOR STAGING PROVISIONING AUTHORIZATION (PHASE P5)**
- **Chính sách thất bại khi khôi phục:** ĐẠT CHUẨN (Nguyên tử, tự động rollback, ngắt ngay khi có lỗi).
- **Bảo toàn TLS:** ĐẠT CHUẨN (Không tự ý hạ cấp, bảo toàn `verify-full`, certs, timeout).
- **An toàn danh tính CSDL đích:** ĐẠT CHUẨN (Fail-closed độc lập với URL, bắt buộc hostname và DB name kỳ vọng).
- **Chất lượng mã nguồn:** 132/132 unit & safety tests vượt qua, typecheck, lint, build sạch 100%.

Toàn bộ các hạng mục rà soát kỹ thuật của Phase P4.1.5 đã hoàn thành. Hệ thống đang dừng tại completion gate chờ phê duyệt từ bạn trước khi chuyển sang giai đoạn tạo hạ tầng Staging.
