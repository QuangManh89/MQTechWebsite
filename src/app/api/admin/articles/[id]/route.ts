import { getAdminSessionFromRequest } from "../../../../../lib/auth/session.ts";
import { guardApiRoute } from "../../../../../lib/security/request-guard.ts";
import { articleRepo } from "../../../../../lib/db/article-repository.ts";
import type { UpdateArticleDTO } from "../../../../../lib/validations/article.ts";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return Response.json(
      { success: false, error: "Yêu cầu đăng nhập quản trị viên." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const article = await articleRepo.getArticleById(id);

  if (!article) {
    return Response.json(
      { success: false, error: "Không tìm thấy bài viết." },
      { status: 404 }
    );
  }

  return Response.json({ success: true, data: article });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = guardApiRoute(req);
  if (!guard.allowed && guard.response) {
    return guard.response;
  }

  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return Response.json(
      { success: false, error: "Yêu cầu đăng nhập quản trị viên." },
      { status: 401 }
    );
  }

  const { id } = await params;
  let body: UpdateArticleDTO;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: "Dữ liệu JSON không hợp lệ." },
      { status: 400 }
    );
  }

  try {
    const updated = await articleRepo.updateArticle(id, body);
    if (!updated) {
      return Response.json(
        { success: false, error: "Không tìm thấy bài viết để cập nhật." },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: updated,
      message: "Cập nhật bài viết thành công trên Cloudflare R2 & CSDL.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi cập nhật bài viết.";
    return Response.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = guardApiRoute(req);
  if (!guard.allowed && guard.response) {
    return guard.response;
  }

  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return Response.json(
      { success: false, error: "Yêu cầu đăng nhập quản trị viên." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const deleted = await articleRepo.deleteArticle(id);

  if (!deleted) {
    return Response.json(
      { success: false, error: "Không tìm thấy bài viết để xóa." },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    message: "Đã xóa bài viết và đối tượng R2 thành công.",
  });
}
