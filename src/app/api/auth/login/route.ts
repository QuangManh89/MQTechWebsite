import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ADMIN_COOKIE_NAME, signAdminToken } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rateLimited = enforceRateLimit(req, {
    bucket: "admin-login",
    limit: 8,
    windowMs: 10 * 60_000,
    message:
      "Quá nhiều lần thử đăng nhập liên tiếp. Vui lòng đợi vài phút rồi thử lại.",
  });
  if (rateLimited) return rateLimited;

  try {
    await ensureDbReady();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Email và Mật khẩu" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase().slice(0, 150);
    const rows = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, normalizedEmail))
      .limit(1);

    const user = rows[0];
    if (!user) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(String(password).slice(0, 200), user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    const role = user.role === "EDITOR" ? "EDITOR" : "ADMIN";

    const token = await signAdminToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role,
    });

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role },
    });

    const isHttps =
      req.headers.get("x-forwarded-proto") === "https" ||
      req.nextUrl.protocol === "https:";

    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json(
      { error: "Không thể xác thực đăng nhập lúc này. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
