import { adminService, adminLoginLimiter } from "../../../../lib/auth/admin-service.ts";
import { createSessionToken, ADMIN_COOKIE_NAME } from "../../../../lib/auth/session.ts";

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    // Rate limiting: 5 attempts per 15 minutes
    const limitCheck = adminLoginLimiter.check(ip);
    if (!limitCheck.allowed) {
      return Response.json(
        {
          success: false,
          error:
            "Quá nhiều lần thử đăng nhập không thành công. Vui lòng thử lại sau 15 phút.",
          code: "RATE_LIMITED",
        },
        { status: 429 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return Response.json(
        { success: false, error: "Dữ liệu không hợp lệ." },
        { status: 400 }
      );
    }

    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      return Response.json(
        { success: false, error: "Vui lòng nhập tên đăng nhập và mật khẩu." },
        { status: 400 }
      );
    }

    const user = await adminService.authenticate(username, password);
    if (!user) {
      return Response.json(
        {
          success: false,
          error: "Tên đăng nhập hoặc mật khẩu không chính xác.",
        },
        { status: 401 }
      );
    }

    // Reset rate limiter upon successful login
    adminLoginLimiter.reset(ip);

    // Create signed session token
    const token = createSessionToken(user, 8);
    const isProduction = process.env.NODE_ENV === "production";
    const cookieHeader = `${ADMIN_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${
      isProduction ? "; Secure" : ""
    }`;

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          username: user.username,
          fullName: user.fullName,
          role: user.role,
        },
        message: "Đăng nhập thành công.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookieHeader,
        },
      }
    );
  } catch (error) {
    console.error("Lỗi xác thực đăng nhập quản trị:", error);
    return Response.json(
      { success: false, error: "Đã xảy ra lỗi hệ thống trong khi đăng nhập." },
      { status: 500 }
    );
  }
}
