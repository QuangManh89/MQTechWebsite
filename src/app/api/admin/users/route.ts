import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { adminUsers } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const rows = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      createdAt: adminUsers.createdAt,
    })
    .from(adminUsers)
    .orderBy(asc(adminUsers.id));

  return NextResponse.json({ users: rows });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const body = await req.json();
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 150);
  const name = String(body.name ?? "").trim().slice(0, 120);
  const password = String(body.password ?? "");
  const role = body.role === "ADMIN" ? "ADMIN" : "EDITOR";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Email không hợp lệ." },
      { status: 400 }
    );
  }
  if (name.length < 2) {
    return NextResponse.json(
      { error: "Tên hiển thị cần ít nhất 2 ký tự." },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Mật khẩu cần ít nhất 6 ký tự." },
      { status: 400 }
    );
  }

  const existing = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Email này đã tồn tại trong hệ thống." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [created] = await db
    .insert(adminUsers)
    .values({
      email,
      name,
      role,
      passwordHash,
    })
    .returning({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      createdAt: adminUsers.createdAt,
    });

  return NextResponse.json({ user: created }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const body = await req.json();
  const id = Number(body.id);
  if (!id) {
    return NextResponse.json({ error: "Thiếu ID tài khoản." }, { status: 400 });
  }

  const updates: {
    name?: string;
    role?: string;
    passwordHash?: string;
  } = {};

  if (typeof body.name === "string" && body.name.trim().length >= 2) {
    updates.name = body.name.trim().slice(0, 120);
  }
  if (body.role === "ADMIN" || body.role === "EDITOR") {
    if (id === auth.session.userId && body.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Không thể tự hạ quyền của tài khoản Admin đang đăng nhập." },
        { status: 400 }
      );
    }
    updates.role = body.role;
  }
  if (typeof body.password === "string" && body.password.length > 0) {
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu mới cần ít nhất 6 ký tự." },
        { status: 400 }
      );
    }
    updates.passwordHash = await bcrypt.hash(body.password, 10);
  }

  const [updated] = await db
    .update(adminUsers)
    .set(updates)
    .where(eq(adminUsers.id, id))
    .returning({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      createdAt: adminUsers.createdAt,
    });

  if (!updated) {
    return NextResponse.json(
      { error: "Không tìm thấy tài khoản." },
      { status: 404 }
    );
  }

  return NextResponse.json({ user: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "Thiếu ID tài khoản." }, { status: 400 });
  }

  if (id === auth.session.userId) {
    return NextResponse.json(
      { error: "Không thể xóa tài khoản Admin đang đăng nhập." },
      { status: 400 }
    );
  }

  await db.delete(adminUsers).where(eq(adminUsers.id, id));
  return NextResponse.json({ ok: true });
}
