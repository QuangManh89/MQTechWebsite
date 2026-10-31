/**
 * MQTech PostgreSQL Credential Helper
 * 
 * Generates secure libpq connection configuration files (pg_service.conf / .pgpass)
 * with restrictive file permissions (0600) inside private temporary directories (0700).
 * Prevents exposing database credentials or connection strings in process command-line arguments.
 * 
 * Supports standard PostgreSQL libpq connection service file format:
 * https://www.postgresql.org/docs/current/libpq-pgservice.html
 * 
 * PostgreSQL client tools (pg_dump, pg_restore, psql) invoke services using:
 * - Environment variable: PGSERVICEFILE and PGSERVICE
 * - Connection keyword: --dbname="service=<service_name>" (or -d "service=<service_name>")
 * Note: pg_dump and pg_restore do NOT have a standalone "--service" CLI flag.
 */

import fs from "node:fs";
import path from "node:path";

/**
 * Validates service name against INI injection.
 * Only allows alphanumeric characters, underscores, and hyphens.
 */
export function validateServiceName(serviceName) {
  if (!serviceName || typeof serviceName !== "string") {
    throw new Error("Tên dịch vụ (serviceName) không được để trống.");
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(serviceName)) {
    throw new Error(
      `Tên dịch vụ không hợp lệ: "${serviceName}". Chỉ chấp nhận ký tự chữ, số, gạch dưới và gạch ngang (ngăn chặn INI section injection).`
    );
  }
  return serviceName;
}

/**
 * Escapes and quotes parameter values for pg_service.conf INI format.
 * In libpq pg_service.conf:
 * - Values with spaces or special characters can be enclosed in quotes.
 * - Newlines (\r, \n) are strictly forbidden to prevent parameter/section injection.
 */
export function escapeIniValue(val) {
  if (val === undefined || val === null) {
    return "";
  }
  const str = String(val);

  // Strictly forbid newlines to prevent INI line/section injection
  if (/[\r\n]/.test(str)) {
    throw new Error("Phát hiện ký tự xuống dòng (newline) trong thông tin kết nối CSDL. Ngăn chặn INI injection.");
  }

  // If the value contains spaces, quotes, hash (#), semicolon (;), or equals (=), quote it safely
  const needsQuotes = /[\s#;="']/.test(str) || str.startsWith(" ") || str.endsWith(" ");
  if (!needsQuotes) {
    return str;
  }

  // Prefer single quotes if string contains double quotes; otherwise double quotes
  if (str.includes('"') && !str.includes("'")) {
    return `'${str}'`;
  }
  if (str.includes("'") && !str.includes('"')) {
    return `"${str}"`;
  }
  // If it contains both, quote with double quotes and escape internal double quotes if needed, or single quotes
  // Libpq parses single or double quotes around the whole value
  return `"${str.replace(/"/g, '\\"')}"`;
}

/**
 * Parses and validates PostgreSQL connection URL with robust percent-decoding.
 */
export function parseDatabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new Error("Missing database connection URL.");
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid PostgreSQL connection URL.");
  }

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error(`Unsupported database protocol: ${parsed.protocol}`);
  }

  const host = parsed.hostname || "localhost";
  const port = parsed.port || "5432";

  // Decode URI components safely
  let dbname = "";
  let user = "";
  let password = "";

  try {
    dbname = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    user = decodeURIComponent(parsed.username || "postgres");
    password = decodeURIComponent(parsed.password || "");
  } catch {
    throw new Error("Malformed percent-encoded credentials in database URL.");
  }

  if (!dbname) {
    throw new Error("Database connection URL is missing the database name.");
  }

  // Prevent injection in host or port
  if (/[\r\n]/.test(host) || /[\r\n]/.test(port)) {
    throw new Error("Invalid host or port containing newline characters.");
  }

  return {
    host,
    port,
    dbname,
    user,
    password,
  };
}

/**
 * Builds standard libpq pg_service.conf INI content.
 */
export function buildPgServiceConfig({ databaseUrl, serviceName = "mqtech_service" }) {
  const safeServiceName = validateServiceName(serviceName);
  const { host, port, dbname, user, password } = parseDatabaseUrl(databaseUrl);

  const lines = [
    `[${safeServiceName}]`,
    `host=${escapeIniValue(host)}`,
    `port=${escapeIniValue(port)}`,
    `dbname=${escapeIniValue(dbname)}`,
    `user=${escapeIniValue(user)}`,
  ];

  if (password !== "") {
    lines.push(`password=${escapeIniValue(password)}`);
  }

  return lines.join("\n") + "\n";
}

/**
 * Writes secure pg_service.conf with 0600 mode in a 0700 private directory.
 */
export function writeSecurePgServiceFile({
  databaseUrl,
  serviceName = "mqtech_service",
  outputFilePath,
}) {
  const configContent = buildPgServiceConfig({ databaseUrl, serviceName });
  const dir = path.dirname(outputFilePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }

  // Write with restrictive permissions (0600)
  fs.writeFileSync(outputFilePath, configContent, { mode: 0o600, encoding: "utf8" });

  try {
    fs.chmodSync(outputFilePath, 0o600);
  } catch {
    // Windows permissions fallback
  }

  return {
    serviceName,
    outputFilePath,
  };
}

/**
 * Builds .pgpass format entry:
 * hostname:port:database:username:password
 */
export function buildPgPassEntry({ databaseUrl }) {
  const { host, port, dbname, user, password } = parseDatabaseUrl(databaseUrl);
  // In .pgpass, colons and backslashes in fields must be escaped with a backslash
  const escapePgPass = (s) => s.replace(/\\/g, "\\\\").replace(/:/g, "\\:");
  return `${escapePgPass(host)}:${escapePgPass(port)}:${escapePgPass(dbname)}:${escapePgPass(user)}:${escapePgPass(password)}\n`;
}

/**
 * Writes secure .pgpass file with 0600 mode in a 0700 private directory.
 */
export function writeSecurePgPassFile({ databaseUrl, outputFilePath }) {
  const passContent = buildPgPassEntry({ databaseUrl });
  const dir = path.dirname(outputFilePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }

  fs.writeFileSync(outputFilePath, passContent, { mode: 0o600, encoding: "utf8" });

  try {
    fs.chmodSync(outputFilePath, 0o600);
  } catch {
    // Windows fallback
  }

  return outputFilePath;
}

/**
 * Returns safe command-line arguments for pg_dump and pg_restore.
 * 
 * IMPORTANT POSTGRESQL CLI RULES:
 * - pg_dump and pg_restore DO NOT support a "--service" command-line option.
 * - Service selection is achieved via:
 *   1. Environment variable PGSERVICEFILE pointing to the private config.
 *   2. Connection specification: --dbname="service=<service_name>"
 *   3. Unattended mode flag: --no-password (-w) to fail immediately if auth fails.
 * - Ensures ZERO credentials, passwords, or raw connection URLs are present in process argv.
 */
export function getSafeDumpArgs({ serviceName, filePath }) {
  const safeServiceName = validateServiceName(serviceName);
  return [
    `--dbname=service=${safeServiceName}`,
    "--no-password",
    "--format=c",
    "--no-owner",
    "--no-privileges",
    `--file=${filePath}`,
  ];
}

export function getSafeRestoreArgs({ serviceName, backupFilePath }) {
  const safeServiceName = validateServiceName(serviceName);
  return [
    `--dbname=service=${safeServiceName}`,
    "--no-password",
    "--clean",
    "--if-exists",
    "--no-owner",
    "--no-privileges",
    backupFilePath,
  ];
}

// CLI runner if invoked by shell scripts
if (
  process.argv[1] &&
  (process.argv[1].endsWith("credential-helper.mjs") ||
    process.argv[1].endsWith("credential-helper"))
) {
  const action = process.argv[2];
  const serviceName = process.argv[3] || "mqtech_service";
  const outputPath = process.argv[4];

  if (action === "write-service") {
    const rawUrl =
      process.env.TARGET_DATABASE_URL ||
      process.env.DATABASE_URL ||
      process.env.MIGRATION_DATABASE_URL;

    if (!rawUrl) {
      console.error("[CREDENTIAL ERROR]: No database URL provided in environment.");
      process.exit(1);
    }

    if (!outputPath) {
      console.error("[CREDENTIAL ERROR]: No output path specified.");
      process.exit(1);
    }

    try {
      writeSecurePgServiceFile({
        databaseUrl: rawUrl,
        serviceName,
        outputFilePath: outputPath,
      });
      console.log(`[CREDENTIAL SUCCESS]: Wrote secure service file for [${serviceName}]`);
      process.exit(0);
    } catch (err) {
      console.error(`[CREDENTIAL ERROR]: ${err.message}`);
      process.exit(1);
    }
  }
}
