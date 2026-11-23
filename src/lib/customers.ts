import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";

export type WarrantyState = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "NONE";

export interface WarrantyComputation {
  status: WarrantyState;
  daysLeft: number | null;
  label: string;
}

/**
 * Normalize Vietnamese phone numbers to digits-only (keep leading + if international)
 */
export function normalizePhone(raw: string | null | undefined): string {
  return String(raw ?? "")
    .replace(/[\s.\-()]+/g, "")
    .trim();
}

/**
 * Compute warranty status relative to today (Vietnam timezone UTC+7)
 */
export function computeWarrantyStatus(
  warrantyUntil?: string | null
): WarrantyComputation {
  const raw = String(warrantyUntil ?? "").trim();
  if (!raw) {
    return { status: "NONE", daysLeft: null, label: "Chưa có BH" };
  }

  // Parse YYYY-MM-DD or DD/MM/YYYY
  let targetMs: number | null = null;
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(raw);
  if (isoMatch) {
    targetMs = Date.UTC(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3])
    );
  } else {
    const vnMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(raw);
    if (vnMatch) {
      targetMs = Date.UTC(
        Number(vnMatch[3]),
        Number(vnMatch[2]) - 1,
        Number(vnMatch[1])
      );
    } else {
      const parsed = Date.parse(raw);
      if (!Number.isNaN(parsed)) targetMs = parsed;
    }
  }

  if (targetMs === null) {
    return { status: "NONE", daysLeft: null, label: "Chưa rõ hạn BH" };
  }

  // Current date in UTC+7 (midnight)
  const nowVn = new Date(Date.now() + 7 * 3600_000);
  const todayUtcMs = Date.UTC(
    nowVn.getUTCFullYear(),
    nowVn.getUTCMonth(),
    nowVn.getUTCDate()
  );

  const daysLeft = Math.ceil((targetMs - todayUtcMs) / 86_400_000);

  if (daysLeft <= 0) {
    return {
      status: "EXPIRED",
      daysLeft,
      label: "Đã hết bảo hành",
    };
  }
  if (daysLeft <= 15) {
    return {
      status: "EXPIRING_SOON",
      daysLeft,
      label: `Sắp hết BH • ${daysLeft} ngày`,
    };
  }
  return {
    status: "ACTIVE",
    daysLeft,
    label: `Còn BH • ${daysLeft} ngày`,
  };
}

/**
 * Auto-sync customer profile when a ticket is created online or at counter.
 * Never overwrites existing internal admin notes.
 */
export async function upsertCustomerFromTicket(input: {
  phone: string;
  name: string;
  email?: string | null;
  address?: string | null;
}): Promise<void> {
  const phone = normalizePhone(input.phone);
  if (phone.length < 8) return;

  const cleanName = String(input.name || "Khách hàng").trim().slice(0, 120);
  const cleanEmail = input.email ? String(input.email).trim().slice(0, 150) : null;
  const cleanAddress = input.address
    ? String(input.address).trim().slice(0, 250)
    : null;

  try {
    const existing = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, phone))
      .limit(1);

    if (existing.length === 0) {
      await db
        .insert(customers)
        .values({
          phone,
          name: cleanName,
          email: cleanEmail,
          address: cleanAddress,
        })
        .onConflictDoNothing();
    } else {
      const curr = existing[0];
      await db
        .update(customers)
        .set({
          name: cleanName || curr.name,
          email: cleanEmail || curr.email,
          address: cleanAddress || curr.address,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, curr.id));
    }
  } catch (err) {
    console.warn("[upsertCustomerFromTicket notice]", err);
  }
}
