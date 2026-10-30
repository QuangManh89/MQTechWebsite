import { getAdminSessionFromRequest } from "../../../../lib/auth/session.ts";
import { serviceRequestRepo } from "../../../../lib/db/repository.ts";

export async function GET(req: Request) {
  const session = getAdminSessionFromRequest(req);
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
