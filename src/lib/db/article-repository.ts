import { randomUUID } from "node:crypto";
import type {
  Article,
  ArticleCategory,
  ArticleStatus,
} from "./types.ts";
import type {
  CreateArticleDTO,
  UpdateArticleDTO,
} from "../validations/article.ts";
import { validateArticleInput, slugify } from "../validations/article.ts";
import {
  generateArticlePostObjectKey,
  putR2ArticleObject,
  deleteR2ArticleObject,
} from "../storage/r2.ts";
import { db } from "./client.ts";
import { getAppConfig } from "../env.ts";
import { GUIDE_ARTICLES } from "../constants/guides.ts";
import type { PaginatedResult } from "./repository.ts";

export interface ListArticlesOptions {
  status?: ArticleStatus;
  category?: ArticleCategory;
  search?: string;
  page?: number;
  pageSize?: number;
}

declare global {
  var __mqtechDevArticles: Map<string, Article> | undefined;
}

if (!globalThis.__mqtechDevArticles) {
  globalThis.__mqtechDevArticles = new Map();

  // Pre-seed in-memory store from GUIDE_ARTICLES
  for (const g of GUIDE_ARTICLES) {
    const slug = g.id;
    const cat = (g.category === "thermal" ? "thermal" : g.category === "network" ? "network" : g.category === "software" ? "software" : "hardware") as ArticleCategory;
    const article: Article = {
      id: randomUUID(),
      slug,
      title: g.title,
      summary: g.summary,
      content: g.content,
      coverImageUrl: g.coverImage || `/cam-nang/${slug}.webp`,
      category: cat,
      categoryLabel: g.categoryLabel,
      readTime: g.readTime,
      difficulty: g.difficulty as Article["difficulty"],
      steps: g.steps.map((st) => ({
        number: st.number,
        action: st.action,
        detail: st.detail,
        warning: st.warning,
      })),
      quickTips: g.quickTips || [],
      status: "PUBLISHED",
      views: parseInt((g.views || "100").replace(/[^0-9]/g, ""), 10) || 120,
      r2ObjectKey: generateArticlePostObjectKey(slug),
      publishedAt: new Date(Date.now() - 7 * 86400000),
      createdAt: new Date(Date.now() - 7 * 86400000),
      updatedAt: new Date(),
    };
    globalThis.__mqtechDevArticles.set(article.id, article);
    // Also warm the R2 dev store
    putR2ArticleObject(slug, article).catch(() => {});
  }
}

const devArticlesStore = globalThis.__mqtechDevArticles;

export class ArticleRepository {
  /**
   * Creates a new article, storing the JSON object in Cloudflare R2
   * and synchronizing the metadata index in PostgreSQL.
   */
  async createArticle(
    dto: CreateArticleDTO,
    author?: { id: string; fullName: string }
  ): Promise<Article> {
    const validation = validateArticleInput(dto);
    if (!validation.valid || !validation.sanitized) {
      const errMsgs = Object.values(validation.errors).join("; ");
      throw new Error(`Dữ liệu bài viết không hợp lệ: ${errMsgs}`);
    }

    const {
      title,
      slug: baseSlug,
      summary,
      content,
      coverImageUrl,
      category,
      categoryLabel,
      readTime,
      difficulty,
      steps,
      quickTips,
      status,
    } = validation.sanitized;

    // Check unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await this.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const id = randomUUID();
    const r2ObjectKey = generateArticlePostObjectKey(slug);
    const now = new Date();

    const article: Article = {
      id,
      slug,
      title,
      summary,
      content,
      coverImageUrl,
      category,
      categoryLabel,
      readTime,
      difficulty,
      steps,
      quickTips,
      status,
      views: 0,
      r2ObjectKey,
      authorId: author?.id,
      authorName: author?.fullName,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Push JSON bundle to Cloudflare R2
    await putR2ArticleObject(slug, article);

    // 2. Persist Index to PostgreSQL if configured
    if (db.isConfigured) {
      try {
        await db.query(
          `INSERT INTO articles (
            id, slug, title, summary, cover_image_url, category, category_label,
            read_time, difficulty, status, views, r2_object_key, author_id,
            published_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);`,
          [
            article.id,
            article.slug,
            article.title,
            article.summary,
            article.coverImageUrl || null,
            article.category,
            article.categoryLabel,
            article.readTime,
            article.difficulty,
            article.status,
            article.views,
            article.r2ObjectKey,
            article.authorId || null,
            article.publishedAt,
            article.createdAt,
            article.updatedAt,
          ]
        );
      } catch (err) {
        const config = getAppConfig();
        if (!config.allowMemoryStore) {
          throw new Error("Lỗi khi lưu bài viết vào PostgreSQL: " + String(err));
        }
        console.warn("PostgreSQL insert failed, relying on memory store:", err);
      }
    }

    devArticlesStore.set(article.id, article);
    return article;
  }

  /**
   * Updates an existing article and updates both R2 and PostgreSQL.
   */
  async updateArticle(id: string, dto: UpdateArticleDTO): Promise<Article | null> {
    const existing = await this.getArticleById(id);
    if (!existing) return null;

    const updatedTitle = dto.title !== undefined ? dto.title.trim() : existing.title;
    let updatedSlug = existing.slug;

    if (dto.slug && dto.slug.trim() && dto.slug.trim() !== existing.slug) {
      const candidate = slugify(dto.slug.trim());
      if (candidate !== existing.slug && !(await this.slugExists(candidate, id))) {
        updatedSlug = candidate;
        // Clean up old R2 key if slug changed
        await deleteR2ArticleObject(existing.slug);
      }
    }

    const updatedCategory = dto.category || existing.category;
    const categoryLabel = dto.category
      ? (dto.category === "hardware" ? "Cấp cứu phần cứng" : dto.category === "software" ? "Tối ưu phần mềm" : dto.category === "thermal" ? "Vệ sinh & Tản nhiệt" : dto.category === "network" ? "Mạng LAN & Máy in" : "Mẹo vặt & Thủ thuật")
      : existing.categoryLabel;

    const updatedArticle: Article = {
      ...existing,
      slug: updatedSlug,
      title: updatedTitle,
      summary: dto.summary !== undefined ? dto.summary.trim() : existing.summary,
      content: dto.content !== undefined ? dto.content.trim() : existing.content,
      coverImageUrl: dto.coverImageUrl !== undefined ? dto.coverImageUrl.trim() || undefined : existing.coverImageUrl,
      category: updatedCategory,
      categoryLabel,
      readTime: dto.readTime !== undefined ? dto.readTime.trim() : existing.readTime,
      difficulty: dto.difficulty || existing.difficulty,
      steps: dto.steps !== undefined ? dto.steps : existing.steps,
      quickTips: dto.quickTips !== undefined ? dto.quickTips : existing.quickTips,
      status: dto.status || existing.status,
      r2ObjectKey: generateArticlePostObjectKey(updatedSlug),
      updatedAt: new Date(),
    };

    // 1. Update R2
    await putR2ArticleObject(updatedSlug, updatedArticle);

    // 2. Update PostgreSQL
    if (db.isConfigured) {
      try {
        await db.query(
          `UPDATE articles SET
            slug = $1, title = $2, summary = $3, cover_image_url = $4,
            category = $5, category_label = $6, read_time = $7, difficulty = $8,
            status = $9, r2_object_key = $10, updated_at = $11
          WHERE id = $12;`,
          [
            updatedArticle.slug,
            updatedArticle.title,
            updatedArticle.summary,
            updatedArticle.coverImageUrl || null,
            updatedArticle.category,
            updatedArticle.categoryLabel,
            updatedArticle.readTime,
            updatedArticle.difficulty,
            updatedArticle.status,
            updatedArticle.r2ObjectKey,
            updatedArticle.updatedAt,
            id,
          ]
        );
      } catch (err) {
        const config = getAppConfig();
        if (!config.allowMemoryStore) {
          throw new Error("Lỗi khi cập nhật bài viết trong PostgreSQL: " + String(err));
        }
      }
    }

    devArticlesStore.set(id, updatedArticle);
    return updatedArticle;
  }

  /**
   * Deletes an article from PostgreSQL and removes the R2 object.
   */
  async deleteArticle(id: string): Promise<boolean> {
    const existing = await this.getArticleById(id);
    if (!existing) return false;

    // 1. Remove from R2
    await deleteR2ArticleObject(existing.slug);

    // 2. Remove from PostgreSQL
    if (db.isConfigured) {
      try {
        await db.query("DELETE FROM articles WHERE id = $1;", [id]);
      } catch (err) {
        const config = getAppConfig();
        if (!config.allowMemoryStore) {
          throw new Error("Lỗi xóa bài viết trong PostgreSQL: " + String(err));
        }
      }
    }

    devArticlesStore.delete(id);
    return true;
  }

  async getArticleById(id: string): Promise<Article | null> {
    if (db.isConfigured) {
      try {
        const rows = await db.query<Record<string, unknown>>(
          "SELECT * FROM articles WHERE id = $1 LIMIT 1;",
          [id]
        );
        if (rows.length > 0) {
          return this.mapRowToArticle(rows[0]);
        }
      } catch (err) {
        const config = getAppConfig();
        if (!config.allowMemoryStore) {
          throw new Error("Lỗi đọc bài viết từ PostgreSQL: " + String(err));
        }
      }
    }

    return devArticlesStore.get(id) || null;
  }

  async getArticleBySlug(slug: string, incrementViews = false): Promise<Article | null> {
    const cleanSlug = slug.toLowerCase().trim();

    if (db.isConfigured) {
      try {
        if (incrementViews) {
          await db.query(
            "UPDATE articles SET views = views + 1 WHERE slug = $1;",
            [cleanSlug]
          );
        }

        const rows = await db.query<Record<string, unknown>>(
          "SELECT * FROM articles WHERE slug = $1 LIMIT 1;",
          [cleanSlug]
        );
        if (rows.length > 0) {
          return this.mapRowToArticle(rows[0]);
        }
      } catch (err) {
        const config = getAppConfig();
        if (!config.allowMemoryStore) {
          throw new Error("Lỗi truy vấn slug bài viết: " + String(err));
        }
      }
    }

    for (const art of devArticlesStore.values()) {
      if (art.slug === cleanSlug) {
        if (incrementViews) {
          art.views++;
        }
        return art;
      }
    }

    return null;
  }

  async listArticles(options: ListArticlesOptions = {}): Promise<PaginatedResult<Article>> {
    const { status, category, search, page = 1, pageSize = 10 } = options;

    if (db.isConfigured) {
      try {
        const conditions: string[] = [];
        const params: unknown[] = [];
        let idx = 1;

        if (status) {
          conditions.push(`status = $${idx++}`);
          params.push(status);
        }
        if (category) {
          conditions.push(`category = $${idx++}`);
          params.push(category);
        }
        if (search && search.trim()) {
          conditions.push(`(title ILIKE $${idx} OR summary ILIKE $${idx})`);
          params.push(`%${search.trim()}%`);
          idx++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const countResult = await db.query<{ count: string }>(
          `SELECT COUNT(*) as count FROM articles ${whereClause};`,
          params
        );
        const total = parseInt(countResult[0]?.count || "0", 10);

        const offset = (page - 1) * pageSize;
        params.push(pageSize, offset);
        const rows = await db.query<Record<string, unknown>>(
          `SELECT * FROM articles ${whereClause} ORDER BY published_at DESC LIMIT $${idx++} OFFSET $${idx++};`,
          params
        );

        const items = rows.map((r) => this.mapRowToArticle(r));
        return {
          items,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize) || 1,
        };
      } catch (err) {
        const config = getAppConfig();
        if (!config.allowMemoryStore) {
          throw new Error("Lỗi danh sách bài viết từ PostgreSQL: " + String(err));
        }
      }
    }

    // In-Memory Dev Store
    let filtered = Array.from(devArticlesStore.values());
    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }
    if (category) {
      filtered = filtered.filter((a) => a.category === category);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async listPublishedArticles(options: Omit<ListArticlesOptions, "status"> = {}): Promise<PaginatedResult<Article>> {
    return this.listArticles({ ...options, status: "PUBLISHED" });
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const clean = slug.toLowerCase().trim();
    if (db.isConfigured) {
      try {
        const query = excludeId
          ? "SELECT id FROM articles WHERE slug = $1 AND id != $2 LIMIT 1;"
          : "SELECT id FROM articles WHERE slug = $1 LIMIT 1;";
        const params = excludeId ? [clean, excludeId] : [clean];
        const rows = await db.query(query, params);
        return rows.length > 0;
      } catch {
        // Fall back to dev check
      }
    }

    for (const art of devArticlesStore.values()) {
      if (art.slug === clean && (!excludeId || art.id !== excludeId)) {
        return true;
      }
    }
    return false;
  }

  private mapRowToArticle(row: Record<string, unknown>): Article {
    // Attempt to parse steps and tips if attached or fetch from dev store by slug or id
    const devMatch =
      Array.from(devArticlesStore.values()).find(
        (a) => a.slug === String(row.slug)
      ) || devArticlesStore.get(String(row.id));

    return {
      id: String(row.id),
      slug: String(row.slug),
      title: String(row.title),
      summary: String(row.summary),
      content: devMatch?.content || String(row.summary),
      coverImageUrl:
        devMatch?.coverImageUrl ||
        (row.cover_image_url ? String(row.cover_image_url) : `/cam-nang/${row.slug}.webp`),
      category: row.category as ArticleCategory,
      categoryLabel: String(row.category_label || devMatch?.categoryLabel || "Cẩm nang"),
      readTime: String(row.read_time || devMatch?.readTime || "5 phút"),
      difficulty: (row.difficulty as Article["difficulty"]) || devMatch?.difficulty || "Trung bình",
      steps: devMatch?.steps || [],
      quickTips: devMatch?.quickTips || [],
      status: row.status as ArticleStatus,
      views: parseInt(String(row.views || "0"), 10),
      r2ObjectKey: String(row.r2_object_key),
      authorId: row.author_id ? String(row.author_id) : undefined,
      publishedAt: new Date(String(row.published_at)),
      createdAt: new Date(String(row.created_at)),
      updatedAt: new Date(String(row.updated_at)),
    };
  }

  clearDevStore(): void {
    devArticlesStore.clear();
  }

  get devStoreCount(): number {
    return devArticlesStore.size;
  }
}

export const articleRepo = new ArticleRepository();
