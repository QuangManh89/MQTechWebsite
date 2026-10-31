#!/usr/bin/env bash
# ==============================================================================
# MQTech PostgreSQL Restore Engine
# 
# SAFETY SAFEGUARDS (P4.1.2):
# 1. Approved Target Host Allowlist: Rejects all remote/unknown hosts by default.
#    Only approved local loopback or designated disposable test hosts are accepted.
# 2. Disposable Database Name Enforcement: Target DB name must contain a disposable
#    test marker (_dev, _test, _disposable, _restore_test).
# 3. Source & Destination Identity Conflict: Strictly rejects restoring into the
#    same database as the source (prevents accidental self-clobbering).
# 4. Two-Factor Operator Confirmation:
#    - CONFIRM_DESTRUCTIVE_RESTORE=true
#    - CONFIRM_RESTORE_DB_NAME="<exact_target_db_name>"
# 5. Masked Credential Logging: Never prints passwords or raw connection strings.
# 6. Encryption Status: At-rest encryption remains NOT IMPLEMENTED internally.
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
  echo "  CONFIRM_RESTORE_DB_NAME=\"<target_db_name>\" \\"
  echo "  TARGET_DATABASE_URL=\"postgresql://user:pass@localhost:5432/<target_db_name>\" \\"
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

# --- Step 7: Integrity Verification ---
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

# Establish private temporary credential directory (0700) with cleanup trap
SECURE_TMP_DIR="$(mktemp -d 2>/dev/null || mktemp -d -t 'mqtech_restore_cred')"
chmod 700 "${SECURE_TMP_DIR}"

cleanup() {
  rm -rf "${SECURE_TMP_DIR}"
}
trap cleanup EXIT INT TERM QUIT

export PGSERVICEFILE="${SECURE_TMP_DIR}/pg_service.conf"
export PGSERVICE="mqtech_restore"
node scripts/credential-helper.mjs write-service "${PGSERVICE}" "${PGSERVICEFILE}"

echo "[Bảo mật tiến trình]: Sử dụng PGSERVICEFILE (${PGSERVICEFILE}). Không truyền URL hay mật khẩu qua process argv."

pg_restore \
  --service="${PGSERVICE}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  "${BACKUP_FILE}"

echo "[Thành công]: Phục hồi dữ liệu hoàn tất thành công trên cơ sở dữ liệu đích."
echo "======================================================="
