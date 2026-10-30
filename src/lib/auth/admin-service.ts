import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "./password.ts";
import { db } from "../db/client.ts";
import type { AdminUser } from "../db/types.ts";
import { InMemoryRateLimiter } from "../utils/rate-limiter.ts";

export const adminLoginLimiter = new InMemoryRateLimiter(5, 15);

declare global {
  var __mqtechAdminStore: Map<string, AdminUser> | undefined;
}

if (!globalThis.__mqtechAdminStore) {
  globalThis.__mqtechAdminStore = new Map();
}

const adminStore = globalThis.__mqtechAdminStore;

export class AdminService {
  private bootstrapped = false;

  /**
   * Initializes the initial administrator account securely.
   * If an admin account does not exist, it bootstraps the initial admin.
   */
  async ensureInitialAdmin(): Promise<void> {
    if (this.bootstrapped && adminStore.size > 0) return;

    const username = process.env.ADMIN_INIT_USERNAME || "admin";
    const initialPassword =
      process.env.ADMIN_INIT_PASSWORD || "MQTechAdmin2026!";

    // Check if admin already exists
    const existing = await this.findByUsername(username);
    if (!existing) {
      const passwordHash = await hashPassword(initialPassword);
      const initialAdmin: AdminUser = {
        id: randomUUID(),
        username,
        passwordHash,
        fullName: "Quản Trị Viên MQTech",
        role: "ADMIN",
        createdAt: new Date(),
      };

      if (db.isConfigured) {
        try {
          await db.query(
            `INSERT INTO admin_users (id, username, password_hash, full_name, role, created_at)
             VALUES ($1, $2, $3, $4, $5, $6);`,
            [
              initialAdmin.id,
              initialAdmin.username,
              initialAdmin.passwordHash,
              initialAdmin.fullName,
              initialAdmin.role,
              initialAdmin.createdAt,
            ]
          );
        } catch (err) {
          console.warn("PostgreSQL admin insert failed, using fallback:", err);
        }
      }

      adminStore.set(username, initialAdmin);
    }

    this.bootstrapped = true;
  }

  async findByUsername(username: string): Promise<AdminUser | null> {
    const normalized = username.toLowerCase().trim();

    if (db.isConfigured) {
      try {
        const rows = await db.query<Record<string, unknown>>(
          "SELECT * FROM admin_users WHERE username = $1 LIMIT 1;",
          [normalized]
        );
        if (rows.length > 0) {
          const row = rows[0];
          return {
            id: String(row.id),
            username: String(row.username),
            passwordHash: String(row.password_hash),
            fullName: String(row.full_name),
            role: row.role as "ADMIN" | "STAFF",
            createdAt: new Date(String(row.created_at)),
          };
        }
      } catch (err) {
        console.warn("PostgreSQL admin query failed:", err);
      }
    }

    return adminStore.get(normalized) || null;
  }

  /**
   * Authenticates administrator credentials.
   * Never leaks whether the username exists versus an incorrect password.
   */
  async authenticate(
    username: string,
    password: string
  ): Promise<{ username: string; fullName: string; role: "ADMIN" | "STAFF" } | null> {
    await this.ensureInitialAdmin();

    const user = await this.findByUsername(username);
    if (!user) {
      // Run dummy hash check to prevent timing attacks
      await verifyPassword("dummy", "00000000000000000000000000000000:0000");
      return null;
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return {
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };
  }

  clearDevStore(): void {
    adminStore.clear();
    this.bootstrapped = false;
  }
}

export const adminService = new AdminService();
