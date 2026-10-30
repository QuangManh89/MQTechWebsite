import { ADMIN_COOKIE_NAME, getAdminSessionFromRequest } from "../../../../lib/auth/session.ts";
import { adminService } from "../../../../lib/auth/admin-service.ts";
import { guardApiRoute } from "../../../../lib/security/request-guard.ts";

export async function POST(req?: Request) {
  if (req) {
    const guard = guardApiRoute(req, { checkOrigin: true });
    if (!guard.allowed && guard.response) {
      return guard.response;
    }

    // Server-side session revocation: increments token_version so token cannot be replayed
    try {
      const session = await getAdminSessionFromRequest(req);
      if (session) {
        await adminService.revokeAllSessions(session.username);
      }
    } catch {
      // Ignored in logout failure
    }
  }

  const isProduction = process.env.NODE_ENV === "production";
  const clearCookie = `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    isProduction ? "; Secure" : ""
  }`;

  return new Response(
    JSON.stringify({ success: true, message: "Đăng xuất thành công." }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": clearCookie,
      },
    }
  );
}
