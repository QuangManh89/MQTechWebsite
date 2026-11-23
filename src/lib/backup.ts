import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Pool } from "pg";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { db, runRawSql } from "@/db";
import { DDL_SQL } from "@/db/ensure-db";
import {
  siteSettings,
  services,
  pricingItems,
  posts,
  repairTickets,
  contactInquiries,
  customers,
  adminUsers,
  inventoryItems,
  stockMovements,
  financeTransactions,
} from "@/db/schema";

export interface DatabaseBackupSnapshot {
  version: number;
  exportedAt: string;
  counts: Record<string, number>;
  tables: {
    site_settings: Array<Record<string, unknown>>;
    services: Array<Record<string, unknown>>;
    pricing_items: Array<Record<string, unknown>>;
    posts: Array<Record<string, unknown>>;
    repair_tickets: Array<Record<string, unknown>>;
    contact_inquiries: Array<Record<string, unknown>>;
    customers: Array<Record<string, unknown>>;
    admin_users: Array<Record<string, unknown>>;
    inventory_items: Array<Record<string, unknown>>;
    stock_movements: Array<Record<string, unknown>>;
    finance_transactions: Array<Record<string, unknown>>;
  };
}

export function isR2BackupConfigured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
  );
}

export function isBackupPostgresConfigured(): boolean {
  return Boolean(process.env.BACKUP_DATABASE_URL?.trim());
}

export async function exportAllTablesSnapshot(): Promise<DatabaseBackupSnapshot> {
  const [
    sSettings,
    sServices,
    sPricing,
    sPosts,
    sTickets,
    sInquiries,
    sCustomers,
    sAdmins,
    sInventory,
    sMovements,
    sFinance,
  ] = await Promise.all([
    db.select().from(siteSettings),
    db.select().from(services),
    db.select().from(pricingItems),
    db.select().from(posts),
    db.select().from(repairTickets),
    db.select().from(contactInquiries),
    db.select().from(customers),
    db.select().from(adminUsers),
    db.select().from(inventoryItems),
    db.select().from(stockMovements),
    db.select().from(financeTransactions),
  ]);

  const tables = {
    site_settings: sSettings as unknown as Array<Record<string, unknown>>,
    services: sServices as unknown as Array<Record<string, unknown>>,
    pricing_items: sPricing as unknown as Array<Record<string, unknown>>,
    posts: sPosts as unknown as Array<Record<string, unknown>>,
    repair_tickets: sTickets as unknown as Array<Record<string, unknown>>,
    contact_inquiries: sInquiries as unknown as Array<Record<string, unknown>>,
    customers: sCustomers as unknown as Array<Record<string, unknown>>,
    admin_users: sAdmins as unknown as Array<Record<string, unknown>>,
    inventory_items: sInventory as unknown as Array<Record<string, unknown>>,
    stock_movements: sMovements as unknown as Array<Record<string, unknown>>,
    finance_transactions: sFinance as unknown as Array<Record<string, unknown>>,
  };

  const counts: Record<string, number> = {};
  for (const [key, rows] of Object.entries(tables)) {
    counts[key] = rows.length;
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    counts,
    tables,
  };
}

export async function uploadBackupToR2(
  snapshot: DatabaseBackupSnapshot
): Promise<{ key: string; provider: "r2" | "local"; sizeBytes: number }> {
  const now = new Date();
  const stamp = now
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
  const fileName = `mqtech-backup-${stamp}.json`;
  const payload = JSON.stringify(snapshot, null, 2);
  const buffer = Buffer.from(payload, "utf8");

  if (isR2BackupConfigured()) {
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    const key = `backups/${fileName}`;
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: "application/json; charset=utf-8",
      })
    );

    return { key, provider: "r2", sizeBytes: buffer.byteLength };
  }

  const backupDir = path.join(process.cwd(), ".backups");
  await mkdir(backupDir, { recursive: true });
  const filePath = path.join(backupDir, fileName);
  await writeFile(filePath, buffer);
  return { key: `.backups/${fileName}`, provider: "local", sizeBytes: buffer.byteLength };
}

function reviveDates<T extends Record<string, unknown>>(
  rows: Array<Record<string, unknown>>,
  dateFields: string[]
): T[] {
  return rows.map((row) => {
    const copy: Record<string, unknown> = { ...row };
    for (const field of dateFields) {
      if (copy[field] && typeof copy[field] === "string") {
        copy[field] = new Date(copy[field] as string);
      }
    }
    return copy as T;
  });
}

const SEQUENCE_TABLES = [
  "services",
  "pricing_items",
  "posts",
  "repair_tickets",
  "contact_inquiries",
  "customers",
  "admin_users",
  "inventory_items",
  "stock_movements",
  "finance_transactions",
] as const;

export async function restoreFromSnapshot(
  snapshot: DatabaseBackupSnapshot
): Promise<{ counts: Record<string, number> }> {
  if (!snapshot || !snapshot.tables || typeof snapshot.tables !== "object") {
    throw new Error("File backup không hợp lệ hoặc thiếu cấu trúc bảng.");
  }

  const t = snapshot.tables;

  // Delete in reverse FK order
  await db.delete(stockMovements);
  await db.delete(financeTransactions);
  await db.delete(inventoryItems);
  await db.delete(repairTickets);
  await db.delete(contactInquiries);
  await db.delete(customers);
  await db.delete(posts);
  await db.delete(pricingItems);
  await db.delete(services);
  await db.delete(siteSettings);
  if (Array.isArray(t.admin_users) && t.admin_users.length > 0) {
    await db.delete(adminUsers);
  }

  // Insert in forward FK order
  if (Array.isArray(t.site_settings) && t.site_settings.length > 0) {
    await db
      .insert(siteSettings)
      .values(reviveDates(t.site_settings, ["updatedAt"]) as never);
  }
  if (Array.isArray(t.services) && t.services.length > 0) {
    await db
      .insert(services)
      .values(reviveDates(t.services, ["createdAt", "updatedAt"]) as never);
  }
  if (Array.isArray(t.pricing_items) && t.pricing_items.length > 0) {
    await db.insert(pricingItems).values(t.pricing_items as never);
  }
  if (Array.isArray(t.posts) && t.posts.length > 0) {
    await db
      .insert(posts)
      .values(
        reviveDates(t.posts, ["publishedAt", "createdAt", "updatedAt"]) as never
      );
  }
  if (Array.isArray(t.customers) && t.customers.length > 0) {
    await db
      .insert(customers)
      .values(reviveDates(t.customers, ["createdAt", "updatedAt"]) as never);
  }
  if (Array.isArray(t.repair_tickets) && t.repair_tickets.length > 0) {
    await db
      .insert(repairTickets)
      .values(
        reviveDates(t.repair_tickets, ["createdAt", "updatedAt"]) as never
      );
  }
  if (Array.isArray(t.contact_inquiries) && t.contact_inquiries.length > 0) {
    await db
      .insert(contactInquiries)
      .values(reviveDates(t.contact_inquiries, ["createdAt"]) as never);
  }
  if (Array.isArray(t.admin_users) && t.admin_users.length > 0) {
    await db
      .insert(adminUsers)
      .values(reviveDates(t.admin_users, ["createdAt"]) as never);
  }
  if (Array.isArray(t.inventory_items) && t.inventory_items.length > 0) {
    await db
      .insert(inventoryItems)
      .values(
        reviveDates(t.inventory_items, ["createdAt", "updatedAt"]) as never
      );
  }
  if (Array.isArray(t.stock_movements) && t.stock_movements.length > 0) {
    await db
      .insert(stockMovements)
      .values(reviveDates(t.stock_movements, ["createdAt"]) as never);
  }
  if (Array.isArray(t.finance_transactions) && t.finance_transactions.length > 0) {
    await db
      .insert(financeTransactions)
      .values(reviveDates(t.finance_transactions, ["createdAt"]) as never);
  }

  // Reset SERIAL sequences so future inserts won't collide
  for (const tbl of SEQUENCE_TABLES) {
    await runRawSql(
      `SELECT setval(pg_get_serial_sequence('${tbl}', 'id'), COALESCE((SELECT MAX(id) FROM ${tbl}), 1), (SELECT COUNT(*) > 0 FROM ${tbl}));`
    );
  }

  return { counts: snapshot.counts || {} };
}

export async function syncToBackupPostgres(
  snapshot: DatabaseBackupSnapshot
): Promise<{ syncedAt: string; counts: Record<string, number> }> {
  const backupUrl = process.env.BACKUP_DATABASE_URL?.trim();
  if (!backupUrl) {
    throw new Error(
      "Chưa cấu hình biến môi trường BACKUP_DATABASE_URL cho PostgreSQL dự phòng."
    );
  }

  const backupPool = new Pool({
    connectionString: backupUrl,
    max: 3,
    ssl:
      backupUrl.includes("sslmode=require") ||
      backupUrl.includes("neon.tech") ||
      backupUrl.includes("supabase.co")
        ? { rejectUnauthorized: false }
        : undefined,
  });

  try {
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const schema = await import("@/db/schema");
    const backupDb = drizzle(backupPool, { schema });

    // Ensure all 11 tables exist on the backup PostgreSQL
    await backupPool.query(DDL_SQL);

    const t = snapshot.tables;

    await backupDb.transaction(async (tx) => {
      await tx.delete(stockMovements);
      await tx.delete(financeTransactions);
      await tx.delete(inventoryItems);
      await tx.delete(repairTickets);
      await tx.delete(contactInquiries);
      await tx.delete(customers);
      await tx.delete(posts);
      await tx.delete(pricingItems);
      await tx.delete(services);
      await tx.delete(siteSettings);
      await tx.delete(adminUsers);

      if (t.site_settings.length > 0) {
        await tx
          .insert(siteSettings)
          .values(reviveDates(t.site_settings, ["updatedAt"]) as never);
      }
      if (t.services.length > 0) {
        await tx
          .insert(services)
          .values(reviveDates(t.services, ["createdAt", "updatedAt"]) as never);
      }
      if (t.pricing_items.length > 0) {
        await tx.insert(pricingItems).values(t.pricing_items as never);
      }
      if (t.posts.length > 0) {
        await tx
          .insert(posts)
          .values(
            reviveDates(t.posts, ["publishedAt", "createdAt", "updatedAt"]) as never
          );
      }
      if (t.customers.length > 0) {
        await tx
          .insert(customers)
          .values(reviveDates(t.customers, ["createdAt", "updatedAt"]) as never);
      }
      if (t.repair_tickets.length > 0) {
        await tx
          .insert(repairTickets)
          .values(
            reviveDates(t.repair_tickets, ["createdAt", "updatedAt"]) as never
          );
      }
      if (t.contact_inquiries.length > 0) {
        await tx
          .insert(contactInquiries)
          .values(reviveDates(t.contact_inquiries, ["createdAt"]) as never);
      }
      if (t.admin_users.length > 0) {
        await tx
          .insert(adminUsers)
          .values(reviveDates(t.admin_users, ["createdAt"]) as never);
      }
      if (t.inventory_items.length > 0) {
        await tx
          .insert(inventoryItems)
          .values(
            reviveDates(t.inventory_items, ["createdAt", "updatedAt"]) as never
          );
      }
      if (t.stock_movements.length > 0) {
        await tx
          .insert(stockMovements)
          .values(reviveDates(t.stock_movements, ["createdAt"]) as never);
      }
      if (t.finance_transactions.length > 0) {
        await tx
          .insert(financeTransactions)
          .values(reviveDates(t.finance_transactions, ["createdAt"]) as never);
      }
    });

    for (const tbl of SEQUENCE_TABLES) {
      await backupPool.query(
        `SELECT setval(pg_get_serial_sequence('${tbl}', 'id'), COALESCE((SELECT MAX(id) FROM ${tbl}), 1), (SELECT COUNT(*) > 0 FROM ${tbl}));`
      );
    }

    return {
      syncedAt: new Date().toISOString(),
      counts: snapshot.counts,
    };
  } finally {
    await backupPool.end();
  }
}
