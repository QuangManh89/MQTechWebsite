import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { customers, repairTickets } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth";
import {
  computeWarrantyStatus,
  normalizePhone,
  type WarrantyComputation,
} from "@/lib/customers";

export const dynamic = "force-dynamic";

export interface EnrichedTicket {
  id: number;
  ticketCode: string;
  source: string;
  serviceMode: string;
  onsiteAddress: string | null;
  deviceType: string;
  serviceCategory: string;
  deviceModel: string | null;
  serialNumber: string | null;
  issueDescription: string;
  appointmentDate: string;
  appointmentSlot: string;
  status: string;
  technicianNote: string | null;
  estimatedCost: string | null;
  itemsJson: string;
  warrantyText: string | null;
  warrantyUntil: string | null;
  warranty: WarrantyComputation;
  createdAt: string;
}

export interface CustomerProfileItem {
  id: number | null;
  phone: string;
  name: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  totalTickets: number;
  activeWarrantyCount: number;
  expiringSoonCount: number;
  lastVisitAt: string | null;
  tickets: EnrichedTicket[];
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const qDigits = normalizePhone(q);
  const filter = (searchParams.get("filter") || "ALL").toUpperCase();

  const [customerRows, ticketRows] = await Promise.all([
    db.select().from(customers).orderBy(desc(customers.updatedAt)),
    db.select().from(repairTickets).orderBy(desc(repairTickets.createdAt)),
  ]);

  const map = new Map<string, CustomerProfileItem>();

  // 1. Seed map from saved customer profiles
  for (const c of customerRows) {
    const phoneKey = normalizePhone(c.phone);
    if (!phoneKey) continue;
    map.set(phoneKey, {
      id: c.id,
      phone: phoneKey,
      name: c.name,
      email: c.email,
      address: c.address,
      notes: c.notes,
      totalTickets: 0,
      activeWarrantyCount: 0,
      expiringSoonCount: 0,
      lastVisitAt: null,
      tickets: [],
    });
  }

  // 2. Attach all repair tickets (auto-including historical tickets without a customer row)
  for (const t of ticketRows) {
    const phoneKey = normalizePhone(t.customerPhone);
    if (!phoneKey) continue;

    let profile = map.get(phoneKey);
    if (!profile) {
      profile = {
        id: null,
        phone: phoneKey,
        name: t.customerName,
        email: t.customerEmail,
        address: t.onsiteAddress,
        notes: null,
        totalTickets: 0,
        activeWarrantyCount: 0,
        expiringSoonCount: 0,
        lastVisitAt: null,
        tickets: [],
      };
      map.set(phoneKey, profile);
    } else {
      if (!profile.address && t.onsiteAddress) profile.address = t.onsiteAddress;
      if (!profile.email && t.customerEmail) profile.email = t.customerEmail;
    }

    const warranty = computeWarrantyStatus(t.warrantyUntil);
    const createdIso =
      t.createdAt instanceof Date
        ? t.createdAt.toISOString()
        : String(t.createdAt);

    profile.tickets.push({
      id: t.id,
      ticketCode: t.ticketCode,
      source: t.source,
      serviceMode: t.serviceMode,
      onsiteAddress: t.onsiteAddress,
      deviceType: t.deviceType,
      serviceCategory: t.serviceCategory,
      deviceModel: t.deviceModel,
      serialNumber: t.serialNumber,
      issueDescription: t.issueDescription,
      appointmentDate: t.appointmentDate,
      appointmentSlot: t.appointmentSlot,
      status: t.status,
      technicianNote: t.technicianNote,
      estimatedCost: t.estimatedCost,
      itemsJson: t.itemsJson || "[]",
      warrantyText: t.warrantyText,
      warrantyUntil: t.warrantyUntil,
      warranty,
      createdAt: createdIso,
    });

    profile.totalTickets += 1;
    if (warranty.status === "ACTIVE" || warranty.status === "EXPIRING_SOON") {
      profile.activeWarrantyCount += 1;
    }
    if (warranty.status === "EXPIRING_SOON") {
      profile.expiringSoonCount += 1;
    }
    if (!profile.lastVisitAt || createdIso > profile.lastVisitAt) {
      profile.lastVisitAt = createdIso;
    }
  }

  const allProfiles = Array.from(map.values()).sort((a, b) => {
    const dateA = a.lastVisitAt || "";
    const dateB = b.lastVisitAt || "";
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return a.name.localeCompare(b.name, "vi");
  });

  const stats = {
    totalCustomers: allProfiles.length,
    activeWarrantyCustomers: allProfiles.filter((p) => p.activeWarrantyCount > 0)
      .length,
    repeatCustomers: allProfiles.filter((p) => p.totalTickets >= 2).length,
    expiringSoonCustomers: allProfiles.filter((p) => p.expiringSoonCount > 0)
      .length,
  };

  let filtered = allProfiles;

  if (filter === "ACTIVE_WARRANTY") {
    filtered = filtered.filter((p) => p.activeWarrantyCount > 0);
  } else if (filter === "REPEAT") {
    filtered = filtered.filter((p) => p.totalTickets >= 2);
  }

  if (q) {
    filtered = filtered.filter((p) => {
      if (qDigits && p.phone.includes(qDigits)) return true;
      if (p.name.toLowerCase().includes(q)) return true;
      if (p.address && p.address.toLowerCase().includes(q)) return true;
      if (p.notes && p.notes.toLowerCase().includes(q)) return true;
      return p.tickets.some(
        (t) =>
          t.ticketCode.toLowerCase().includes(q) ||
          (t.deviceModel && t.deviceModel.toLowerCase().includes(q)) ||
          (t.serialNumber && t.serialNumber.toLowerCase().includes(q)) ||
          t.serviceCategory.toLowerCase().includes(q)
      );
    });
  }

  return NextResponse.json({ customers: filtered, stats });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const body = await req.json();
  const phone = normalizePhone(body.phone);
  const name = String(body.name ?? "").trim().slice(0, 120);

  if (!/^[0-9+]{8,15}$/.test(phone)) {
    return NextResponse.json(
      { error: "Số điện thoại không hợp lệ (8 - 15 chữ số)." },
      { status: 400 }
    );
  }
  if (name.length < 2) {
    return NextResponse.json(
      { error: "Vui lòng nhập tên khách hàng (tối thiểu 2 ký tự)." },
      { status: 400 }
    );
  }

  const existing = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.phone, phone))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Số điện thoại này đã có trong danh bạ khách hàng." },
      { status: 409 }
    );
  }

  const [created] = await db
    .insert(customers)
    .values({
      phone,
      name,
      email: body.email ? String(body.email).trim().slice(0, 150) : null,
      address: body.address ? String(body.address).trim().slice(0, 250) : null,
      notes: body.notes ? String(body.notes).trim().slice(0, 1000) : null,
    })
    .returning();

  return NextResponse.json({ customer: created }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const body = await req.json();
  const phone = normalizePhone(body.phone);
  const name = String(body.name ?? "").trim().slice(0, 120);

  if (!/^[0-9+]{8,15}$/.test(phone)) {
    return NextResponse.json(
      { error: "Số điện thoại không hợp lệ." },
      { status: 400 }
    );
  }
  if (name.length < 2) {
    return NextResponse.json(
      { error: "Tên khách hàng cần ít nhất 2 ký tự." },
      { status: 400 }
    );
  }

  const existing = await db
    .select()
    .from(customers)
    .where(eq(customers.phone, phone))
    .limit(1);

  const payload = {
    name,
    email: body.email ? String(body.email).trim().slice(0, 150) : null,
    address: body.address ? String(body.address).trim().slice(0, 250) : null,
    notes: body.notes ? String(body.notes).trim().slice(0, 1000) : null,
    updatedAt: new Date(),
  };

  if (existing.length === 0) {
    const [created] = await db
      .insert(customers)
      .values({ phone, ...payload })
      .returning();
    return NextResponse.json({ customer: created });
  }

  const [updated] = await db
    .update(customers)
    .set(payload)
    .where(eq(customers.id, existing[0].id))
    .returning();

  return NextResponse.json({ customer: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "Thiếu ID khách hàng." }, { status: 400 });
  }

  await db.delete(customers).where(eq(customers.id, id));
  return NextResponse.json({ ok: true });
}
