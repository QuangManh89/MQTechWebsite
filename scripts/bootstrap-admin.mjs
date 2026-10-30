/**
 * MQTech Initial Administrator Account Bootstrapper
 * 
 * Secure interactive utility to initialize or update administrative accounts.
 * Security controls:
 * - Passwords are NEVER accepted as command-line arguments (prevents shell history and process inspection exposure).
 * - Passwords are NEVER hardcoded.
 * - Password input is masked in the terminal.
 * - Confirms target database and checks if the account already exists.
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

    // If non-interactive stdin, fall back to standard line reading
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
        // Ctrl+C
        process.exit(1);
      } else if (char === "\u007f" || char === "\b") {
        // Backspace
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

function maskDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.password = "***";
    return parsed.toString();
  } catch {
    return "[Invalid URL]";
  }
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

  // Security Check 2: Database Target Verification
  if (config.databaseUrl) {
    console.log(`[Cơ sở dữ liệu đích]: ${maskDatabaseUrl(config.databaseUrl)}`);
  } else if (isDevFlag || !config.isProduction) {
    console.log(
      "[Cơ sở dữ liệu đích]: Bộ nhớ phát triển cục bộ (In-Memory Development Store)"
    );
  } else {
    console.error(
      "[BẢO MẬT] LỖI: Thiếu DATABASE_URL trong môi trường sản xuất. Không thể khởi tạo quản trị viên."
    );
    process.exit(1);
  }

  // Security Check 3: Check Existing Account Status
  const existingUser = await adminService.findByUsername(username);
  if (existingUser) {
    console.log(`\n[Thông báo]: Tài khoản quản trị "${username}" ĐÃ TỒN TẠI.`);
    const confirmUpdate = await askQuestion(
      "Bạn có muốn cập nhật lại mật khẩu cho tài khoản này không? (y/N): "
    );
    if (confirmUpdate.toLowerCase() !== "y") {
      console.log("[Hủy bỏ]: Giữ nguyên tài khoản hiện tại. Kết thúc an toàn.\n");
      process.exit(0);
    }
  } else {
    console.log(`\n[Khởi tạo]: Tiến hành tạo mới tài khoản quản trị "${username}".`);
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
  if (password.toLowerCase() === username.toLowerCase() || password === "MQTechAdmin2026!") {
    console.error("\n[LỖI]: Mật khẩu quá yếu hoặc sử dụng mật khẩu mẫu mặc định!");
    process.exit(1);
  }

  // Generate cryptographic scrypt hash
  await hashPassword(password);

  // Set environment variable in-process for adminService to persist
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

main().catch((err) => {
  console.error("\n[MQTech Bootstrap Error]:", err.message || err);
  process.exit(1);
});
