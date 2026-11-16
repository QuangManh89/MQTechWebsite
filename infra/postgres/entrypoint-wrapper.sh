#!/usr/bin/env bash
# ==============================================================================
# MQTech PostgreSQL Container Entrypoint Wrapper
# Preflight storage verification: fails safely if volume is absent, unmounted,
# read-only, or contains an incompatible PostgreSQL version.
# ==============================================================================

set -euo pipefail

VOLUME_MOUNT_PATH="/var/lib/postgresql/data"
PGDATA_PATH="${PGDATA:-/var/lib/postgresql/data/pgdata}"

echo "=========================================================="
echo "    MQTech PostgreSQL 16 Storage Preflight Check         "
echo "=========================================================="

# 1. Verify that the mount directory exists
if [ ! -d "$VOLUME_MOUNT_PATH" ]; then
    echo "[CRITICAL STORAGE ERROR]: Mount directory '$VOLUME_MOUNT_PATH' does not exist." >&2
    echo "Failing closed to prevent unpersisted database initialization." >&2
    exit 1
fi

# 2. Verify dedicated mountpoint status via /proc/mounts or mountpoint command
# Prevents initializing or running PostgreSQL on ephemeral root filesystem
IS_MOUNTED=0
if [ -f /proc/mounts ] && grep -qs " $VOLUME_MOUNT_PATH " /proc/mounts; then
    IS_MOUNTED=1
elif command -v mountpoint >/dev/null 2>&1 && mountpoint -q "$VOLUME_MOUNT_PATH"; then
    IS_MOUNTED=1
fi

if [ "$IS_MOUNTED" -ne 1 ]; then
    if [ "${ALLOW_UNMOUNTED_STORAGE:-0}" = "1" ]; then
        echo "[WARNING]: '$VOLUME_MOUNT_PATH' is NOT a mounted volume, but ALLOW_UNMOUNTED_STORAGE=1."
    else
        echo "[CRITICAL STORAGE ERROR]: '$VOLUME_MOUNT_PATH' is NOT a mounted volume according to /proc/mounts." >&2
        echo "Refusing to start on ephemeral container filesystem. Check Fly.io volume attachment." >&2
        exit 1
    fi
fi

# 3. Verify write permission on the volume mount
TEST_TOUCH_FILE="$VOLUME_MOUNT_PATH/.storage_write_test_$$"
if ! touch "$TEST_TOUCH_FILE" 2>/dev/null; then
    echo "[CRITICAL STORAGE ERROR]: Mount directory '$VOLUME_MOUNT_PATH' is NOT writable." >&2
    echo "Check Fly.io volume attachment and file ownership." >&2
    exit 1
fi
rm -f "$TEST_TOUCH_FILE"

# 4. PostgreSQL Version Guard: If PGDATA already contains data, verify PG_VERSION == 16
if [ -f "$PGDATA_PATH/PG_VERSION" ]; then
    EXISTING_PG_VERSION=$(cat "$PGDATA_PATH/PG_VERSION")
    if [ "$EXISTING_PG_VERSION" != "16" ]; then
        echo "[CRITICAL STORAGE ERROR]: Existing PGDATA has PostgreSQL version '$EXISTING_PG_VERSION', but this container runs PostgreSQL 16." >&2
        echo "Refusing to start to avoid data corruption or incompatible cluster upgrade." >&2
        exit 1
    fi
    echo "[VERSION GUARD PASSED]: Existing cluster version matches PostgreSQL 16."
fi

# 5. Ensure PGDATA parent directory exists with proper permissions
mkdir -p "$PGDATA_PATH"
chmod 700 "$PGDATA_PATH"

echo "[STORAGE VERIFIED]: Persistent Volume is accessible, mounted, and writable at '$VOLUME_MOUNT_PATH'."
echo "[PGDATA PATH]: $PGDATA_PATH"
echo "Starting PostgreSQL server with custom memory configuration..."

# 6. Delegate to official postgres entrypoint with custom configuration
exec docker-entrypoint.sh postgres -c config_file=/etc/postgresql/postgresql.conf "$@"
