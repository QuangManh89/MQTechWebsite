import type { ArticleCategory, ArticleStatus, ArticleStep } from "../db/types.ts";

export const ARTICLE_CATEGORIES: Record<
  ArticleCategory,
  { label: string; description: string }
> = {
  hardware: {
    label: "Cấp cứu phần cứng",
    description: "Sơ cứu thiết bị rơi vỡ, vô nước, chập nguồn, sự cố linh kiện",
  },
  software: {
    label: "Tối ưu phần mềm",
    description: "Xử lý lỗi hệ điều hành Windows, virus, màn hình xanh BSOD",
  },
  thermal: {
    label: "Vệ sinh & Tản nhiệt",
    description: "Bảo dưỡng quạt tản nhiệt, hạ nhiệt độ CPU/GPU, chống quá nhiệt",
  },
  network: {
    label: "Mạng LAN & Máy in",
    description: "Kết nối mạng nội bộ, chia sẻ máy in, cấu hình WiFi router",
  },
  tips: {
    label: "Mẹo vặt & Thủ thuật",
    description: "Kinh nghiệm sử dụng máy tính hiệu quả, kéo dài tuổi thọ thiết bị",
  },
};

/**
 * Converts a Vietnamese or English title to a clean, URL-safe slug.
 * Removes Vietnamese diacritics, special characters, and joins with hyphens.
 */
export function slugify(text: string): string {
  if (!text || typeof text !== "string") return "";

  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove combining diacritical marks
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric except space and hyphen
    .replace(/[\s_-]+/g, "-") // Replace multiple spaces or underscores with single hyphen
    .replace(/^-+|-+$/g, ""); // Trim leading and trailing hyphens
}

export interface CreateArticleDTO {
  title: string;
  slug?: string;
  summary: string;
  content: string;
  coverImageUrl?: string;
  category: ArticleCategory;
  readTime?: string;
  difficulty?: "Dễ" | "Trung bình" | "Cần hỗ trợ kỹ thuật";
  steps?: ArticleStep[];
  quickTips?: string[];
  status?: ArticleStatus;
}

export type UpdateArticleDTO = Partial<CreateArticleDTO>;

export interface ArticleValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    title: string;
    slug: string;
    summary: string;
    content: string;
    coverImageUrl?: string;
    category: ArticleCategory;
    categoryLabel: string;
    readTime: string;
    difficulty: "Dễ" | "Trung bình" | "Cần hỗ trợ kỹ thuật";
    steps: ArticleStep[];
    quickTips: string[];
    status: ArticleStatus;
  };
}

export function validateArticleInput(input: CreateArticleDTO): ArticleValidationResult {
  const errors: Record<string, string> = {};

  const title = (input.title || "").trim();
  if (!title) {
    errors.title = "Tiêu đề bài viết không được để trống.";
  } else if (title.length < 5) {
    errors.title = "Tiêu đề bài viết phải có ít nhất 5 ký tự.";
  } else if (title.length > 200) {
    errors.title = "Tiêu đề bài viết không được vượt quá 200 ký tự.";
  }

  const rawSlug = (input.slug || "").trim();
  const slug = slugify(rawSlug || title);
  if (!slug) {
    errors.slug = "Đường dẫn bài viết (slug) không hợp lệ.";
  } else if (slug.length < 3) {
    errors.slug = "Slug bài viết quá ngắn.";
  }

  const summary = (input.summary || "").trim();
  if (!summary) {
    errors.summary = "Đoạn tóm tắt bài viết không được để trống.";
  } else if (summary.length < 10) {
    errors.summary = "Tóm tắt bài viết phải có ít nhất 10 ký tự.";
  } else if (summary.length > 500) {
    errors.summary = "Tóm tắt bài viết không được vượt quá 500 ký tự.";
  }

  const content = (input.content || "").trim();
  if (!content) {
    errors.content = "Nội dung bài viết không được để trống.";
  } else if (content.length < 20) {
    errors.content = "Nội dung bài viết phải có ít nhất 20 ký tự.";
  }

  const category = input.category;
  if (!category || !ARTICLE_CATEGORIES[category]) {
    errors.category = "Chuyên mục bài viết không hợp lệ.";
  }

  const categoryLabel = ARTICLE_CATEGORIES[category]?.label || "Cẩm nang kỹ thuật";
  const readTime = (input.readTime || "5 phút").trim();
  const difficulty = input.difficulty || "Trung bình";
  const status = input.status || "PUBLISHED";
  const coverImageUrl = (input.coverImageUrl || "").trim() || undefined;

  const steps: ArticleStep[] = Array.isArray(input.steps)
    ? input.steps
        .filter((st) => st && typeof st.action === "string" && st.action.trim())
        .map((st, i) => ({
          number: String(st.number || i + 1).padStart(2, "0"),
          action: st.action.trim(),
          detail: (st.detail || "").trim(),
          warning: st.warning ? st.warning.trim() : undefined,
        }))
    : [];

  const quickTips: string[] = Array.isArray(input.quickTips)
    ? input.quickTips
        .filter((tip) => typeof tip === "string" && tip.trim())
        .map((tip) => tip.trim())
    : [];

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    sanitized: {
      title,
      slug,
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
    },
  };
}
