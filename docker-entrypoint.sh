#!/bin/sh
set -e

# Ensure persistent volume data directory exists and has correct permissions
mkdir -p /data/.pglite-data
chown -R nextjs:nodejs /data

# Drop root privileges and execute the CMD as nextjs user
exec su-exec nextjs "$@"
