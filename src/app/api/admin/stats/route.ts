import { getAdminSessionFromRequest } from "../../../../lib/auth/session.ts";
import { serviceRequestRepo } from "../../../../lib/db/repository.ts";
import { guardApiRoute } from "../../../../lib/security/request-guard.ts";

export async function GET(req: Request) {
  const guard = guardApiRoute(req);
  if (!guard.allowed && guard.response) {
    return guard.response;
  }

  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return Response.json(
      { success: false, error: "Yêu cầu đăng nhập quản trị." },
      { status: 401 }
    );
  }

  const stats = await serviceRequestRepo.getStats();

  return Response.json({
    success: true,
    data: stats,
  });
}
