#!/usr/bin/env bash
# ==============================================================================
# MQTech PostgreSQL Initialization Script
# Executed automatically by postgres entrypoint upon initial database creation.
# 
# SECURITY PRINCIPLES:
# 1. Least Privilege: Web runtime (mqtech_app) has DML-only access.
# 2. Separation of Concerns: Migrator role (mqtech_migrator) has DDL privileges.
# 3. Superuser Isolation: The 'postgres' superuser credentials are NEVER exposed
#    to web runtime environment or application configuration.
# 4. SCRAM-SHA-256: Mandatory password encryption for all roles.
# 5. Injection Prevention: All dynamic SQL statements use format(%I, %L) with psql variables.
# ==============================================================================

set -euo pipefail

DB_NAME="${POSTGRES_DB:-mqtech}"
APP_USER="mqtech_app"
MIGRATOR_USER="mqtech_migrator"

APP_PASS="${APP_PASSWORD:?ERROR: APP_PASSWORD environment variable must be set during database initialization}"
MIGRATOR_PASS="${MIGRATOR_PASSWORD:?ERROR: MIGRATOR_PASSWORD environment variable must be set during database initialization}"

echo "=========================================================="
echo "    MQTech Database Initialization: Roles & Permissions   "
echo "=========================================================="

psql -v ON_ERROR_STOP=1 \
     --username "$POSTGRES_USER" \
     --dbname "$POSTGRES_DB" \
     -v migrator_user="$MIGRATOR_USER" \
     -v migrator_pass="$MIGRATOR_PASS" \
     -v app_user="$APP_USER" \
     -v app_pass="$APP_PASS" \
     -v db_name="$DB_NAME" <<- 'EOSQL'
    -- 1. Ensure uuid-ossp extension is enabled
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- 2. Bind psql variables to custom session settings so they are accessible inside PL/pgSQL
    SET myvars.migrator_user = :'migrator_user';
    SET myvars.migrator_pass = :'migrator_pass';
    SET myvars.app_user = :'app_user';
    SET myvars.app_pass = :'app_pass';
    SET myvars.db_name = :'db_name';

    -- 3. Create / Update Migration & Application Roles securely using format(%I, %L)
    DO $do$
    DECLARE
        m_user text := current_setting('myvars.migrator_user');
        m_pass text := current_setting('myvars.migrator_pass');
        a_user text := current_setting('myvars.app_user');
        a_pass text := current_setting('myvars.app_pass');
        target_db text := current_setting('myvars.db_name');
    BEGIN
        -- Migration User (DDL permissions for schema migrations)
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = m_user) THEN
            EXECUTE format('CREATE ROLE %I WITH LOGIN PASSWORD %L NOINHERIT', m_user, m_pass);
        ELSE
            EXECUTE format('ALTER ROLE %I WITH PASSWORD %L', m_user, m_pass);
        END IF;

        -- Application Runtime User (DML-only, Least Privilege)
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = a_user) THEN
            EXECUTE format('CREATE ROLE %I WITH LOGIN PASSWORD %L NOINHERIT', a_user, a_pass);
        ELSE
            EXECUTE format('ALTER ROLE %I WITH PASSWORD %L', a_user, a_pass);
        END IF;

        -- Database Connection Grants
        EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', target_db, m_user);
        EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', target_db, a_user);

        -- Schema Permissions
        EXECUTE format('GRANT ALL ON SCHEMA public TO %I', m_user);
        EXECUTE format('GRANT USAGE ON SCHEMA public TO %I', a_user);

        -- Default Privileges for Tables & Sequences created by Migrator
        EXECUTE format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', m_user, a_user);
        EXECUTE format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO %I', m_user, a_user);

        -- Revoke dangerous permissions from public role
        REVOKE CREATE ON SCHEMA public FROM PUBLIC;
    END
    $do$;
EOSQL

echo "[INITIALIZATION COMPLETE]: Created roles '$MIGRATOR_USER' and '$APP_USER' with least-privilege boundary on '$DB_NAME'."
