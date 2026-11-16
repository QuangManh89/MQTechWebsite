import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  slugify,
  validateArticleInput,
} from "../src/lib/validations/article.ts";
import { articleRepo } from "../src/lib/db/article-repository.ts";
import {
  validateMediaUpload,
  generateArticleImageObjectKey,
  generateArticlePostObjectKey,
  putR2ArticleObject,
  getR2ArticleObject,
  deleteR2ArticleObject,
} from "../src/lib/storage/r2.ts";

describe("Cloudflare R2 Article & Media Publishing System", () => {
  beforeEach(() => {
    // Reset or ensure repository state is ready
  });

  describe("1. Slugify & Article Input Validation", () => {
    test("should cleanly convert Vietnamese titles with diacritics into URL-safe slugs", () => {
      const input = "Cấp cứu Laptop bị vào nước hoặc đổ cà phê";
      const slug = slugify(input);
      assert.equal(slug, "cap-cuu-laptop-bi-vao-nuoc-hoac-do-ca-phe");

      const inputWithD = "Đo kiểm dòng và chẩn đoán bo mạch";
      assert.equal(slugify(inputWithD), "do-kiem-dong-va-chan-doan-bo-mach");
    });

    test("should validate correct article payload with steps and tips", () => {
      const result = validateArticleInput({
        title: "Hướng dẫn thay keo tản nhiệt CPU đúng cách",
        summary: "Chi tiết các bước làm sạch bề mặt tản nhiệt và bôi lượng keo vừa đủ.",
        content: "## Các bước thực hiện\n\nNội dung chi tiết ở đây...",
        category: "thermal",
        steps: [
          { number: "01", action: "Tháo tản nhiệt", detail: "Nới lỏng ốc vít theo đường chéo" },
          { number: "02", action: "Lau sạch keo cũ", detail: "Dùng cồn Isopropyl 90 độ" },
        ],
        quickTips: ["Không bôi quá nhiều keo làm tràn sang socket"],
      });

      assert.equal(result.valid, true);
      assert.ok(result.sanitized);
      assert.equal(result.sanitized.slug, "huong-dan-thay-keo-tan-nhiet-cpu-dung-cach");
      assert.equal(result.sanitized.category, "thermal");
      assert.equal(result.sanitized.categoryLabel, "Vệ sinh & Tản nhiệt");
      assert.equal(result.sanitized.steps.length, 2);
    });

    test("should reject missing or invalid article fields", () => {
      const result = validateArticleInput({
        title: "Ngắn",
        summary: "",
        content: "",
        category: "invalid_category",
      });

      assert.equal(result.valid, false);
      assert.ok(result.errors.title);
      assert.ok(result.errors.summary);
      assert.ok(result.errors.content);
      assert.ok(result.errors.category);
    });
  });

  describe("2. R2 3-Bucket Storage Key & Object Helpers", () => {
    test("should generate correct object key for article images on mqtech-media-staging", () => {
      const { mediaId, objectKey, bucketName } = generateArticleImageObjectKey("laptop-mainboard.webp");
      assert.ok(mediaId);
      assert.ok(objectKey.startsWith("articles/images/"));
      assert.ok(objectKey.endsWith("laptop-mainboard.webp"));
      assert.equal(bucketName, "mqtech-media-staging");
    });

    test("should generate standardized object key for article JSON bundles", () => {
      const key = generateArticlePostObjectKey("cap-cuu-laptop-vo-nuoc");
      assert.equal(key, "articles/posts/cap-cuu-laptop-vo-nuoc.json");
    });

    test("should store and retrieve article JSON bundle in R2 store", async () => {
      const testSlug = "test-r2-persistence-article";
      const testArticle = {
        id: "11111111-2222-3333-4444-555555555555",
        slug: testSlug,
        title: "Bài viết kiểm thử R2",
        summary: "Tóm tắt kiểm thử lưu trữ trên R2",
        content: "Nội dung bài viết trên R2",
        category: "hardware",
        categoryLabel: "Cấp cứu phần cứng",
        readTime: "3 phút đọc",
        difficulty: "Dễ",
        steps: [],
        quickTips: [],
        status: "PUBLISHED",
        views: 10,
        r2ObjectKey: `articles/posts/${testSlug}.json`,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const putRes = await putR2ArticleObject(testSlug, testArticle);
      assert.equal(putRes.success, true);
      assert.equal(putRes.objectKey, `articles/posts/${testSlug}.json`);

      const fetched = await getR2ArticleObject(testSlug);
      assert.ok(fetched);
      assert.equal(fetched.title, "Bài viết kiểm thử R2");

      const deleted = await deleteR2ArticleObject(testSlug);
      assert.equal(deleted, true);

      const afterDelete = await getR2ArticleObject(testSlug);
      assert.equal(afterDelete, null);
    });

    test("should enforce strict MIME allowlist and reject SVG & executables on image uploads", () => {
      const validJpg = validateMediaUpload({
        fileName: "fan-dust.jpg",
        contentType: "image/jpeg",
        sizeBytes: 1024 * 500,
        category: "SERVICE_ASSET",
        visibility: "PUBLIC",
      });
      assert.equal(validJpg.valid, true);

      const invalidSvg = validateMediaUpload({
        fileName: "malicious.svg",
        contentType: "image/svg+xml",
        sizeBytes: 1024,
        category: "SERVICE_ASSET",
        visibility: "PUBLIC",
      });
      assert.equal(invalidSvg.valid, false);
      assert.ok(invalidSvg.error?.includes("SVG"));

      const oversized = validateMediaUpload({
        fileName: "huge.png",
        contentType: "image/png",
        sizeBytes: 6 * 1024 * 1024, // 6MB > 5MB
        category: "SERVICE_ASSET",
        visibility: "PUBLIC",
      });
      assert.equal(oversized.valid, false);
      assert.ok(oversized.error?.includes("Dung lượng tệp vượt quá"));
    });
  });

  describe("3. Article Repository CRUD & Synchronization", () => {
    test("should pre-seed initial articles from GUIDE_ARTICLES", async () => {
      const result = await articleRepo.listPublishedArticles();
      assert.ok(result.total >= 3, "Must have pre-seeded articles");
      const liquidSpill = await articleRepo.getArticleBySlug("liquid-spill-emergency");
      assert.ok(liquidSpill, "liquid-spill-emergency article must exist");
      assert.equal(liquidSpill.category, "hardware");
    });

    test("should create, read, update, and delete an article in repository", async () => {
      const newArticle = await articleRepo.createArticle(
        {
          title: "Khắc phục quạt Laptop kêu to bất thường tại Buôn Ma Thuột",
          summary: "Nguyên nhân quạt laptop gầm rú liên tục do kẹt bụi hoặc khô dầu trục quay.",
          content: "## Nguyên nhân chính\n\n1. Bụi bám kín khe thoát gió\n2. Khô dầu bôi trơn",
          category: "thermal",
          readTime: "4 phút đọc",
          difficulty: "Trung bình",
          status: "PUBLISHED",
          steps: [{ number: "01", action: "Kiểm tra khe gió", detail: "Dùng đèn pin soi" }],
        },
        { id: "admin", fullName: "KTV Admin" }
      );

      assert.ok(newArticle.id);
      assert.equal(newArticle.slug, "khac-phuc-quat-laptop-keu-to-bat-thuong-tai-buon-ma-thuot");
      assert.equal(newArticle.status, "PUBLISHED");

      // Read by slug with view increment
      const fetched = await articleRepo.getArticleBySlug(newArticle.slug, true);
      assert.ok(fetched);
      assert.equal(fetched.views, 1);

      // Update article
      const updated = await articleRepo.updateArticle(newArticle.id, {
        summary: "Đã cập nhật tóm tắt mới sau kiểm tra thực tế.",
        status: "DRAFT",
      });
      assert.ok(updated);
      assert.equal(updated.summary, "Đã cập nhật tóm tắt mới sau kiểm tra thực tế.");
      assert.equal(updated.status, "DRAFT");

      // Draft article should not appear in listPublishedArticles
      const published = await articleRepo.listPublishedArticles({ search: "quạt Laptop kêu to" });
      const foundInPublished = published.items.some((a) => a.id === newArticle.id);
      assert.equal(foundInPublished, false, "Draft article must not be in published list");

      // Delete article
      const deleted = await articleRepo.deleteArticle(newArticle.id);
      assert.equal(deleted, true);

      const afterDelete = await articleRepo.getArticleById(newArticle.id);
      assert.equal(afterDelete, null);
    });
  });

  describe("4. Administrative API Security & Endpoints", () => {
    test("should deny unauthenticated requests to article management endpoints with 401", async () => {
      const { GET: getArticles } = await import("../src/app/api/admin/articles/route.ts");
      const fakeReq = new Request("http://localhost:3000/api/admin/articles");
      const res = await getArticles(fakeReq);
      assert.equal(res.status, 401);
    });

    test("should deny unauthenticated requests to media presign-put endpoint with 401", async () => {
      const { POST: presignPut } = await import("../src/app/api/admin/media/presign-put/route.ts");
      const fakeReq = new Request("http://localhost:3000/api/admin/media/presign-put", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          "content-type": "application/json",
        },
        body: JSON.stringify({ fileName: "photo.jpg", contentType: "image/jpeg", sizeBytes: 100 }),
      });
      const res = await presignPut(fakeReq);
      assert.equal(res.status, 401);
    });
  });
});
