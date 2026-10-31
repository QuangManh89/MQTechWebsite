#!/usr/bin/env bash
# ==============================================================================
# MQTech PostgreSQL Backup Script
# 
# SAFETY RULES:
# - NEVER pass passwords or raw connection URIs as command-line arguments.
# - Uses libpq PGSERVICEFILE and PGSERVICE environment variables.
# - Invokes pg_dump with supported standard: --dbname="service=${PGSERVICE}" --no-password.
# - Sets restrictive file permissions (umask 077 -> chmod 600).
# - Prefers tmpfs (in-memory) for credential files; cleans up with trap on EXIT/signals.
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

# 1. Establish private temporary credential directory (0700).
# Prefer volatile tmpfs (/dev/shm or XDG_RUNTIME_DIR) when available so credentials reside in RAM only.
# NEVER place credential files inside the backup archive directory (${BACKUP_DIR}).
if [ -d "/dev/shm" ] && [ -w "/dev/shm" ]; then
  SECURE_TMP_DIR="$(mktemp -d /dev/shm/mqtech_backup_cred_XXXXXX 2>/dev/null || mktemp -d 2>/dev/null || mktemp -d -t 'mqtech_backup_cred')"
elif [ -n "${XDG_RUNTIME_DIR:-}" ] && [ -d "${XDG_RUNTIME_DIR}" ] && [ -w "${XDG_RUNTIME_DIR}" ]; then
  SECURE_TMP_DIR="$(mktemp -d "${XDG_RUNTIME_DIR}/mqtech_backup_cred_XXXXXX" 2>/dev/null || mktemp -d 2>/dev/null || mktemp -d -t 'mqtech_backup_cred')"
else
  SECURE_TMP_DIR="$(mktemp -d 2>/dev/null || mktemp -d -t 'mqtech_backup_cred')"
fi
chmod 700 "${SECURE_TMP_DIR}"

# CLEANUP LIMITATIONS NOTE:
# Traps provide BEST-EFFORT cleanup for normal exit and standard catchable signals (INT, TERM, QUIT, HUP).
# Shell traps CANNOT guarantee cleanup after uncatchable SIGKILL (kill -9), kernel panic, or sudden power failure.
# Using tmpfs (/dev/shm) ensures any uncleaned residual files vanish upon system reboot.
cleanup() {
  if [ -n "${SECURE_TMP_DIR:-}" ] && [ -d "${SECURE_TMP_DIR}" ]; then
    rm -rf "${SECURE_TMP_DIR}"
  fi
}
trap cleanup EXIT INT TERM QUIT HUP

# 2. Write protected pg_service.conf (0600) to isolate credentials from process arguments
export PGSERVICEFILE="${SECURE_TMP_DIR}/pg_service.conf"
export PGSERVICE="mqtech_backup"
node scripts/credential-helper.mjs write-service "${PGSERVICE}" "${PGSERVICEFILE}"

echo "[Bảo mật tiến trình]: Sử dụng PGSERVICEFILE (${PGSERVICEFILE}). Không truyền mật khẩu hay raw URI qua process argv."

# 3. Execute pg_dump using documented libpq connection syntax: --dbname="service=${PGSERVICE}"
# Note: --service is not a supported flag in pg_dump; --dbname="service=..." is the official standard.
pg_dump \
  --dbname="service=${PGSERVICE}" \
  --no-password \
  --format=c \
  --no-owner \
  --no-privileges \
  --file="${BACKUP_FILEPATH}"

# Ensure restrictive permissions on generated dump
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
