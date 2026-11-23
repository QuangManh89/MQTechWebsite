import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { repairTickets, siteSettings } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth";
import { generateTicketCode } from "@/lib/utils";
import { normalizePhone, upsertCustomerFromTicket } from "@/lib/customers";
import {
  calculateItemsTotal,
  formatVnd,
  normalizeTicketItemsJson,
  parseTicketItems,
} from "@/lib/ticket-items";
import { syncTicketInventoryMovements } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const rows = await db
    .select()
    .from(repairTickets)
    .orderBy(desc(repairTickets.createdAt));
  return NextResponse.json({ tickets: rows });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const body = await req.json();

  const settingsRows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);
  const prefix = settingsRows[0]?.ticketPrefix || "MQ";
  const ticketCode = generateTicketCode(prefix);

  const normalizedItemsJson = normalizeTicketItemsJson(body.itemsJson);
  const parsedItems = parseTicketItems(normalizedItemsJson);
  const computedTotal =
    parsedItems.length > 0 ? formatVnd(calculateItemsTotal(parsedItems)) : null;

  const [created] = await db
    .insert(repairTickets)
    .values({
      ticketCode,
      source: body.source || "COUNTER",
      serviceMode: body.serviceMode || "STORE",
      onsiteAddress: body.onsiteAddress || null,
      deviceType: body.deviceType || "Laptop Windows",
      serviceCategory: body.serviceCategory || "Sửa chữa tại tiệm",
      deviceModel: body.deviceModel || null,
      serialNumber: body.serialNumber || null,
      issueDescription: body.issueDescription || "Kiểm tra phần cứng",
      appointmentDate:
        body.appointmentDate || new Date().toISOString().slice(0, 10),
      appointmentSlot: body.appointmentSlot || "Tiếp nhận tại quầy",
      customerName: body.customerName || "Khách lẻ",
      customerPhone: normalizePhone(body.customerPhone),
      customerEmail: body.customerEmail || null,
      status: body.status || "DIAGNOSING",
      technicianNote: body.technicianNote || null,
      estimatedCost: body.estimatedCost || computedTotal,
      itemsJson: normalizedItemsJson,
      warrantyText: body.warrantyText || null,
      warrantyUntil: body.warrantyUntil || null,
    })
    .returning();

  let finalTicket = created;
  if (parsedItems.some((item) => Boolean(item.inventoryItemId))) {
    const stampedItems = await syncTicketInventoryMovements({
      ticketId: created.id,
      ticketCode: created.ticketCode,
      status: created.status,
      items: parsedItems,
    });
    const stampedJson = JSON.stringify(stampedItems);
    if (stampedJson !== created.itemsJson) {
      const [updatedWithCost] = await db
        .update(repairTickets)
        .set({ itemsJson: stampedJson })
        .where(eq(repairTickets.id, created.id))
        .returning();
      if (updatedWithCost) finalTicket = updatedWithCost;
    }
  }

  await upsertCustomerFromTicket({
    phone: finalTicket.customerPhone,
    name: finalTicket.customerName,
    email: finalTicket.customerEmail,
    address: finalTicket.onsiteAddress,
  });

  return NextResponse.json({ ticket: finalTicket }, { status: 201 });
}
