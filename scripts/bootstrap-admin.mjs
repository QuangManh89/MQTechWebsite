/**
 * MQTech Initial Administrator Account Bootstrapper
 * 
 * Secure interactive utility to initialize or update administrative accounts.
 * Security controls:
 * - Passwords are NEVER accepted as command-line arguments (prevents shell history and process inspection exposure).
 * - Passwords are NEVER hardcoded.
 * - Password input is masked in the terminal.
 * - Target database verification: permits ONLY authorized local/disposable targets in this phase.
 * - Rejects remote, cloud, or production-like database targets even if --dev is passed.
 * - Confirms existing account status before modifications.
 * 
 * Usage:
 *   node scripts/bootstrap-admin.mjs [username] [--dev]
 * 
 * Non-interactive / CI usage:
 *   ADMIN_INIT_PASSWORD="<secure-password>" node scripts/bootstrap-admin.mjs [username] [--dev]
 */
import readline from "node:readline";
import { hashPassword } from "../src/lib/auth/password.ts";
import { adminService } from "../src/lib/auth/admin-service.ts";
import { getAppConfig } from "../src/lib/env.ts";

const ALLOWED_LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
]);

const FORBIDDEN_DB_SUBSTRINGS = [
  "prod",
  "production",
  "live",
  "openwebui",
  "fly.dev",
];

export function validateBootstrapTarget(
  databaseUrl,
  isDevFlag,
  isProduction
) {
  // 1. If DATABASE_URL is configured, rigorously validate host and database name
  if (databaseUrl) {
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

    // Check for forbidden production keywords in hostname or db name
    for (const forbidden of FORBIDDEN_DB_SUBSTRINGS) {
      if (host.includes(forbidden) || dbName.includes(forbidden)) {
        return {
          allowed: false,
          reason: `Phát hiện mục tiêu cơ sở dữ liệu có dấu hiệu môi trường thật/sản xuất ("${forbidden}"). Nghiêm cấm thực thi trong pha P4.`,
        };
      }
    }

    // Permit ONLY authorized local development hosts in this phase
    if (!ALLOWED_LOCAL_HOSTS.has(host)) {
      return {
        allowed: false,
        reason: `Máy chủ cơ sở dữ liệu "${host}" không phải là máy chủ cục bộ (localhost/127.0.0.1). Trong pha này, chỉ cho phép kết nối cơ sở dữ liệu phát triển cục bộ.`,
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

  // 2. If DATABASE_URL is omitted:
  if (isProduction) {
    return {
      allowed: false,
      reason:
        "Trong môi trường sản xuất, bắt buộc phải có DATABASE_URL hợp lệ. Không được phép chạy khởi tạo trên bộ nhớ tạm.",
    };
  }

  if (!isDevFlag) {
    return {
      allowed: false,
      reason:
        "Chưa thiết lập DATABASE_URL. Để thực thi với bộ nhớ phát triển cục bộ (In-Memory Development Store), bắt buộc phải truyền cờ '--dev'.",
    };
  }

  return {
    allowed: true,
    details: {
      host: "in-memory-dev",
      dbName: "volatile",
      maskedUrl: "In-Memory Development Store",
    },
  };
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

function askSecret(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (!process.stdin.isTTY) {
      rl.question(query, (ans) => {
        rl.close();
        resolve(ans.trim());
      });
      return;
    }

    process.stdout.write(query);
    let secret = "";
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    if (stdin.setRawMode) stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const onData = (char) => {
      if (char === "\n" || char === "\r" || char === "\u0004") {
        stdin.removeListener("data", onData);
        if (stdin.setRawMode) stdin.setRawMode(wasRaw || false);
        stdin.pause();
        rl.close();
        process.stdout.write("\n");
        resolve(secret);
      } else if (char === "\u0003") {
        process.exit(1);
      } else if (char === "\u007f" || char === "\b") {
        if (secret.length > 0) {
          secret = secret.slice(0, -1);
          process.stdout.write("\b \b");
        }
      } else {
        secret += char;
        process.stdout.write("*");
      }
    };

    stdin.on("data", onData);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const isDevFlag = args.includes("--dev");
  const positionalArgs = args.filter((a) => !a.startsWith("--"));

  // Security Check 1: Deny passwords passed as CLI arguments
  if (positionalArgs.length > 1) {
    console.error(
      "\n[BẢO MẬT] LỖI: Không truyền mật khẩu qua tham số dòng lệnh (CLI argument)!"
    );
    console.error(
      "Việc này khiến mật khẩu bị lưu trữ trong lịch sử shell và danh sách tiến trình hệ điều hành."
    );
    console.error(
      "Cách dùng an toàn: node scripts/bootstrap-admin.mjs [username] [--dev]\n"
    );
    process.exit(1);
  }

  const username = positionalArgs[0] || process.env.ADMIN_INIT_USERNAME || "admin";
  const config = getAppConfig();

  console.log("\n=======================================================");
  console.log("       MQTech Administrator Account Bootstrapper       ");
  console.log("=======================================================\n");

  // Security Check 2: Strict Target Verification
  const targetCheck = validateBootstrapTarget(
    config.databaseUrl,
    isDevFlag,
    config.isProduction
  );

  if (!targetCheck.allowed) {
    console.error(`\n[LỖI TỪ CHỐI THỰC THI]: ${targetCheck.reason}\n`);
    process.exit(1);
  }

  console.log(`[Cơ sở dữ liệu đích]: ${targetCheck.details.maskedUrl}`);
  console.log(`[Máy chủ]: ${targetCheck.details.host}`);
  console.log(`[Tên CSDL]: ${targetCheck.details.dbName}\n`);

  // Security Check 3: Check Existing Account Status
  const existingUser = await adminService.findByUsername(username);
  if (existingUser) {
    console.log(`[Thông báo]: Tài khoản quản trị "${username}" ĐÃ TỒN TẠI.`);
    const confirmUpdate = await askQuestion(
      "Bạn có muốn cập nhật lại mật khẩu cho tài khoản này không? (y/N): "
    );
    if (confirmUpdate.toLowerCase() !== "y") {
      console.log("[Hủy bỏ]: Giữ nguyên tài khoản hiện tại. Kết thúc an toàn.\n");
      process.exit(0);
    }
  } else {
    console.log(`[Khởi tạo]: Tiến hành tạo mới tài khoản quản trị "${username}".`);
  }

  // Security Check 4: Password Collection via Masked Input or Environment Variable
  let password = process.env.ADMIN_INIT_PASSWORD;
  if (!password) {
    password = await askSecret(`Nhập mật khẩu cho tài khoản [${username}]: `);
    const confirm = await askSecret("Xác nhận lại mật khẩu: ");
    if (password !== confirm) {
      console.error("\n[LỖI]: Mật khẩu xác nhận không khớp!");
      process.exit(1);
    }
  }

  // Security Check 5: Password Complexity
  if (!password || password.length < 10) {
    console.error("\n[LỖI]: Mật khẩu quản trị phải có ít nhất 10 ký tự!");
    process.exit(1);
  }
  if (
    password.toLowerCase() === username.toLowerCase() ||
    password === "MQTechAdmin2026!"
  ) {
    console.error("\n[LỖI]: Mật khẩu quá yếu hoặc sử dụng mật khẩu mẫu mặc định!");
    process.exit(1);
  }

  await hashPassword(password);

  process.env.ADMIN_INIT_USERNAME = username;
  process.env.ADMIN_INIT_PASSWORD = password;

  await adminService.ensureInitialAdmin();

  console.log(
    `\n[THÀNH CÔNG]: Tài khoản quản trị "${username}" đã được khởi tạo/xác thực an toàn.`
  );
  console.log(
    `[Bảo mật]: Khóa scrypt (64 bytes, 16-byte salt) được tạo thành công.\n`
  );
}

// Only execute main if invoked directly from CLI
if (
  process.argv[1] &&
  (process.argv[1].endsWith("bootstrap-admin.mjs") ||
    process.argv[1].endsWith("bootstrap-admin"))
) {
  main().catch((err) => {
    console.error("\n[MQTech Bootstrap Error]:", err.message || err);
    process.exit(1);
  });
}
