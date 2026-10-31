/**
 * MQTech PostgreSQL Credential Helper
 * 
 * Generates secure libpq connection configuration files (pg_service.conf / .pgpass)
 * with restrictive file permissions (0600) inside private temporary directories (0700).
 * Prevents exposing database credentials or connection strings in process command-line arguments.
 */

import fs from "node:fs";
import path from "node:path";

export function parseDatabaseUrl(rawUrl) {
  if (!rawUrl) {
    throw new Error("Missing database connection URL.");
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid PostgreSQL connection URL.");
  }

  const host = parsed.hostname || "localhost";
  const port = parsed.port || "5432";
  const dbname = parsed.pathname.replace(/^\//, "");
  const user = decodeURIComponent(parsed.username || "postgres");
  const password = decodeURIComponent(parsed.password || "");

  if (!dbname) {
    throw new Error("Database connection URL is missing the database name.");
  }

  return {
    host,
    port,
    dbname,
    user,
    password,
  };
}

export function buildPgServiceConfig({ databaseUrl, serviceName = "mqtech_service" }) {
  const { host, port, dbname, user, password } = parseDatabaseUrl(databaseUrl);

  const lines = [
    `[${serviceName}]`,
    `host=${host}`,
    `port=${port}`,
    `dbname=${dbname}`,
    `user=${user}`,
  ];

  if (password) {
    lines.push(`password=${password}`);
  }

  return lines.join("\n") + "\n";
}

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

export function buildPgPassEntry({ databaseUrl }) {
  const { host, port, dbname, user, password } = parseDatabaseUrl(databaseUrl);
  // Format: hostname:port:database:username:password
  return `${host}:${port}:${dbname}:${user}:${password}\n`;
}

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
 * Ensures zero credentials or connection URLs are present in process argv.
 */
export function getSafeDumpArgs({ serviceName, filePath }) {
  return [
    `--service=${serviceName}`,
    "--format=c",
    "--no-owner",
    "--no-privileges",
    `--file=${filePath}`,
  ];
}

export function getSafeRestoreArgs({ serviceName, backupFilePath }) {
  return [
    `--service=${serviceName}`,
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
