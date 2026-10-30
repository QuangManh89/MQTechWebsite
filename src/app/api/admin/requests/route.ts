import { getAdminSessionFromRequest } from "../../../../lib/auth/session.ts";
import { serviceRequestRepo } from "../../../../lib/db/repository.ts";
import type { RequestStatus, ServiceDeliveryMode } from "../../../../lib/db/types.ts";
import { guardApiRoute } from "../../../../lib/security/request-guard.ts";

export async function GET(req: Request) {
  const guard = guardApiRoute(req);
  if (!guard.allowed && guard.response) {
    return guard.response;
  }

  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return Response.json(
      { success: false, error: "Yêu cầu đăng nhập quản trị để truy cập dữ liệu." },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") || undefined) as
    | RequestStatus
    | undefined;
  const serviceMode = (url.searchParams.get("serviceMode") || undefined) as
    | ServiceDeliveryMode
    | undefined;
  const search = url.searchParams.get("search") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);

  const result = await serviceRequestRepo.listRequests({
    status,
    serviceMode,
    search,
    page,
    pageSize,
  });

  return Response.json({
    success: true,
    data: result,
  });
}
