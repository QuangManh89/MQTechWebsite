import { getAdminSessionFromRequest } from "../../../../lib/auth/session.ts";
import { guardApiRoute } from "../../../../lib/security/request-guard.ts";
import { articleRepo } from "../../../../lib/db/article-repository.ts";
import type { ArticleCategory, ArticleStatus } from "../../../../lib/db/types.ts";
import type { CreateArticleDTO } from "../../../../lib/validations/article.ts";

export async function GET(req: Request) {
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

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") || undefined) as ArticleStatus | undefined;
  const category = (url.searchParams.get("category") || undefined) as ArticleCategory | undefined;
  const search = url.searchParams.get("search") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);

  const result = await articleRepo.listArticles({
    status,
    category,
    search,
    page,
    pageSize,
  });

  return Response.json({
    success: true,
    data: result,
  });
}

export async function POST(req: Request) {
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

  let body: CreateArticleDTO;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: "Dữ liệu JSON không hợp lệ." },
      { status: 400 }
    );
  }

  try {
    const article = await articleRepo.createArticle(body, {
      id: session.username,
      fullName: session.fullName,
    });

    return Response.json(
      {
        success: true,
        data: article,
        message: "Xuất bản bài viết thành công lên Cloudflare R2 & CSDL.",
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi tạo bài viết.";
    return Response.json({ success: false, error: message }, { status: 400 });
  }
}
