#!/usr/bin/env bash
# ==============================================================================
# MQTech PostgreSQL Restore Engine
# 
# SAFETY BOUNDARIES:
# - STRICTLY FORBIDDEN on production databases.
# - Requires explicit CONFIRM_DESTRUCTIVE_RESTORE=true.
# - Rejects target URLs containing 'prod', 'production', 'live', 'openwebui', 'fly.dev'.
# - Verifies SHA-256 integrity checksum before restoration if checksum file exists.
# - Credentials read strictly from environment variable TARGET_DATABASE_URL.
# ==============================================================================

set -euo pipefail

BACKUP_FILE="${1:-}"

echo "======================================================="
echo "       MQTech PostgreSQL Database Restore Engine       "
echo "======================================================="

if [ -z "${BACKUP_FILE}" ]; then
  echo "[LỖI]: Thiếu đường dẫn tệp sao lưu."
  echo "Cách dùng: CONFIRM_DESTRUCTIVE_RESTORE=true TARGET_DATABASE_URL=... ./scripts/restore.sh <path-to-dump-file>"
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

# 1. Target Safety Validation: Reject any production-like keywords
FORBIDDEN_KEYWORDS="prod production live openwebui fly.dev"
for kw in ${FORBIDDEN_KEYWORDS}; do
  if echo "${TARGET_DATABASE_URL}" | grep -qi "${kw}"; then
    echo "[TỪ CHỐI BẢO MẬT]: TARGET_DATABASE_URL chứa từ khóa cấm ('${kw}')."
    echo "Nghiêm cấm thực thi phục hồi phá hủy (destructive restore) lên môi trường sản xuất!"
    exit 1
  fi
done

# 2. Enforce explicit confirmation flag
if [ "${CONFIRM_DESTRUCTIVE_RESTORE:-}" != "true" ]; then
  echo "[CẢNH BÁO BẢO VỆ DỮ LIỆU]: Thao tác phục hồi có tính chất ghi đè dữ liệu đích."
  echo "Để xác nhận, vui lòng đặt biến môi trường: CONFIRM_DESTRUCTIVE_RESTORE=true"
  exit 1
fi

# 3. Integrity Verification (if .sha256 file exists)
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

echo "[Thực thi]: Bắt đầu phục hồi cấu trúc và dữ liệu vào mục tiêu kiểm thử..."

pg_restore \
  --dbname="${TARGET_DATABASE_URL}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  "${BACKUP_FILE}"

echo "[Thành công]: Phục hồi dữ liệu hoàn tất thành công trên cơ sở dữ liệu đích."
echo "======================================================="
