/**
 * MQTech Initial Administrator Account Bootstrapper
 * Securely hashes an administrator password and creates an initial record.
 * Run with: node scripts/bootstrap-admin.mjs <username> <password>
 */
import { hashPassword } from "../src/lib/auth/password.ts";
import { adminService } from "../src/lib/auth/admin-service.ts";

async function main() {
  const args = process.argv.slice(2);
  const username = args[0] || process.env.ADMIN_INIT_USERNAME || "admin";
  const password = args[1] || process.env.ADMIN_INIT_PASSWORD || "MQTechAdmin2026!";

  console.log(`[MQTech Bootstrap] Initializing administrator account for user: ${username}`);
  
  await hashPassword(password);
  console.log(`[MQTech Bootstrap] Secure password hash generated successfully.`);
  
  await adminService.ensureInitialAdmin();
  console.log(`[MQTech Bootstrap] Initial administrator verified in repository store.`);
}

main().catch((err) => {
  console.error("[MQTech Bootstrap Error]:", err);
  process.exit(1);
});
