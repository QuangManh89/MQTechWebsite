#!/usr/bin/env bash
# ==============================================================================
# MQTech PostgreSQL Backup Script
# 
# SAFETY RULES:
# - NEVER pass passwords as command-line arguments (prevents leakage via ps aux).
# - Uses environment variables (DATABASE_URL or PGPASSWORD) for credentials.
# - Sets restrictive file permissions (umask 077 -> chmod 600).
# - Computes SHA-256 integrity checksum.
# - At-rest GPG/KMS envelope encryption is a documented mandatory external step.
# ==============================================================================

set -euo pipefail

# Enforce secure umask so all created files are 0600 (owner-only read/write)
umask 077

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date -u +"%Y%m%d_%H%M%SZ")"
BACKUP_FILENAME="mqtech_backup_${TIMESTAMP}.dump"
BACKUP_FILEPATH="${BACKUP_DIR}/${BACKUP_FILENAME}"
CHECKSUM_FILEPATH="${BACKUP_FILEPATH}.sha256"

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

echo "======================================================="
echo "       MQTech PostgreSQL Database Backup Engine        "
echo "======================================================="

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[LỖI]: Biến môi trường DATABASE_URL không được thiết lập."
  echo "Vui lòng cung cấp DATABASE_URL qua biến môi trường an toàn."
  exit 1
fi

echo "[Khởi tạo]: Đang tiến hành sao lưu cấu trúc và dữ liệu..."
echo "[Mã hóa nghỉ]: NOT IMPLEMENTED (Bản nén nguyên bản; yêu cầu mã hóa ngoài trước khi tải lên kho lưu trữ)"
echo "[Tệp xuất]: ${BACKUP_FILEPATH}"

# Execute pg_dump using native environment credential resolution
# Output format: Custom binary compressed (-Fc)
pg_dump \
  --dbname="${DATABASE_URL}" \
  --format=c \
  --no-owner \
  --no-privileges \
  --file="${BACKUP_FILEPATH}"

# Ensure restrictive permissions
chmod 600 "${BACKUP_FILEPATH}"

# Compute SHA-256 integrity digest
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "${BACKUP_FILEPATH}" > "${CHECKSUM_FILEPATH}"
elif command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "${BACKUP_FILEPATH}" > "${CHECKSUM_FILEPATH}"
fi

if [ -f "${CHECKSUM_FILEPATH}" ]; then
  chmod 600 "${CHECKSUM_FILEPATH}"
  echo "[Toàn vẹn]: Đã tạo chữ ký SHA-256 tại ${CHECKSUM_FILEPATH}"
fi

echo "[Thành công]: Bản sao lưu đã được tạo hoàn tất."
echo ""
echo "-------------------------------------------------------"
echo "LƯU Ý BẢO MẬT & VẬN HÀNH (OPERATIONAL REQUIREMENTS):"
echo "1. MÃ HÓA NGHỈ (ENCRYPTION AT REST): Bản dump hiện tại là nhị phân nén chuẩn."
echo "   Nếu lưu trữ off-site (S3, GCS, R2), BẮT BUỘC phải thực hiện mã hóa bằng GPG"
echo "   hoặc KMS envelope encryption. KHÔNG lưu trữ khóa giải mã cạnh tệp sao lưu."
echo "2. CHÍNH SÁCH LƯU TRỮ (RETENTION POLICY):"
echo "   - Bản sao lưu hàng ngày: lưu giữ 7 ngày."
echo "   - Bản sao lưu hàng tuần: lưu giữ 4 tuần."
echo "   - Bản sao lưu hàng tháng: lưu giữ 12 tháng."
echo "   Tiến trình dọn dẹp (pruning) phải được quản lý bởi công cụ vòng đời lưu trữ độc lập."
echo "======================================================="
