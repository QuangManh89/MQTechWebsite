/**
 * MQTech PostgreSQL Restore Target Guard (P4.1.4)
 * 
 * Enforces fail-closed target identity validation before any restore operation:
 * 1. An explicitly approved destination host and database identity.
 * 2. Strict host allowlist (strictly local loopback interfaces).
 * 3. Rejection of production/live environment keywords.
 * 4. Disposable database name marker requirement (_dev, _test, _disposable, etc.).
 * 5. Explicit source identity and self-clobbering prevention (source !== destination).
 * 6. Database server identity verification hook when available.
 * 7. Exact two-factor operator confirmation:
 *    - CONFIRM_DESTRUCTIVE_RESTORE=true
 *    - CONFIRM_RESTORE_DB_NAME="<exact_target_db_name>"
 * 
 * IMPORTANT OPERATIONAL BOUNDARY ON TUNNELS & PROXIES:
 * "localhost" DOES NOT guarantee the database is physically local.
 * An SSH tunnel (e.g., ssh -L 5432:remote-db:5432) or local proxy forwarder (e.g., fly proxy 5432)
 * exposes a remote database over localhost. Therefore, hostname checks alone are INSUFFICIENT.
 * The system requires defense-in-depth: disposable name markers, explicit expected identity,
 * source conflict rejection, and exact operator confirmation. Confirmation flags can NEVER
 * override failed identity checks.
 */

export const DEFAULT_APPROVED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
]);

export const FORBIDDEN_KEYWORDS = [
  "prod",
  "production",
  "live",
  "openwebui",
  "fly.dev",
];

export const DISPOSABLE_MARKERS = [
  "_dev",
  "_test",
  "_disposable",
  "_restore_test",
  "mqtech_test",
];

export function validateRestoreTarget(options = {}) {
  const {
    targetUrl,
    sourceUrl = process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL,
    confirmDestructiveRestore = process.env.CONFIRM_DESTRUCTIVE_RESTORE,
    confirmRestoreDbName = process.env.CONFIRM_RESTORE_DB_NAME,
    expectedHost = process.env.EXPECTED_RESTORE_HOST,
    expectedDbName = process.env.EXPECTED_RESTORE_DB_NAME,
    expectedSystemIdentifier = process.env.EXPECTED_SYSTEM_IDENTIFIER,
    serverIdentifier,
    approvedHosts = DEFAULT_APPROVED_HOSTS,
  } = options;

  // 1. Target URL Existence & Syntax Validation
  if (!targetUrl || typeof targetUrl !== "string") {
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

  if (parsedTarget.protocol !== "postgres:" && parsedTarget.protocol !== "postgresql:") {
    return {
      allowed: false,
      reason: `Giao thức không được hỗ trợ: ${parsedTarget.protocol}. Chỉ chấp nhận postgresql://.`,
    };
  }

  const targetHost = parsedTarget.hostname.toLowerCase();
  const targetPort = parsedTarget.port || "5432";
  const targetDbName = parsedTarget.pathname.replace(/^\//, "");

  if (!targetDbName) {
    return {
      allowed: false,
      reason: "TARGET_DATABASE_URL thiếu tên cơ sở dữ liệu đích.",
    };
  }

  // 2. Approved Host Allowlist (Loopback only)
  const isHostApproved = approvedHosts.has(targetHost);
  if (!isHostApproved) {
    return {
      allowed: false,
      reason: `Máy chủ đích '${targetHost}' không nằm trong danh sách máy chủ an toàn được phép phục hồi.`,
    };
  }

  // 3. Explicit Expected Destination Identity (if specified)
  if (expectedHost && targetHost !== expectedHost.toLowerCase()) {
    return {
      allowed: false,
      reason: `Máy chủ đích thực tế '${targetHost}' không khớp với máy chủ kỳ vọng '${expectedHost}'.`,
    };
  }

  if (expectedDbName && targetDbName !== expectedDbName) {
    return {
      allowed: false,
      reason: `Tên CSDL đích '${targetDbName}' không khớp với tên CSDL kỳ vọng '${expectedDbName}'.`,
    };
  }

  // 4. Keyword Blacklist Check (Defense-in-depth against accidental production targeting)
  for (const kw of FORBIDDEN_KEYWORDS) {
    if (targetHost.includes(kw) || targetDbName.toLowerCase().includes(kw)) {
      return {
        allowed: false,
        reason: `Mục tiêu chứa từ khóa môi trường thật/sản xuất ('${kw}').`,
      };
    }
  }

  // 5. Disposable Database Marker Check
  // Note: Markers are necessary but NOT sufficient proof of safety.
  const hasDisposableMarker = DISPOSABLE_MARKERS.some((m) =>
    targetDbName.toLowerCase().includes(m)
  );
  if (!hasDisposableMarker) {
    return {
      allowed: false,
      reason: `Tên CSDL đích '${targetDbName}' không chứa ký hiệu dùng một lần (${DISPOSABLE_MARKERS.join(", ")}).`,
    };
  }

  // 6. Explicit Source Identity & Self-Clobbering Prevention
  if (sourceUrl) {
    let parsedSource;
    try {
      parsedSource = new URL(sourceUrl);
    } catch {
      return {
        allowed: false,
        reason: "SOURCE_DATABASE_URL được cung cấp nhưng không đúng định dạng URL hợp lệ.",
      };
    }

    const sourceHost = parsedSource.hostname.toLowerCase();
    const sourcePort = parsedSource.port || "5432";
    const sourceDbName = parsedSource.pathname.replace(/^\//, "");

    if (
      sourceHost === targetHost &&
      sourcePort === targetPort &&
      sourceDbName === targetDbName
    ) {
      return {
        allowed: false,
        reason: `Cơ sở dữ liệu đích trùng khớp hoàn toàn với nguồn dữ liệu gốc (${targetHost}:${targetPort}/${targetDbName}). Ngăn chặn tự ghi đè hủy diệt.`,
      };
    }
  }

  // 7. Database Server Identity Verification (when available)
  if (expectedSystemIdentifier) {
    if (!serverIdentifier) {
      return {
        allowed: false,
        reason: `Yêu cầu xác minh danh tính hệ thống máy chủ (System Identifier: '${expectedSystemIdentifier}') nhưng không lấy được định danh thực tế.`,
      };
    }
    if (serverIdentifier !== expectedSystemIdentifier) {
      return {
        allowed: false,
        reason: `Định danh hệ thống máy chủ đích ('${serverIdentifier}') không khớp với định danh kỳ vọng ('${expectedSystemIdentifier}').`,
      };
    }
  }

  // 8. Exact Operator Confirmation
  // Critical: Confirmation flags alone can NEVER override failed identity validation above.
  if (confirmDestructiveRestore !== true && confirmDestructiveRestore !== "true") {
    return {
      allowed: false,
      reason: "Yêu cầu đặt biến môi trường CONFIRM_DESTRUCTIVE_RESTORE=true.",
    };
  }

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
    expectedHost: process.env.EXPECTED_RESTORE_HOST,
    expectedDbName: process.env.EXPECTED_RESTORE_DB_NAME,
    expectedSystemIdentifier: process.env.EXPECTED_SYSTEM_IDENTIFIER,
  });

  if (!result.allowed) {
    console.error(`[TỪ CHỐI BẢO MẬT]: ${result.reason}`);
    process.exit(1);
  }

  console.log(JSON.stringify(result.details));
  process.exit(0);
}
