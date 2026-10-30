/**
 * MQTech PostgreSQL Restore Target Guard
 * 
 * Enforces fail-closed target validation before any restore operation:
 * 1. Rejects non-allowlisted / unknown hosts.
 * 2. Rejects targets without explicit disposable markers (_dev, _test, _disposable, _restore_test, mqtech_test).
 * 3. Rejects source and target resolving to the exact same database (self-clobbering prevention).
 * 4. Requires two-factor confirmation: CONFIRM_DESTRUCTIVE_RESTORE=true and matching CONFIRM_RESTORE_DB_NAME.
 */

const DEFAULT_APPROVED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
]);

const FORBIDDEN_KEYWORDS = [
  "prod",
  "production",
  "live",
  "openwebui",
  "fly.dev",
];

const DISPOSABLE_MARKERS = [
  "_dev",
  "_test",
  "_disposable",
  "_restore_test",
  "mqtech_test",
];

export function validateRestoreTarget(options = {}) {
  const {
    targetUrl,
    sourceUrl,
    confirmDestructiveRestore,
    confirmRestoreDbName,
    approvedHosts = DEFAULT_APPROVED_HOSTS,
  } = options;

  if (!targetUrl) {
    return {
      allowed: false,
      reason: "Thiếu TARGET_DATABASE_URL.",
    };
  }

  let parsedTarget;
  try {
    parsedTarget = new URL(targetUrl);
  } catch {
    return {
      allowed: false,
      reason: "TARGET_DATABASE_URL không đúng định dạng URL hợp lệ.",
    };
  }

  const targetHost = parsedTarget.hostname.toLowerCase();
  const targetPort = parsedTarget.port || "5432";
  const targetDbName = parsedTarget.pathname.replace(/^\//, "");

  if (!targetDbName) {
    return {
      allowed: false,
      reason: "TARGET_DATABASE_URL thiếu tên cơ sở dữ liệu.",
    };
  }

  // 1. Approved Host Allowlist
  const isHostApproved = approvedHosts.has(targetHost);
  if (!isHostApproved) {
    return {
      allowed: false,
      reason: `Máy chủ đích '${targetHost}' không nằm trong danh sách máy chủ an toàn được phép phục hồi.`,
    };
  }

  // 2. Keyword Blacklist Check (defense in depth)
  for (const kw of FORBIDDEN_KEYWORDS) {
    if (targetHost.includes(kw) || targetDbName.toLowerCase().includes(kw)) {
      return {
        allowed: false,
        reason: `Mục tiêu chứa từ khóa môi trường thật/sản xuất ('${kw}').`,
      };
    }
  }

  // 3. Disposable Database Marker Check
  const hasDisposableMarker = DISPOSABLE_MARKERS.some((m) =>
    targetDbName.toLowerCase().includes(m)
  );
  if (!hasDisposableMarker) {
    return {
      allowed: false,
      reason: `Tên CSDL đích '${targetDbName}' không chứa ký hiệu dùng một lần (${DISPOSABLE_MARKERS.join(", ")}).`,
    };
  }

  // 4. Source and Destination Identity Conflict
  if (sourceUrl) {
    try {
      const parsedSource = new URL(sourceUrl);
      const sourceHost = parsedSource.hostname.toLowerCase();
      const sourceDbName = parsedSource.pathname.replace(/^\//, "");

      if (sourceHost === targetHost && sourceDbName === targetDbName) {
        return {
          allowed: false,
          reason: `Cơ sở dữ liệu đích trùng khớp hoàn toàn với nguồn dữ liệu gốc (${targetHost}/${targetDbName}). Ngăn chặn tự ghi đè.`,
        };
      }
    } catch {
      // Ignore source parse errors
    }
  }

  // 5. Explicit Destructive Confirmation Flag
  if (confirmDestructiveRestore !== true && confirmDestructiveRestore !== "true") {
    return {
      allowed: false,
      reason: "Yêu cầu đặt biến môi trường CONFIRM_DESTRUCTIVE_RESTORE=true.",
    };
  }

  // 6. Explicit Matching Database Name Confirmation
  if (confirmRestoreDbName !== targetDbName) {
    return {
      allowed: false,
      reason: `Tên xác nhận ('${confirmRestoreDbName}') không khớp với tên CSDL đích ('${targetDbName}').`,
    };
  }

  parsedTarget.password = "***";

  return {
    allowed: true,
    details: {
      host: targetHost,
      port: targetPort,
      dbName: targetDbName,
      maskedUrl: parsedTarget.toString(),
    },
  };
}

// CLI runner if invoked directly by scripts/restore.sh
if (
  process.argv[1] &&
  (process.argv[1].endsWith("restore-guard.mjs") ||
    process.argv[1].endsWith("restore-guard"))
) {
  const result = validateRestoreTarget({
    targetUrl: process.env.TARGET_DATABASE_URL,
    sourceUrl: process.env.SOURCE_DATABASE_URL,
    confirmDestructiveRestore: process.env.CONFIRM_DESTRUCTIVE_RESTORE,
    confirmRestoreDbName: process.env.CONFIRM_RESTORE_DB_NAME,
  });

  if (!result.allowed) {
    console.error(`[TỪ CHỐI BẢO MẬT]: ${result.reason}`);
    process.exit(1);
  }

  console.log(JSON.stringify(result.details));
  process.exit(0);
}
