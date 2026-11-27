export type SeoCheckStatus = "pass" | "warn" | "fail";
export type SeoGrade = "good" | "ok" | "poor";

export interface SeoCheckItem {
  id: string;
  label: string;
  status: SeoCheckStatus;
  points: number;
  maxPoints: number;
  message: string;
  critical?: boolean;
}

export interface SeoAnalysisInput {
  id?: number;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  galleryImages?: string | null;
  focusKeyword?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface ExistingPostKeywordRef {
  id: number;
  title: string;
  slug?: string;
  focusKeyword?: string | null;
}

export interface SeoAnalysisResult {
  score: number;
  grade: SeoGrade;
  wordCount: number;
  keywordCount: number;
  keywordDensity: number;
  internalLinkCount: number;
  faqCount: number;
  effectiveTitle: string;
  effectiveDescription: string;
  cannibalizationMatches: Array<{ id: number; title: string }>;
  groups: {
    basic: SeoCheckItem[];
    additional: SeoCheckItem[];
    readability: SeoCheckItem[];
  };
  failingCriticalChecks: SeoCheckItem[];
}

export function removeVietnameseDiacritics(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function normalizeForMatch(input: string): string {
  return removeVietnameseDiacritics(input)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugifyVietnamese(input: string): string {
  return removeVietnameseDiacritics(input)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripMarkdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, " $1 ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, " $1 ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>|~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findWholePhraseIndex(haystackNorm: string, keywordNorm: string): number {
  if (!haystackNorm || !keywordNorm) return -1;
  const escaped = keywordNorm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(?:^|\\s)(${escaped})(?=\\s|$)`);
  const match = regex.exec(haystackNorm);
  if (!match || match.index === undefined) return -1;
  return match[0].startsWith(" ") ? match.index + 1 : match.index;
}

function countKeywordMatchRatio(haystackNorm: string, keywordNorm: string): number {
  if (!keywordNorm || !haystackNorm) return 0;
  if (findWholePhraseIndex(haystackNorm, keywordNorm) !== -1) return 1;
  const kwTokens = keywordNorm.split(" ").filter((t) => t.length >= 2);
  if (kwTokens.length === 0) return 0;
  const haystackSet = new Set(haystackNorm.split(" "));
  const matched = kwTokens.filter((t) => haystackSet.has(t)).length;
  return matched / kwTokens.length;
}

function countOccurrences(haystackNorm: string, keywordNorm: string): number {
  if (!haystackNorm || !keywordNorm) return 0;
  const escaped = keywordNorm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(?:^|\\s)${escaped}(?=\\s|$)`, "g");
  const matches = haystackNorm.match(regex);
  return matches ? matches.length : 0;
}

function countFaqQuestions(markdown: string): number {
  const faqHeadingMatch = markdown.match(
    /^##\s+Câu\s+Hỏi\s+Thường\s+Gặp\s*$/im
  );
  if (!faqHeadingMatch || faqHeadingMatch.index === undefined) return 0;

  const afterHeading = markdown.slice(
    faqHeadingMatch.index + faqHeadingMatch[0].length
  );
  const sectionEndMatch = afterHeading.match(/\n(?:---+|##\s+)/);
  const faqBlock = sectionEndMatch
    ? afterHeading.slice(0, sectionEndMatch.index)
    : afterHeading;

  const questionRegex =
    /(?:^|\n)(?:\*\*\s*(?:\d+\.\s*)?([^*\n]+\?)\s*\*\*|###\s*(?:\d+\.\s*)?([^\n]+\?))\s*\n+([\s\S]*?)(?=\n(?:\*\*\s*(?:\d+\.\s*)?[^*\n]+\?\s*\*\*|###\s*(?:\d+\.\s*)?[^\n]+\?)|$)/g;

  let validCount = 0;
  let match: RegExpExecArray | null;
  while ((match = questionRegex.exec(faqBlock)) !== null) {
    const q = (match[1] || match[2] || "").trim();
    const a = (match[3] || "").trim();
    if (q && a) validCount += 1;
  }
  return validCount;
}

export function analyzePostSeo(
  input: SeoAnalysisInput,
  existingPosts: ExistingPostKeywordRef[] = []
): SeoAnalysisResult {
  const title = (input.title || "").trim();
  const slug = (input.slug || "").trim();
  const excerpt = (input.excerpt || "").trim();
  const content = (input.content || "").trim();
  const coverImage = (input.coverImage || "").trim();
  const focusKeyword = (input.focusKeyword || "").trim();
  const effectiveTitle = (input.seoTitle || "").trim() || title;
  const effectiveDescription = (input.seoDescription || "").trim() || excerpt;

  const kwNorm = normalizeForMatch(focusKeyword);
  const hasKeyword = kwNorm.length >= 2;

  const plainText = stripMarkdownToPlainText(content);
  const words = plainText ? plainText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const first100WordsNorm = normalizeForMatch(words.slice(0, 100).join(" "));
  const fullContentNorm = normalizeForMatch(plainText);

  const kwWordLen = kwNorm ? kwNorm.split(" ").length : 0;
  const keywordCount = hasKeyword ? countOccurrences(fullContentNorm, kwNorm) : 0;
  const keywordDensity =
    wordCount > 0 && keywordCount > 0
      ? Number((((keywordCount * kwWordLen) / wordCount) * 100).toFixed(2))
      : 0;

  // Cannibalization detection across other posts
  const cannibalizationMatches = hasKeyword
    ? existingPosts
        .filter((p) => {
          if (input.id && p.id === input.id) return false;
          const otherKw = normalizeForMatch(p.focusKeyword || "");
          return otherKw.length >= 2 && otherKw === kwNorm;
        })
        .map((p) => ({ id: p.id, title: p.title }))
    : [];

  // Extract headings, internal links, images, tables/lists, FAQ
  const headingMatches = [...content.matchAll(/^(#{2,3})\s+(.+)$/gm)];
  const h2Count = headingMatches.filter((m) => m[1] === "##").length;
  const headingHasKeyword =
    hasKeyword &&
    headingMatches.some(
      (m) => countKeywordMatchRatio(normalizeForMatch(m[2]), kwNorm) >= 0.75
    );

  const internalLinkMatches = [
    ...content.matchAll(
      /\[[^\]]+\]\((\/(?:dich-vu|bai-viet|bang-gia|dat-lich|kiem-tra-may-tinh|tra-cuu|lien-he|gioi-thieu)[^)\s]*|https?:\/\/(?:www\.)?suamaytinhbmt\.id\.vn[^)\s]*)\)/gi
    ),
  ];
  const internalLinkCount = internalLinkMatches.length;

  const inlineImageMatches = [...content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
  const uniqueMediaUrls = new Set<string>();
  if (coverImage) uniqueMediaUrls.add(coverImage);
  for (const m of inlineImageMatches) {
    const src = (m[2] || "").trim();
    if (src) uniqueMediaUrls.add(src);
  }
  try {
    if (input.galleryImages) {
      const parsed = JSON.parse(input.galleryImages);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item.url === "string" && item.url.trim()) {
            uniqueMediaUrls.add(item.url.trim());
          }
        }
      }
    }
  } catch {
    // ignore invalid gallery JSON
  }
  const hasBlankInlineAlt = inlineImageMatches.some(
    (m) => (m[1] || "").trim().length === 0
  );

  const faqCount = countFaqQuestions(content);

  const hasMarkdownTable = /^\|.+\|\s*\n\|[\s:|-]+\|/m.test(content);
  const hasList = /^(?:[-*]|\d+\.)\s+/m.test(content);

  // =========================================================================
  // GROUP 1: BASIC SEO (50 points)
  // =========================================================================
  const basic: SeoCheckItem[] = [];

  // 1. Focus keyword set (6 pts)
  basic.push({
    id: "focus-keyword-set",
    label: "Từ khóa chính (Focus Keyword)",
    status: hasKeyword ? "pass" : "fail",
    points: hasKeyword ? 6 : 0,
    maxPoints: 6,
    critical: true,
    message: hasKeyword
      ? `Đang tối ưu cho "${focusKeyword}".`
      : "Chưa nhập Từ khóa chính — hãy điền cụm từ khách hay tìm trên Google.",
  });

  // 2. Keyword in SEO Title (10 pts)
  const titleNorm = normalizeForMatch(effectiveTitle);
  const titleIdx = hasKeyword ? findWholePhraseIndex(titleNorm, kwNorm) : -1;
  const titleRatio = hasKeyword ? countKeywordMatchRatio(titleNorm, kwNorm) : 0;
  if (!hasKeyword) {
    basic.push({
      id: "kw-in-title",
      label: "Từ khóa trong SEO Title",
      status: "fail",
      points: 0,
      maxPoints: 10,
      critical: true,
      message: "Nhập Từ khóa chính để kiểm tra SEO Title.",
    });
  } else if (titleIdx !== -1 && titleIdx <= Math.floor(titleNorm.length * 0.6)) {
    basic.push({
      id: "kw-in-title",
      label: "Từ khóa trong SEO Title",
      status: "pass",
      points: 10,
      maxPoints: 10,
      message: "Tuyệt vời! Từ khóa chính nằm ngay phần đầu SEO Title.",
    });
  } else if (titleIdx !== -1 || titleRatio >= 0.75) {
    basic.push({
      id: "kw-in-title",
      label: "Từ khóa trong SEO Title",
      status: "warn",
      points: 7,
      maxPoints: 10,
      message:
        "Từ khóa đã có trong SEO Title, nên đưa gần đầu tiêu đề hơn để tăng CTR.",
    });
  } else {
    basic.push({
      id: "kw-in-title",
      label: "Từ khóa trong SEO Title",
      status: "fail",
      points: 0,
      maxPoints: 10,
      critical: true,
      message: "Chưa thấy Từ khóa chính trong SEO Title.",
    });
  }

  // 3. Keyword in SEO Description (8 pts)
  const descNorm = normalizeForMatch(effectiveDescription);
  const descRatio = hasKeyword ? countKeywordMatchRatio(descNorm, kwNorm) : 0;
  basic.push({
    id: "kw-in-desc",
    label: "Từ khóa trong SEO Description",
    status: !hasKeyword
      ? "fail"
      : descRatio >= 0.75
        ? "pass"
        : "fail",
    points: hasKeyword && descRatio >= 0.75 ? 8 : 0,
    maxPoints: 8,
    critical: true,
    message: !hasKeyword
      ? "Nhập Từ khóa chính để kiểm tra mô tả."
      : descRatio >= 0.75
        ? "Từ khóa chính đã xuất hiện trong SEO Description."
        : "Hãy chèn tự nhiên Từ khóa chính vào SEO Description.",
  });

  // 4. Keyword in Slug URL (8 pts)
  const slugNorm = normalizeForMatch(slug.replace(/-/g, " "));
  const slugRatio = hasKeyword ? countKeywordMatchRatio(slugNorm, kwNorm) : 0;
  basic.push({
    id: "kw-in-slug",
    label: "Từ khóa trong Slug URL",
    status: !hasKeyword
      ? "fail"
      : slugRatio >= 0.75
        ? "pass"
        : "fail",
    points: hasKeyword && slugRatio >= 0.75 ? 8 : 0,
    maxPoints: 8,
    message: !hasKeyword
      ? "Nhập Từ khóa chính để kiểm tra URL."
      : slugRatio >= 0.75
        ? `Slug "/bai-viet/${slug}" khớp tốt với từ khóa chính.`
        : "Slug URL chưa chứa đủ từ khóa chính — hãy bấm 'Tạo slug' hoặc chỉnh gọn lại.",
  });

  // 5. Keyword in first 100 words (8 pts)
  const introRatio = hasKeyword
    ? countKeywordMatchRatio(first100WordsNorm, kwNorm)
    : 0;
  basic.push({
    id: "kw-in-intro",
    label: "Từ khóa trong 100 từ đầu tiên",
    status: !hasKeyword
      ? "fail"
      : introRatio >= 0.75
        ? "pass"
        : "fail",
    points: hasKeyword && introRatio >= 0.75 ? 8 : 0,
    maxPoints: 8,
    message: !hasKeyword
      ? "Nhập Từ khóa chính để kiểm tra đoạn mở đầu."
      : introRatio >= 0.75
        ? "Đoạn mở đầu đã chứa từ khóa chính (tốt cho AI Overviews & Snippet)."
        : "Nên nhắc đến Từ khóa chính ngay trong 2–3 câu đầu tiên của bài viết.",
  });

  // 6. Content word count (10 pts)
  const wcStatus: SeoCheckStatus =
    wordCount >= 800 ? "pass" : wordCount >= 500 ? "warn" : "fail";
  basic.push({
    id: "word-count",
    label: "Độ dài nội dung bài viết",
    status: wcStatus,
    points: wordCount >= 800 ? 10 : wordCount >= 500 ? 6 : 0,
    maxPoints: 10,
    critical: wordCount < 500,
    message:
      wordCount >= 800
        ? `Nội dung đạt ${wordCount} từ (chuẩn sâu ≥ 800 từ).`
        : wordCount >= 500
          ? `Hiện có ${wordCount} từ — bổ sung thêm lên ≥ 800 từ để tăng sức cạnh tranh.`
          : `Nội dung quá mỏng (${wordCount} từ) — cần tối thiểu 500–800 từ để tránh Thin Content.`,
  });

  // =========================================================================
  // GROUP 2: ADDITIONAL SEO (30 points)
  // =========================================================================
  const additional: SeoCheckItem[] = [];

  // 7. Keyword in H2/H3 (6 pts)
  additional.push({
    id: "kw-in-heading",
    label: "Từ khóa trong tiêu đề phụ (H2/H3)",
    status: headingHasKeyword ? "pass" : "fail",
    points: headingHasKeyword ? 6 : 0,
    maxPoints: 6,
    message: headingHasKeyword
      ? "Đã có tiêu đề phụ (## / ###) chứa từ khóa chính."
      : "Hãy đưa từ khóa chính vào ít nhất 1 tiêu đề phụ (## hoặc ###).",
  });

  // 8. Keyword density (6 pts)
  let densityStatus: SeoCheckStatus = "fail";
  let densityPoints = 0;
  let densityMsg = "Nhập Từ khóa chính và nội dung để đo mật độ.";
  if (hasKeyword && wordCount > 0) {
    if (keywordDensity >= 0.5 && keywordDensity <= 2.5) {
      densityStatus = "pass";
      densityPoints = 6;
      densityMsg = `Mật độ ${keywordDensity}% (${keywordCount} lần) — tự nhiên, chuẩn SEO (0.5%–2.5%).`;
    } else if (
      (keywordDensity >= 0.2 && keywordDensity < 0.5) ||
      (keywordDensity > 2.5 && keywordDensity <= 3.5)
    ) {
      densityStatus = "warn";
      densityPoints = 3;
      densityMsg =
        keywordDensity < 0.5
          ? `Mật độ hơi thấp (${keywordDensity}%, ${keywordCount} lần) — nên nhắc thêm 1–2 lần tự nhiên.`
          : `Mật độ hơi cao (${keywordDensity}%) — nên giảm nhẹ để tránh bị đánh giá nhồi từ khóa.`;
    } else if (keywordDensity > 3.5) {
      densityStatus = "fail";
      densityPoints = 0;
      densityMsg = `Cảnh báo nhồi nhét từ khóa (${keywordDensity}%) — cần giảm xuống dưới 2.5%.`;
    } else {
      densityStatus = "fail";
      densityPoints = 0;
      densityMsg = `Từ khóa xuất hiện quá ít (${keywordCount} lần, ${keywordDensity}%).`;
    }
  }
  additional.push({
    id: "kw-density",
    label: "Mật độ từ khóa (Keyword Density)",
    status: densityStatus,
    points: densityPoints,
    maxPoints: 6,
    message: densityMsg,
  });

  // 9. Internal links (6 pts)
  const linkStatus: SeoCheckStatus =
    internalLinkCount >= 2 ? "pass" : internalLinkCount === 1 ? "warn" : "fail";
  additional.push({
    id: "internal-links",
    label: "Liên kết nội bộ (Internal Links)",
    status: linkStatus,
    points: internalLinkCount >= 2 ? 6 : internalLinkCount === 1 ? 3 : 0,
    maxPoints: 6,
    critical: internalLinkCount === 0,
    message:
      internalLinkCount >= 2
        ? `Tốt! Có ${internalLinkCount} liên kết nội bộ trỏ về dịch vụ/bài viết.`
        : internalLinkCount === 1
          ? "Mới có 1 link nội bộ — thêm ít nhất 1 link tới /dat-lich, /bang-gia hoặc /dich-vu/..."
          : "Chưa có liên kết nội bộ — hãy chèn link về trang dịch vụ & /dat-lich.",
  });

  // 10. Images & Alt text (6 pts)
  const hasCover = coverImage.length > 0;
  const totalMedia = uniqueMediaUrls.size;
  const imgStatus: SeoCheckStatus =
    hasCover && !hasBlankInlineAlt
      ? "pass"
      : hasCover
        ? "warn"
        : "fail";
  additional.push({
    id: "media-alt",
    label: "Ảnh bìa & Alt Text hình ảnh",
    status: imgStatus,
    points: imgStatus === "pass" ? 6 : imgStatus === "warn" ? 4 : 0,
    maxPoints: 6,
    message: !hasCover
      ? "Thiếu ảnh bìa bài viết (Cover Image)."
      : hasBlankInlineAlt
        ? "Có ảnh chèn trong bài chưa điền mô tả Alt ![mô tả](url)."
        : `Đã có ảnh bìa (${totalMedia} ảnh) với đầy đủ thuộc tính Alt.`,
  });

  // 11. FAQ section for FAQPage JSON-LD (6 pts)
  const faqStatus: SeoCheckStatus =
    faqCount >= 2 ? "pass" : faqCount === 1 ? "warn" : "fail";
  additional.push({
    id: "faq-schema",
    label: "Mục FAQ (tự bật FAQPage Schema)",
    status: faqStatus,
    points: faqCount >= 2 ? 6 : faqCount === 1 ? 3 : 0,
    maxPoints: 6,
    message:
      faqCount >= 2
        ? `Tuyệt vời! Nhận diện ${faqCount} câu hỏi → Tự động xuất Schema FAQPage.`
        : faqCount === 1
          ? "Mới có 1 câu hỏi trong mục FAQ — nên bổ sung thêm ít nhất 1 câu nữa (≥ 2 câu) để tối ưu FAQPage Schema."
          : "Chưa có mục '## Câu Hỏi Thường Gặp' (≥ 2 câu kèm trả lời) — bấm nút 'FAQ' trên thanh công cụ để chèn nhanh.",
  });

  // =========================================================================
  // GROUP 3: TITLE & READABILITY (20 points)
  // =========================================================================
  const readability: SeoCheckItem[] = [];

  // 12. SEO Title length (7 pts)
  const titleLen = effectiveTitle.length;
  const titleLenStatus: SeoCheckStatus =
    titleLen >= 45 && titleLen <= 60
      ? "pass"
      : (titleLen >= 35 && titleLen < 45) || (titleLen > 60 && titleLen <= 70)
        ? "warn"
        : "fail";
  readability.push({
    id: "title-length",
    label: "Độ dài SEO Title (45–60 ký tự)",
    status: titleLenStatus,
    points: titleLenStatus === "pass" ? 7 : titleLenStatus === "warn" ? 4 : 0,
    maxPoints: 7,
    message:
      titleLenStatus === "pass"
        ? `Chuẩn hiển thị Google (${titleLen}/60 ký tự).`
        : titleLen < 45
          ? `Hơi ngắn (${titleLen} ký tự) — nên viết 45–60 ký tự để tận dụng không gian SERP.`
          : `Hơi dài (${titleLen} ký tự) — Google có thể cắt bớt bằng dấu "...".`,
  });

  // 13. SEO Description length (7 pts)
  const descLen = effectiveDescription.length;
  const descLenStatus: SeoCheckStatus =
    descLen >= 130 && descLen <= 160
      ? "pass"
      : (descLen >= 100 && descLen < 130) || (descLen > 160 && descLen <= 175)
        ? "warn"
        : "fail";
  readability.push({
    id: "desc-length",
    label: "Độ dài SEO Description (130–160 ký tự)",
    status: descLenStatus,
    points: descLenStatus === "pass" ? 7 : descLenStatus === "warn" ? 4 : 0,
    maxPoints: 7,
    message:
      descLenStatus === "pass"
        ? `Chuẩn đoạn mô tả Google (${descLen}/160 ký tự).`
        : descLen < 130
          ? `Hơi ngắn (${descLen} ký tự) — nên viết 130–160 ký tự kèm ưu đãi/khu vực BMT.`
          : `Hơi dài (${descLen} ký tự) — nên rút gọn dưới 160 ký tự để không bị cắt.`,
  });

  // 14. Structured readability (6 pts)
  const readStructStatus: SeoCheckStatus =
    h2Count >= 2 && (hasMarkdownTable || hasList)
      ? "pass"
      : h2Count >= 1 || hasList || hasMarkdownTable
        ? "warn"
        : "fail";
  readability.push({
    id: "readability-structure",
    label: "Bố cục dễ đọc (H2 + Bảng / Danh sách)",
    status: readStructStatus,
    points:
      readStructStatus === "pass" ? 6 : readStructStatus === "warn" ? 3 : 0,
    maxPoints: 6,
    message:
      readStructStatus === "pass"
        ? `Cấu trúc rõ ràng (${h2Count} mục H2${hasMarkdownTable ? ", có Bảng đối chiếu" : ""}${hasList ? ", có Danh sách" : ""}).`
        : "Nên chia ít nhất 2 mục H2 (##) kèm bảng giá hoặc danh sách gạch đầu dòng.",
  });

  const allChecks = [...basic, ...additional, ...readability];
  const score = Math.min(
    100,
    allChecks.reduce((sum, item) => sum + item.points, 0)
  );
  const grade: SeoGrade = score >= 80 ? "good" : score >= 50 ? "ok" : "poor";

  const criticalFailures = allChecks.filter(
    (item) => item.status === "fail" && item.critical
  );
  const failingCriticalChecks = (
    criticalFailures.length > 0
      ? criticalFailures
      : allChecks.filter((item) => item.status !== "pass")
  ).slice(0, 3);

  return {
    score,
    grade,
    wordCount,
    keywordCount,
    keywordDensity,
    internalLinkCount,
    faqCount,
    effectiveTitle,
    effectiveDescription,
    cannibalizationMatches,
    groups: {
      basic,
      additional,
      readability,
    },
    failingCriticalChecks,
  };
}
