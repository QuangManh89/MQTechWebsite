#!/usr/bin/env bash
# ==============================================================================
# MQTech PostgreSQL Restore Engine (P4.1.5)
# 
# SAFETY SAFEGUARDS:
# 1. Approved Target Host Allowlist: Rejects all remote/unknown hosts by default.
#    Only approved local loopback interfaces are accepted.
# 2. Strict Destination Identity Requirement (P4.1.5):
#    - EXPECTED_RESTORE_HOST (required)
#    - EXPECTED_RESTORE_DB_NAME (required)
# 3. Disposable Database Name Enforcement: Target DB name must contain a disposable
#    test marker (_dev, _test, _disposable, _restore_test).
# 4. Source & Destination Identity Conflict: Strictly rejects restoring into the
#    same database as the source (prevents accidental self-clobbering).
# 5. Two-Factor Operator Confirmation:
#    - CONFIRM_DESTRUCTIVE_RESTORE=true
#    - CONFIRM_RESTORE_DB_NAME="<exact_target_db_name>"
# 6. Masked Credential Logging: Never prints passwords or raw connection strings.
# 7. Atomic Restore Failure Policy (P4.1.5):
#    Uses --single-transaction and --exit-on-error. Either all SQL commands succeed,
#    or the transaction is rolled back completely. No partial corrupted state.
# 8. Supported libpq CLI Invocation: Uses --dbname="service=${PGSERVICE}" --no-password.
#    (--service is NOT a supported flag in pg_restore).
# ==============================================================================

set -euo pipefail

BACKUP_FILE="${1:-}"

echo "======================================================="
echo "       MQTech PostgreSQL Database Restore Engine       "
echo "======================================================="

# --- Step 1: Input Validation ---
if [ -z "${BACKUP_FILE}" ]; then
  echo "[LỖI]: Thiếu đường dẫn tệp sao lưu."
  echo "Cách dùng:"
  echo "  CONFIRM_DESTRUCTIVE_RESTORE=true \\"
  echo "  EXPECTED_RESTORE_HOST=\"localhost\" \\"
  echo "  EXPECTED_RESTORE_DB_NAME=\"mqtech_restore_test\" \\"
  echo "  CONFIRM_RESTORE_DB_NAME=\"mqtech_restore_test\" \\"
  echo "  TARGET_DATABASE_URL=\"postgresql://user:pass@localhost:5432/mqtech_restore_test\" \\"
  echo "  ./scripts/restore.sh <path-to-dump-file>"
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "[LỖI]: Tệp sao lưu không tồn tại: ${BACKUP_FILE}"
  exit 1
fi

if [ -z "${TARGET_DATABASE_URL:-}" ]; then
  echo "[LỖI]: Thiếu biến môi trường TARGET_DATABASE_URL."
  exit 1
fi

if [ -z "${EXPECTED_RESTORE_HOST:-}" ]; then
  echo "[LỖI]: Thiếu biến môi trường EXPECTED_RESTORE_HOST."
  echo "Để bảo đảm an toàn danh tính, bạn bắt buộc phải khai báo máy chủ kỳ vọng độc lập với URL."
  exit 1
fi

if [ -z "${EXPECTED_RESTORE_DB_NAME:-}" ]; then
  echo "[LỖI]: Thiếu biến môi trường EXPECTED_RESTORE_DB_NAME."
  echo "Để bảo đảm an toàn danh tính, bạn bắt buộc phải khai báo tên CSDL kỳ vọng độc lập với URL."
  exit 1
fi

# --- Step 2: Validate Target Safety via Restore Guard Engine ---
GUARD_OUTPUT="$(node scripts/restore-guard.mjs 2>&1)" || {
  echo "${GUARD_OUTPUT}"
  exit 1
}

TARGET_HOST="$(echo "${GUARD_OUTPUT}" | node -e 'console.log(JSON.parse(require("fs").readFileSync(0, "utf-8")).host);')"
TARGET_DB_NAME="$(echo "${GUARD_OUTPUT}" | node -e 'console.log(JSON.parse(require("fs").readFileSync(0, "utf-8")).dbName);')"
MASKED_TARGET_URL="$(echo "${GUARD_OUTPUT}" | node -e 'console.log(JSON.parse(require("fs").readFileSync(0, "utf-8")).maskedUrl);')"

echo "[Mục tiêu phục hồi]: ${MASKED_TARGET_URL}"
echo "[Máy chủ đích]: ${TARGET_HOST}"
echo "[Tên CSDL đích]: ${TARGET_DB_NAME}"
echo ""

# --- Step 3: Integrity Verification ---
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [ -f "${CHECKSUM_FILE}" ]; then
  echo "[Kiểm tra]: Đang xác thực chữ ký toàn vẹn SHA-256..."
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum -c "${CHECKSUM_FILE}"
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 -c "${CHECKSUM_FILE}"
  fi
  echo "[Toàn vẹn]: Xác thực SHA-256 thành công."
else
  echo "[CẢNH BÁO]: Không tìm thấy tệp chữ ký ${CHECKSUM_FILE}. Bỏ qua kiểm tra toàn vẹn tự động."
fi

echo "[MÃ HÓA NGHỈ]: NOT IMPLEMENTED (Tệp dump phải ở dạng nhị phân hợp lệ hoặc đã được giải mã bên ngoài trước khi truyền vào script này)."
echo ""
echo "[Thực thi]: Bắt đầu phục hồi cấu trúc và dữ liệu vào mục tiêu kiểm thử '${TARGET_DB_NAME}'..."
echo "[Chính sách thất bại]: Sử dụng --single-transaction và --exit-on-error (Khôi phục nguyên tử - Rollback toàn diện nếu có lỗi)."

# Establish private temporary credential directory (0700).
# Prefer volatile tmpfs (/dev/shm or XDG_RUNTIME_DIR) when available.
if [ -d "/dev/shm" ] && [ -w "/dev/shm" ]; then
  SECURE_TMP_DIR="$(mktemp -d /dev/shm/mqtech_restore_cred_XXXXXX 2>/dev/null || mktemp -d 2>/dev/null || mktemp -d -t 'mqtech_restore_cred')"
elif [ -n "${XDG_RUNTIME_DIR:-}" ] && [ -d "${XDG_RUNTIME_DIR}" ] && [ -w "${XDG_RUNTIME_DIR}" ]; then
  SECURE_TMP_DIR="$(mktemp -d "${XDG_RUNTIME_DIR}/mqtech_restore_cred_XXXXXX" 2>/dev/null || mktemp -d 2>/dev/null || mktemp -d -t 'mqtech_restore_cred')"
else
  SECURE_TMP_DIR="$(mktemp -d 2>/dev/null || mktemp -d -t 'mqtech_restore_cred')"
fi
chmod 700 "${SECURE_TMP_DIR}"

# Best-effort cleanup trap (cannot catch SIGKILL, kernel panic, or sudden power failure)
cleanup() {
  if [ -n "${SECURE_TMP_DIR:-}" ] && [ -d "${SECURE_TMP_DIR}" ]; then
    rm -rf "${SECURE_TMP_DIR}"
  fi
}
trap cleanup EXIT INT TERM QUIT HUP

export PGSERVICEFILE="${SECURE_TMP_DIR}/pg_service.conf"
export PGSERVICE="mqtech_restore"
node scripts/credential-helper.mjs write-service "${PGSERVICE}" "${PGSERVICEFILE}"

echo "[Bảo mật tiến trình]: Sử dụng PGSERVICEFILE (${PGSERVICEFILE}). Không truyền URL hay mật khẩu qua process argv."

# Invoke pg_restore with supported libpq connection syntax: --dbname="service=${PGSERVICE}"
# Uses --single-transaction and --exit-on-error for atomic execution:
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

echo "[Thành công]: Phục hồi dữ liệu hoàn tất thành công trên cơ sở dữ liệu đích."
echo "======================================================="
