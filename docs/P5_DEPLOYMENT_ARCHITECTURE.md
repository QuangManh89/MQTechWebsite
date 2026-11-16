# MQTech — P5 Deployment Architecture & Infrastructure Specification

## 1. Executive Summary

This document establishes the verified deployment architecture for MQTech Phase P5 (Staging Preparation).

The target architecture decouples the Next.js application runtime from persistence and media storage:
1. **Web Application (`mqtech`)**: Fly.io Machine running Next.js App Router, SSR, public pages, Admin Dashboard, and API routes.
2. **Database Application (`mqtech-db`)**: Dedicated Fly.io Machine running self-managed PostgreSQL 16 on Alpine Linux with a 1GB persistent volume.
3. **Media & Storage (Cloudflare R2)**: Direct-to-bucket client uploads with strict privacy separation between public site assets and private customer equipment attachments.
4. **Networking**: Strictly private 6PN WireGuard mesh between Web and Database. Database has NO public IP, NO public TCP services, and NO HTTP services.

---

## 2. Infrastructure Identity & Resource Allocation

| Resource | Identity / Target | Region | CPU / Memory | Storage | Network Exposure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Web App** | `mqtech` | `sin` (Singapore) | `shared-cpu-1x`, 256MB | Ephemeral (Stateless) | Public HTTPS (`https://mqtech.fly.dev`) |
| **Database App** | `mqtech-db` | `sin` (Singapore) | `shared-cpu-1x`, 256MB | 1GB Persistent Volume (`pgdata`) | Private 6PN Mesh (`mqtech-db.internal:5432`) |
| **Media Bucket** | `mqtech-media-staging` | Auto (AP / Singapore) | Managed S3-compatible | Cloudflare R2 Standard | Private S3 API + CORS for `mqtech.fly.dev` |

### Platform Safety Boundary
- **Protected Resources (DO NOT TOUCH)**:
  - App: `openwebui-mqtech`
  - Machine: `2871574ae574e8`
  - Volume: `vol_4m3m9jdgen55793v`
  - Region: `sin`
- No cloud provisioning commands have been executed. All configurations are validated locally.

---

## 3. Database Architecture & Memory Tuning

### 3.1 PostgreSQL Engine & Volume
- Engine: PostgreSQL 16 on Alpine Linux (`postgres:16-alpine`).
- Dedicated Volume: Mounted at `/var/lib/postgresql/data` with sub-path `PGDATA=/var/lib/postgresql/data/pgdata`.
- **Volume Guard (`entrypoint-wrapper.sh`)**:
  - Validates that `/var/lib/postgresql/data` is an active mountpoint via `/proc/mounts`.
  - Verifies that the directory is writable.
  - If existing data is found, inspects `PG_VERSION` and ensures it equals `16`.
  - Fails closed immediately if unmounted, read-only, or version mismatch.

### 3.2 256MB RAM Memory Budget
With a 256MB total Machine memory budget, PostgreSQL is configured to prevent Linux OOM Killer invocation:
- `shared_buffers = 32MB`: Dedicated buffer pool (12.5% of total RAM).
- `work_mem = 1MB`: Memory per sort/hash operation. Note: **`work_mem` is allocated per operation per query**, so complex queries with multiple sort/hash nodes can allocate multiples of this value. With `max_connections = 10`, setting `work_mem = 1MB` provides safety against aggregate query spikes.
- `maintenance_work_mem = 16MB`: For VACUUM, CREATE INDEX.
- `max_connections = 10`: Strict connection cap. Web application connection pool is constrained to 3 connections (`max: 3`).
- `effective_cache_size = 128MB`: Kernel cache hint for the query planner.
- `wal_buffers = 1MB`: WAL buffer size.
- `min_wal_size = 64MB`, `max_wal_size = 512MB`: Checkpoint threshold. **Note: `max_wal_size` is a soft target for checkpoint triggering, NOT a hard storage cap.** During sustained write bursts or delayed checkpoints, WAL storage can exceed 512MB. With a 1GB volume, storage capacity must be monitored.

---

## 4. Security & Privilege Separation

### 4.1 Database Roles (Least Privilege)
The database enforces role separation via `01-init-roles-and-db.sh` using safe `format(%I, %L)` dynamic SQL:
1. **`postgres` (Superuser)**:
   - Used only during container initialization and emergency DBA operations.
   - Credentials are NEVER exposed to the Web application.
2. **`mqtech_migrator` (DDL Owner)**:
   - Owns schema `public`.
   - Used solely to run schema migrations (`scripts/migrate.mjs`).
   - Has DDL privileges (`CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`).
3. **`mqtech_app` (DML Runtime)**:
   - Runtime role used by Next.js application (`DATABASE_URL`).
   - Receives `SELECT, INSERT, UPDATE, DELETE` on tables and `USAGE, SELECT` on sequences.
   - Denied all DDL permissions. Cannot create or drop tables.

### 4.2 Web App Secret Separation
To uphold least privilege, `MIGRATION_DATABASE_URL` is **STRICTLY PROHIBITED** from Web app secrets.
The Web application configuration contains only:
- `DATABASE_URL`: `postgres://mqtech_app:<app_password>@mqtech-db.internal:5432/mqtech`
- `ADMIN_INIT_PASSWORD`: Temporary bootstrap password.
- `MQTECH_SESSION_SECRET`: Minimum 32-byte session signing key.
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`.

### 4.3 Operator Migration Runbook
Database migrations are run by an authorized operator through a secure Fly proxy tunnel:
```bash
# Terminal 1: Establish temporary encrypted proxy tunnel
fly proxy 5433:5432 -a mqtech-db

# Terminal 2: Execute migration with migrator credentials (local terminal only)
export MIGRATION_DATABASE_URL="postgres://mqtech_migrator:<migrator_password>@127.0.0.1:5433/mqtech"
node scripts/migrate.mjs

# Terminal 1: Terminate proxy session
Ctrl + C
```
*Note: Port 5433 is standard for operator proxy to avoid collisions with local PostgreSQL instances on 5432.*

---

## 5. Media & Customer Attachment Privacy Boundary

MQTech handles two distinct classes of media assets:

```
                           +------------------------+
                           |  Client Upload Request |
                           +-----------+------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
         [Category: MARKETING]               [Category: CUSTOMER_ATTACHMENT]
                   |                                       |
          Visibility: PUBLIC                      Visibility: PRIVATE
                   |                                       |
    Key: media/YYYY/MM/<id>-<name>         Key: attachments/YYYY/MM/<id>-<name>
                   |                                       |
         Presigned PUT to R2                     Presigned PUT to R2
                   |                                       |
          Public URL Enabled                    NO Public URL (null)
    (Staging: pub-staging.r2.dev)                          |
                   |                              Access Restricted to
      Crawlable / Web Display                   Authenticated Admin Only
                                                via Presigned GET (300s)
```

### 5.1 Public Media (`visibility: PUBLIC`)
- Categories: `MARKETING`, `SERVICE_ASSET`.
- Content: Website banners, service illustrations, public blog images.
- Key prefix: `media/YYYY/MM/`.
- Public delivery: `MEDIA_PUBLIC_BASE_URL` (in staging: Cloudflare `r2.dev` development domain; in production: custom CDN domain).

### 5.2 Private Customer Attachments (`visibility: PRIVATE`)
- Category: `CUSTOMER_ATTACHMENT`.
- Content: Customer computer photos, serial number labels, warranty seals, problem screenshots.
- Key prefix: `attachments/YYYY/MM/`.
- **Public URL: STRICTLY FORBIDDEN (`publicUrl: null`).**
- Access: Only accessible by authenticated administrators via short-lived AWS S3 SigV4 presigned GET URLs (`generateR2PresignedGetUrl`, expires in 300 seconds).
- Security rule compliance: Complies with Security & Privacy Rules prohibiting public disclosure of customer equipment or identifying data.

### 5.3 R2 CORS Configuration
The Cloudflare R2 bucket CORS policy strictly restricts origin:
- Staging/Production: `https://mqtech.fly.dev`
- Methods: `GET`, `PUT`, `HEAD`
- Headers: `content-type`, `x-amz-date`, `x-amz-content-sha256`, `authorization`
- MaxAge: 3600 seconds.

---

## 6. Healthchecks & Platform Observability

### 6.1 Web App (`fly.toml`)
1. **Service Readiness Check (`[[http_service.checks]]`)**:
   - Path: `/api/ready`
   - Role: Controls Fly Proxy traffic routing. If database connection fails, `/api/ready` returns HTTP 503, causing Fly Proxy to temporarily withdraw the machine from routing without restarting it.
2. **Top-Level Liveness Check (`[checks.process_liveness]`)**:
   - Path: `/api/health`
   - Role: Observability and reporting.

### 6.2 Database App (`infra/postgres/fly.toml`)
1. **Top-Level TCP Check (`[[checks]]`)**:
   - Type: `tcp` on port `5432`.
   - Validated by Fly platform schema (`fly config validate`).
2. **In-Container Healthcheck**:
   - Docker `HEALTHCHECK` runs `pg_isready -U mqtech_app -d mqtech`.
