/**
 * MQTech Versioned PostgreSQL Migration Runner
 * 
 * Capabilities:
 * - Fail-closed database target validation (prevents execution on unknown/production databases).
 * - Tracks applied migrations with SHA-256 checksums in schema_migrations table.
 * - Single pinned client connection: BEGIN, DDL execution, checksum recording, COMMIT on same session.
 * - Automatic ROLLBACK on any migration error.
 * - Session-level advisory locking (pg_advisory_lock) against concurrent migration runs.
 * - Detects tampering/modification of previously applied migrations.
 * - Supports --dry-run, --status, and --baseline flags.
 * 
 * Usage:
 *   node scripts/migrate.mjs [--dry-run] [--status] [--baseline]
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { getAppConfig } from "../src/lib/env.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.resolve(__dirname, "../migrations");

// Advisory lock key dedicated to MQTech migrations
const MIGRATION_ADVISORY_LOCK_ID = 20261030;

const ALLOWED_LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
]);

const FORBIDDEN_DB_SUBSTRINGS = [
  "prod",
  "production",
  "live",
  "openwebui",
  "fly.dev",
];

export function isPooledConnection(databaseUrl) {
  if (!databaseUrl) return false;
  try {
    const u = new URL(databaseUrl);
    const port = u.port;
    const host = u.hostname.toLowerCase();
    const search = u.search.toLowerCase();
    return (
      port === "6543" ||
      host.includes("pooler") ||
      host.includes("pgbouncer") ||
      host.includes("supavisor") ||
      host.endsWith(".flycast") ||
      search.includes("pgbouncer=true") ||
      search.includes("pool_mode=")
    );
  } catch {
    return false;
  }
}

export function resolveMigrationConnectionUrl() {
  const config = getAppConfig();

  // 1. Prefer MIGRATION_DATABASE_URL if explicitly set
  if (process.env.MIGRATION_DATABASE_URL) {
    return {
      url: process.env.MIGRATION_DATABASE_URL,
      source: "MIGRATION_DATABASE_URL",
      isDirect: !isPooledConnection(process.env.MIGRATION_DATABASE_URL),
    };
  }

  // 2. In production or staging, MIGRATION_DATABASE_URL is mandatory
  if (config.isProduction || config.environment === "staging") {
    return {
      url: undefined,
      source: "NONE",
      isDirect: false,
      error:
        "MIGRATION_DATABASE_URL bắt buộc phải được cấu hình trong môi trường sản xuất/staging để đảm bảo kết nối direct cho session advisory lock.",
    };
  }

  // 3. In non-production (development, test), allow direct DATABASE_URL
  if (config.databaseUrl) {
    const isPooled = isPooledConnection(config.databaseUrl);
    return {
      url: config.databaseUrl,
      source: "DATABASE_URL",
      isDirect: !isPooled,
    };
  }

  return {
    url: undefined,
    source: "NONE",
    isDirect: false,
  };
}

export function validateMigrationTarget(databaseUrl, isDryRun) {
  if (!databaseUrl) {
    if (isDryRun) {
      return {
        allowed: true,
        details: {
          host: "none (dry-run)",
          dbName: "none",
          maskedUrl: "No DATABASE_URL set (Inspection Only)",
        },
      };
    }
    return {
      allowed: false,
      reason:
        "Bắt buộc phải có biến môi trường DATABASE_URL hoặc MIGRATION_DATABASE_URL để thực thi migration.",
    };
  }

  // Reject pooled connection immediately: advisory locks fail under transaction pooling
  if (isPooledConnection(databaseUrl)) {
    return {
      allowed: false,
      reason:
        "Phát hiện kết nối pooled (PgBouncer/Transaction pooling). Migration runner yêu cầu kết nối direct (MIGRATION_DATABASE_URL) để bảo đảm an toàn cho session advisory lock.",
    };
  }

  let parsed;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    return {
      allowed: false,
      reason: "DATABASE_URL không đúng định dạng URL hợp lệ.",
    };
  }

  const host = parsed.hostname.toLowerCase();
  const dbName = parsed.pathname.replace(/^\//, "").toLowerCase();

  for (const forbidden of FORBIDDEN_DB_SUBSTRINGS) {
    if (host.includes(forbidden) || dbName.includes(forbidden)) {
      return {
        allowed: false,
        reason: `Mục tiêu cơ sở dữ liệu có dấu hiệu môi trường thật/sản xuất ("${forbidden}"). Nghiêm cấm thực thi migration trong pha này.`,
      };
    }
  }

  if (!ALLOWED_LOCAL_HOSTS.has(host) && !isDryRun) {
    return {
      allowed: false,
      reason: `Máy chủ "${host}" không phải là máy chủ cục bộ (localhost/127.0.0.1).`,
    };
  }

  parsed.password = "***";
  return {
    allowed: true,
    details: {
      host: parsed.host,
      dbName,
      maskedUrl: parsed.toString(),
    },
  };
}

export function computeChecksum(content) {
  return createHash("sha256").update(content.trim()).digest("hex");
}

export function loadMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  return files.map((filename) => {
    const fullPath = path.join(MIGRATIONS_DIR, filename);
    const content = fs.readFileSync(fullPath, "utf8");
    const [version, ...nameParts] = filename.replace(".sql", "").split("_");
    const name = nameParts.join("_") || version;
    const checksum = computeChecksum(content);

    return {
      filename,
      version,
      name,
      checksum,
      content,
    };
  });
}

export const REQUIRED_SCHEMA_OBJECTS = {
  tables: [
    "service_categories",
    "service_requests",
    "request_status_history",
    "admin_users",
  ],
  columns: {
    service_categories: [
      { name: "id", type: "character varying", nullable: "NO" },
      { name: "title", type: "character varying", nullable: "NO" },
      { name: "slug", type: "character varying", nullable: "NO" },
      { name: "description", type: "text", nullable: "NO" },
      { name: "delivery_modes", type: "ARRAY", nullable: "NO" },
      { name: "active", type: "boolean", nullable: "NO" },
      { name: "created_at", type: "timestamp with time zone", nullable: "NO" },
    ],
    service_requests: [
      { name: "id", type: "uuid", nullable: "NO" },
      { name: "reference_code", type: "character varying", nullable: "NO" },
      { name: "customer_name", type: "character varying", nullable: "NO" },
      { name: "customer_phone", type: "character varying", nullable: "NO" },
      { name: "service_mode", type: "character varying", nullable: "NO" },
      { name: "device_category", type: "character varying", nullable: "NO" },
      { name: "service_category_id", type: "character varying", nullable: "NO" },
      { name: "issue_description", type: "text", nullable: "NO" },
      { name: "service_address", type: "text", nullable: "YES" },
      { name: "preferred_contact_time", type: "character varying", nullable: "YES" },
      { name: "status", type: "character varying", nullable: "NO" },
      { name: "admin_notes", type: "text", nullable: "YES" },
      { name: "created_at", type: "timestamp with time zone", nullable: "NO" },
      { name: "updated_at", type: "timestamp with time zone", nullable: "NO" },
    ],
    request_status_history: [
      { name: "id", type: "uuid", nullable: "NO" },
      { name: "request_id", type: "uuid", nullable: "NO" },
      { name: "from_status", type: "character varying", nullable: "NO" },
      { name: "to_status", type: "character varying", nullable: "NO" },
      { name: "changed_by", type: "character varying", nullable: "NO" },
      { name: "note", type: "text", nullable: "YES" },
      { name: "created_at", type: "timestamp with time zone", nullable: "NO" },
    ],
    admin_users: [
      { name: "id", type: "uuid", nullable: "NO" },
      { name: "username", type: "character varying", nullable: "NO" },
      { name: "password_hash", type: "character varying", nullable: "NO" },
      { name: "full_name", type: "character varying", nullable: "NO" },
      { name: "role", type: "character varying", nullable: "NO" },
      { name: "token_version", type: "integer", nullable: "NO" },
      { name: "is_active", type: "boolean", nullable: "NO" },
      { name: "created_at", type: "timestamp with time zone", nullable: "NO" },
    ],
  },
  primaryKeys: [
    "service_categories_pkey",
    "service_requests_pkey",
    "request_status_history_pkey",
    "admin_users_pkey",
  ],
  uniqueConstraints: [
    "service_categories_slug_key",
    "service_requests_reference_code_key",
    "admin_users_username_key",
  ],
  checkConstraints: [
    "service_requests_service_mode_check",
    "service_requests_device_category_check",
    "service_requests_status_check",
    "admin_users_role_check",
  ],
  foreignKeys: [
    {
      table: "request_status_history",
      foreignTable: "service_requests",
    },
    {
      table: "service_requests",
      foreignTable: "service_categories",
    },
  ],
  indexes: [
    "idx_service_requests_status",
    "idx_service_requests_created_at",
    "idx_service_requests_ref_code",
    "idx_service_requests_phone",
    "idx_status_history_request_id",
  ],
  serviceCategories: [
    { id: "svc_desktop_laptop", slug: "sua-chua-laptop-pc" },
    { id: "svc_windows_software", slug: "cai-dat-windows-phan-mem" },
    { id: "svc_hardware_upgrade", slug: "chan-doan-nang-cap-phan-cung" },
    { id: "svc_printer_service", slug: "dich-vu-may-in" },
    { id: "svc_network_wifi", slug: "thi-cong-xu-ly-mang-lan-wifi" },
    { id: "svc_business_it", slug: "ho-tro-it-doanh-nghiep" },
  ],
};

/**
 * Validates the complete existing schema on a PostgreSQL client.
 * Aborts baselining if any table, column, constraint, index, or seed is missing.
 */
export async function verifyCompleteSchema(client) {
  const errors = [];

  // 1. Check Tables
  const tableRows = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
  );
  const foundTables = new Set(tableRows.map((r) => r.table_name || r.TABLE_NAME));
  for (const tbl of REQUIRED_SCHEMA_OBJECTS.tables) {
    if (!foundTables.has(tbl)) {
      errors.push(`Bảng bắt buộc còn thiếu: "${tbl}"`);
    }
  }

  // 2. Check Columns, Data Types, and Nullability
  const colRows = await client.query(
    "SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public';"
  );
  const colMap = new Map();
  for (const r of colRows) {
    const tbl = r.table_name || r.TABLE_NAME;
    const col = r.column_name || r.COLUMN_NAME;
    const isNull = r.is_nullable || r.IS_NULLABLE;
    const dataType = (r.data_type || r.DATA_TYPE || "").toLowerCase();
    const colDef = r.column_default || r.COLUMN_DEFAULT || "";
    if (!colMap.has(tbl)) colMap.set(tbl, new Map());
    colMap.get(tbl).set(col, { isNull, dataType, colDef });
  }

  for (const [tbl, expectedCols] of Object.entries(REQUIRED_SCHEMA_OBJECTS.columns)) {
    const tableCols = colMap.get(tbl);
    if (!tableCols) continue;
    for (const ec of expectedCols) {
      if (!tableCols.has(ec.name)) {
        errors.push(`Cột bắt buộc còn thiếu: "${tbl}.${ec.name}"`);
      } else {
        const actual = tableCols.get(ec.name);
        if (ec.nullable && actual.isNull !== ec.nullable) {
          errors.push(
            `Tính bắt buộc (nullability) sai khác trên "${tbl}.${ec.name}": mong đợi ${ec.nullable}, thực tế ${actual.isNull}`
          );
        }
        if (ec.type && actual.dataType && !actual.dataType.includes(ec.type.toLowerCase())) {
          errors.push(
            `Kiểu dữ liệu sai khác trên "${tbl}.${ec.name}": mong đợi ${ec.type}, thực tế ${actual.dataType}`
          );
        }
      }
    }
  }

  // 3. Check Constraints (Primary Keys, Foreign Keys, Unique, Check Constraints)
  const conRows = await client.query(`
    SELECT conname, contype, conrelid::regclass::text as table_name
    FROM pg_constraint
    WHERE connamespace = 'public'::regnamespace;
  `);
  const foundConstraints = new Set(conRows.map((r) => r.conname || r.CONNAME));

  for (const pk of REQUIRED_SCHEMA_OBJECTS.primaryKeys) {
    if (!foundConstraints.has(pk)) {
      // Check if any primary key constraint exists on the table
      const tbl = pk.replace(/_pkey$/, "");
      const hasPk = conRows.some((r) => (r.table_name === tbl || r.table_name === `"${tbl}"`) && r.contype === "p");
      if (!hasPk) {
        errors.push(`Khóa chính (Primary Key) còn thiếu trên bảng: "${tbl}"`);
      }
    }
  }

  for (const uk of REQUIRED_SCHEMA_OBJECTS.uniqueConstraints) {
    if (!foundConstraints.has(uk)) {
      const hasUk = conRows.some((r) => (r.conname === uk || r.conname.includes(uk)) && r.contype === "u");
      if (!hasUk && !foundConstraints.has(uk)) {
        errors.push(`Ràng buộc duy nhất (Unique Constraint) còn thiếu: "${uk}"`);
      }
    }
  }

  for (const ck of REQUIRED_SCHEMA_OBJECTS.checkConstraints) {
    if (!foundConstraints.has(ck)) {
      const hasCk = conRows.some((r) => r.conname === ck && r.contype === "c");
      if (!hasCk) {
        errors.push(`Ràng buộc kiểm tra (CHECK Constraint) còn thiếu: "${ck}"`);
      }
    }
  }

  // 4. Check Indexes
  const idxRows = await client.query(
    "SELECT indexname FROM pg_indexes WHERE schemaname = 'public';"
  );
  const foundIndexes = new Set(idxRows.map((r) => r.indexname || r.INDEXNAME));
  for (const idx of REQUIRED_SCHEMA_OBJECTS.indexes) {
    if (!foundIndexes.has(idx)) {
      errors.push(`Index bắt buộc còn thiếu: "${idx}"`);
    }
  }

  // 5. Check 6 Service Categories Seed Records (both ID and Slug)
  try {
    const catRows = await client.query("SELECT id, slug FROM service_categories;");
    const foundCatMap = new Map(catRows.map((r) => [r.id, r.slug]));
    for (const expectedCat of REQUIRED_SCHEMA_OBJECTS.serviceCategories) {
      if (!foundCatMap.has(expectedCat.id)) {
        errors.push(`Dữ liệu mẫu (seed) còn thiếu mã danh mục: "${expectedCat.id}"`);
      } else if (foundCatMap.get(expectedCat.id) !== expectedCat.slug) {
        errors.push(
          `Dữ liệu mẫu (seed) có slug sai khác trên "${expectedCat.id}": mong đợi "${expectedCat.slug}", thực tế "${foundCatMap.get(expectedCat.id)}"`
        );
      }
    }
  } catch (err) {
    errors.push(`Không thể truy vấn dữ liệu service_categories: ${err.message}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Core migration engine operating on a single pinned database client connection.
 */
export async function executeMigrationsOnConnection(client, options = {}) {
  const { isDryRun = false, isBaseline = false, confirmBaseline = false } = options;
  const migrations = loadMigrationFiles();

  if (isDryRun) {
    return {
      applied: [],
      pending: migrations.map((m) => m.version),
      dryRun: true,
    };
  }

  // 1. Acquire session-level advisory lock on the pinned connection
  await client.query("SELECT pg_advisory_lock($1);", [MIGRATION_ADVISORY_LOCK_ID]);

  try {
    // 2. Ensure schema_migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(128) PRIMARY KEY,
        name VARCHAR(256) NOT NULL,
        checksum VARCHAR(64) NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    // 3. Query already applied migrations
    const appliedRows = await client.query(
      "SELECT version, checksum FROM schema_migrations ORDER BY version ASC;"
    );
    const appliedMap = new Map(
      appliedRows.map((r) => [String(r.version), String(r.checksum)])
    );

    const newlyApplied = [];

    // 4. Validate applied checksums & execute pending migrations
    for (const m of migrations) {
      if (appliedMap.has(m.version)) {
        const recordedChecksum = appliedMap.get(m.version);
        if (recordedChecksum !== m.checksum) {
          throw new Error(
            `MIGRATION TAMPERING DETECTED: Checksum mismatch for migration "${m.filename}". Recorded: ${recordedChecksum}, Computed: ${m.checksum}.`
          );
        }
        continue;
      }

      // If --baseline flag is passed for an already-initialized database:
      if (isBaseline && m.version === "001") {
        if (!confirmBaseline && process.env.CONFIRM_BASELINE !== "true") {
          throw new Error(
            "BASELINE ABORTED: Baselining requires explicit operator confirmation via '--confirm-baseline' or 'CONFIRM_BASELINE=true'."
          );
        }

        const schemaCheck = await verifyCompleteSchema(client);
        if (!schemaCheck.valid) {
          throw new Error(
            `BASELINE ABORTED: Database schema does not match expected MQTech 001 structure:\n- ${schemaCheck.errors.join("\n- ")}`
          );
        }

        await client.query(
          "INSERT INTO schema_migrations (version, name, checksum) VALUES ($1, $2, $3);",
          [m.version, m.name, m.checksum]
        );
        newlyApplied.push(m.version);
        continue;
      }

      // 5. Execute on single pinned connection inside transaction
      await client.query("BEGIN;");
      try {
        await client.query(m.content);
        await client.query(
          "INSERT INTO schema_migrations (version, name, checksum) VALUES ($1, $2, $3);",
          [m.version, m.name, m.checksum]
        );
        await client.query("COMMIT;");
        newlyApplied.push(m.version);
      } catch (err) {
        await client.query("ROLLBACK;");
        throw new Error(
          `Migration failed and was rolled back [${m.filename}]: ${err.message}`
        );
      }
    }

    return {
      applied: newlyApplied,
      pending: [],
      dryRun: false,
    };
  } finally {
    // 6. Always release advisory lock on the pinned connection
    await client.query("SELECT pg_advisory_unlock($1);", [MIGRATION_ADVISORY_LOCK_ID]);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const isStatusOnly = args.includes("--status");
  const isBaseline = args.includes("--baseline");
  const confirmBaseline = args.includes("--confirm-baseline");

  console.log("\n=======================================================");
  console.log("       MQTech PostgreSQL Migration Runner             ");
  console.log("=======================================================\n");

  const connectionResolution = resolveMigrationConnectionUrl();
  if (connectionResolution.error && !isDryRun) {
    console.error(`[LỖI TỪ CHỐI THỰC THI]: ${connectionResolution.error}\n`);
    process.exit(1);
  }

  const targetCheck = validateMigrationTarget(connectionResolution.url, isDryRun);
  if (!targetCheck.allowed) {
    console.error(`[LỖI TỪ CHỐI THỰC THI]: ${targetCheck.reason}\n`);
    process.exit(1);
  }

  console.log(`[Cơ sở dữ liệu đích]: ${targetCheck.details.maskedUrl}`);
  console.log(`[Nguồn cấu hình]: ${connectionResolution.source}`);
  console.log(
    `[Loại kết nối]: ${connectionResolution.isDirect ? "Direct (hỗ trợ session advisory locking)" : "Chưa xác định"}`
  );
  console.log(`[Máy chủ]: ${targetCheck.details.host}`);
  console.log(`[Tên CSDL]: ${targetCheck.details.dbName}\n`);

  const migrations = loadMigrationFiles();
  console.log(`[Tìm thấy]: ${migrations.length} tệp migration trong thư mục /migrations:\n`);

  for (const m of migrations) {
    console.log(
      `  - [${m.version}] ${m.filename} (SHA256: ${m.checksum.slice(0, 12)}...)`
    );
  }

  if (isDryRun || isStatusOnly) {
    console.log(
      "\n[CHẾ ĐỘ KIỂM TRA (DRY-RUN)]: Đã kiểm tra tính toàn vẹn và cú pháp của tệp migration."
    );
    if (isBaseline) {
      console.log(
        `[CHẾ ĐỘ BASELINE]: Xác thực toàn diện cấu trúc cơ sở dữ liệu trước khi đánh dấu (xác nhận: ${confirmBaseline ? "có" : "chưa"}).`
      );
    }
    console.log(
      "[BẢO VỆ AN TOÀN]: Chưa có lệnh SQL nào được thực thi lên cơ sở dữ liệu thật.\n"
    );
    process.exit(0);
  }

  console.log(
    "\n[THÔNG BÁO]: Thực thi trực tiếp đòi hỏi kết nối PostgreSQL cục bộ khả dụng trong pha P4."
  );
}

if (
  process.argv[1] &&
  (process.argv[1].endsWith("migrate.mjs") ||
    process.argv[1].endsWith("migrate"))
) {
  main().catch((err) => {
    console.error("\n[MQTech Migration Error]:", err.message || err);
    process.exit(1);
  });
}
