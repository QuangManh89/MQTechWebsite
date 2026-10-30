import { getAdminSessionFromRequest } from "../../../../lib/auth/session.ts";
import { guardApiRoute } from "../../../../lib/security/request-guard.ts";

export async function GET(req: Request) {
  const guard = guardApiRoute(req);
  if (!guard.allowed && guard.response) {
    return guard.response;
  }

  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return Response.json(
      { success: false, error: "Phiên làm việc không hợp lệ hoặc đã hết hạn." },
      { status: 401 }
    );
  }

  return Response.json({
    success: true,
    user: {
      username: session.username,
      fullName: session.fullName,
      role: session.role,
    },
  });
}
