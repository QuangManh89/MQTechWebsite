import { getAdminSessionFromRequest } from "../../../../../lib/auth/session.ts";
import { serviceRequestRepo } from "../../../../../lib/db/repository.ts";
import type { RequestStatus } from "../../../../../lib/db/types.ts";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return Response.json(
      { success: false, error: "Yêu cầu đăng nhập quản trị." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const request = await serviceRequestRepo.findById(id);
  if (!request) {
    return Response.json(
      { success: false, error: "Không tìm thấy yêu cầu dịch vụ." },
      { status: 404 }
    );
  }

  const history = await serviceRequestRepo.getStatusHistory(id);

  return Response.json({
    success: true,
    data: {
      request,
      history,
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return Response.json(
      { success: false, error: "Yêu cầu đăng nhập quản trị." },
      { status: 401 }
    );
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json(
      { success: false, error: "Dữ liệu cập nhật không hợp lệ." },
      { status: 400 }
    );
  }

  const status = body.status as RequestStatus;
  const note = typeof body.note === "string" ? body.note.trim() : undefined;

  if (!status) {
    return Response.json(
      { success: false, error: "Vui lòng chỉ định trạng thái mới." },
      { status: 400 }
    );
  }

  const result = await serviceRequestRepo.updateStatus(
    id,
    status,
    session.username,
    note
  );

  if (!result.success) {
    return Response.json(
      { success: false, error: result.error },
      { status: 400 }
    );
  }

  const history = await serviceRequestRepo.getStatusHistory(id);

  return Response.json({
    success: true,
    data: {
      request: result.request,
      history,
    },
    message: "Cập nhật trạng thái thành công.",
  });
}
