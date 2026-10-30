import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "./password.ts";
import { db } from "../db/client.ts";
import type { AdminUser } from "../db/types.ts";
import { InMemoryRateLimiter } from "../utils/rate-limiter.ts";
import { getAppConfig } from "../env.ts";

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
   * In production, requires explicit ADMIN_INIT_PASSWORD (never uses a hardcoded default).
   */
  async ensureInitialAdmin(): Promise<void> {
    const config = getAppConfig();
    if (this.bootstrapped && adminStore.size > 0) return;

    const username = process.env.ADMIN_INIT_USERNAME || "admin";
    const initialPassword = process.env.ADMIN_INIT_PASSWORD;

    if (config.isProduction && !initialPassword) {
      // In production, never create a silent default administrator
      this.bootstrapped = true;
      return;
    }

    const passwordToUse =
      initialPassword || (!config.isProduction ? "MQTechAdmin2026!" : "");

    if (!passwordToUse) {
      this.bootstrapped = true;
      return;
    }

    // Check if admin already exists
    const existing = await this.findByUsername(username);
    if (!existing) {
      const passwordHash = await hashPassword(passwordToUse);
      const initialAdmin: AdminUser = {
        id: randomUUID(),
        username,
        passwordHash,
        fullName: "Quản Trị Viên MQTech",
        role: "ADMIN",
        tokenVersion: 1,
        isActive: true,
        createdAt: new Date(),
      };

      if (db.isConfigured) {
        try {
          await db.query(
            `INSERT INTO admin_users (id, username, password_hash, full_name, role, token_version, is_active, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
            [
              initialAdmin.id,
              initialAdmin.username,
              initialAdmin.passwordHash,
              initialAdmin.fullName,
              initialAdmin.role,
              initialAdmin.tokenVersion,
              initialAdmin.isActive,
              initialAdmin.createdAt,
            ]
          );
        } catch (err) {
          if (!config.allowMemoryStore) {
            throw new Error(
              "PostgreSQL admin insert failed and in-memory store is disallowed."
            );
          }
          console.warn("PostgreSQL admin insert failed, using fallback:", err);
        }
      } else if (!config.allowMemoryStore) {
        throw new Error(
          "Admin initialization requires an active database connection in this environment."
        );
      }

      adminStore.set(username, initialAdmin);
    }

    this.bootstrapped = true;
  }

  async findByUsername(username: string): Promise<AdminUser | null> {
    const config = getAppConfig();
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
            tokenVersion:
              typeof row.token_version === "number"
                ? row.token_version
                : parseInt(String(row.token_version || "1"), 10),
            isActive: row.is_active !== false,
            createdAt: new Date(String(row.created_at)),
          };
        }
        return null;
      } catch (err) {
        if (!config.allowMemoryStore) {
          throw new Error(
            "PostgreSQL admin query failed and in-memory store is disallowed."
          );
        }
        console.warn("PostgreSQL admin query failed:", err);
      }
    } else if (!config.allowMemoryStore) {
      throw new Error(
        "Admin account lookup requires an active database connection in this environment."
      );
    }

    return adminStore.get(normalized) || null;
  }

  /**
   * Updates an administrator's password and transactionally increments tokenVersion.
   * Instantly invalidates all pre-existing session tokens for this administrator.
   */
  async updatePassword(
    username: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    const config = getAppConfig();
    const user = await this.findByUsername(username);
    if (!user) {
      return { success: false, error: "Không tìm thấy người dùng." };
    }

    const passwordHash = await hashPassword(newPassword);

    if (db.isConfigured) {
      try {
        await db.transaction(async (tx) => {
          await tx.query(
            "UPDATE admin_users SET password_hash = $1, token_version = token_version + 1 WHERE username = $2;",
            [passwordHash, user.username]
          );
        });
        user.passwordHash = passwordHash;
        user.tokenVersion += 1;
        return { success: true };
      } catch (err) {
        if (!config.allowMemoryStore) {
          throw new Error("Lỗi cập nhật mật khẩu cơ sở dữ liệu.");
        }
        console.warn("PostgreSQL password update failed:", err);
      }
    } else if (!config.allowMemoryStore) {
      throw new Error("Yêu cầu cơ sở dữ liệu trong môi trường này.");
    }

    // In-memory update
    user.passwordHash = passwordHash;
    user.tokenVersion += 1;
    adminStore.set(user.username, user);
    return { success: true };
  }

  /**
   * Revokes all active session tokens for the given administrator by incrementing tokenVersion.
   */
  async revokeAllSessions(username: string): Promise<boolean> {
    const config = getAppConfig();
    const user = await this.findByUsername(username);
    if (!user) return false;

    if (db.isConfigured) {
      try {
        await db.query(
          "UPDATE admin_users SET token_version = token_version + 1 WHERE username = $1;",
          [user.username]
        );
        user.tokenVersion += 1;
        return true;
      } catch (err) {
        if (!config.allowMemoryStore) {
          throw new Error("Lỗi thu hồi phiên làm việc trong cơ sở dữ liệu.");
        }
        console.warn("PostgreSQL token revocation failed:", err);
      }
    } else if (!config.allowMemoryStore) {
      throw new Error("Yêu cầu cơ sở dữ liệu trong môi trường này.");
    }

    user.tokenVersion += 1;
    adminStore.set(user.username, user);
    return true;
  }

  /**
   * Sets account active state (account disablement).
   * Disabling an account immediately revokes all active session tokens.
   */
  async setAccountActive(
    username: string,
    isActive: boolean
  ): Promise<boolean> {
    const config = getAppConfig();
    const user = await this.findByUsername(username);
    if (!user) return false;

    if (db.isConfigured) {
      try {
        await db.query(
          "UPDATE admin_users SET is_active = $1, token_version = token_version + 1 WHERE username = $2;",
          [isActive, user.username]
        );
        user.isActive = isActive;
        user.tokenVersion += 1;
        return true;
      } catch (err) {
        if (!config.allowMemoryStore) {
          throw new Error("Lỗi cập nhật trạng thái tài khoản cơ sở dữ liệu.");
        }
        console.warn("PostgreSQL account state update failed:", err);
      }
    } else if (!config.allowMemoryStore) {
      throw new Error("Yêu cầu cơ sở dữ liệu trong môi trường này.");
    }

    user.isActive = isActive;
    user.tokenVersion += 1;
    adminStore.set(user.username, user);
    return true;
  }

  /**
   * Authenticates administrator credentials.
   * Rejects disabled accounts and never leaks username existence.
   */
  async authenticate(
    username: string,
    password: string
  ): Promise<{
    username: string;
    fullName: string;
    role: "ADMIN" | "STAFF";
    tokenVersion: number;
  } | null> {
    await this.ensureInitialAdmin();

    const user = await this.findByUsername(username);
    if (!user || !user.isActive) {
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
      tokenVersion: user.tokenVersion,
    };
  }

  /**
   * Resets the in-memory admin store (test suite fixture helper).
   */
  clearDevStore(): void {
    adminStore.clear();
    this.bootstrapped = false;
  }
}

export const adminService = new AdminService();
