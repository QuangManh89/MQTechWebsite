"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Monitor,
  Search,
  Smartphone,
  Sparkles,
} from "lucide-react";
import type { SeoAnalysisResult, SeoCheckItem } from "@/lib/seo-scorer";

interface RankMathSeoPanelProps {
  analysis: SeoAnalysisResult;
  focusKeyword: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  onChangeFocusKeyword: (value: string) => void;
  onChangeSeoTitle: (value: string) => void;
  onChangeSeoDescription: (value: string) => void;
}

function getScorePalette(score: number) {
  if (score >= 80) {
    return {
      ring: "stroke-emerald-600",
      text: "text-emerald-700",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      label: "Đạt chuẩn SEO",
    };
  }
  if (score >= 50) {
    return {
      ring: "stroke-amber-500",
      text: "text-amber-700",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      label: "Cần tối ưu thêm",
    };
  }
  return {
    ring: "stroke-rose-600",
    text: "text-rose-700",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    label: "Chưa đạt chuẩn",
  };
}

function getLengthBarClass(len: number, min: number, max: number) {
  if (len === 0) return "bg-line";
  if (len >= min && len <= max) return "bg-emerald-500";
  if (len < min) return "bg-amber-500";
  return "bg-rose-500";
}

function truncateSerp(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function CheckGroup({
  title,
  items,
  defaultOpen = true,
}: {
  title: string;
  items: SeoCheckItem[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const passed = items.filter((i) => i.status === "pass").length;
  const failed = items.filter((i) => i.status === "fail").length;

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs font-bold text-navy hover:bg-surface-subtle transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>{title}</span>
          <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-semibold text-ink-muted border border-line">
            {passed}/{items.length} đạt
          </span>
          {failed > 0 && (
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
              {failed} lỗi
            </span>
          )}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-ink-muted shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-ink-muted shrink-0" />
        )}
      </button>

      {open && (
        <ul className="divide-y divide-line-subtle border-t border-line-subtle">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-2.5 px-3.5 py-2.5">
              {item.status === "pass" ? (
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
              ) : item.status === "warn" ? (
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                  aria-hidden="true"
                />
              ) : (
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-600"
                  aria-hidden="true"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-navy leading-snug">
                    {item.label}
                  </p>
                  <span className="shrink-0 font-mono text-[10px] text-ink-muted">
                    {item.points}/{item.maxPoints}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">
                  {item.message}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RankMathSeoPanel({
  analysis,
  focusKeyword,
  slug,
  seoTitle,
  seoDescription,
  onChangeFocusKeyword,
  onChangeSeoTitle,
  onChangeSeoDescription,
}: RankMathSeoPanelProps) {
  const [serpMode, setSerpMode] = useState<"desktop" | "mobile">("desktop");
  const palette = getScorePalette(analysis.score);

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (analysis.score / 100) * circumference;

  const titleLen = analysis.effectiveTitle.length;
  const descLen = analysis.effectiveDescription.length;
  const titlePct = Math.min(100, Math.round((titleLen / 65) * 100));
  const descPct = Math.min(100, Math.round((descLen / 165) * 100));

  const previewTitle = truncateSerp(
    analysis.effectiveTitle || "Tiêu đề bài viết chuẩn SEO MQTech BMT",
    serpMode === "mobile" ? 56 : 62
  );
  const previewDesc = truncateSerp(
    analysis.effectiveDescription ||
      "Mô tả ngắn hiển thị trên kết quả tìm kiếm Google. Nêu rõ triệu chứng, giá tham khảo và ưu đãi giảm 50.000đ khi đặt lịch online.",
    serpMode === "mobile" ? 128 : 158
  );

  return (
    <aside
      aria-label="Chấm điểm SEO chuẩn Rank Math"
      className="space-y-4 rounded-2xl border border-line bg-surface-subtle/60 p-4"
    >
      {/* Header + Circular Score Ring */}
      <div className="flex items-center gap-3.5 rounded-xl border border-line bg-surface p-3.5 shadow-xs">
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              strokeWidth="6"
              className="stroke-surface-muted"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className={`${palette.ring} transition-all duration-300`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-mono text-base font-extrabold leading-none ${palette.text}`}>
              {analysis.score}
            </span>
            <span className="text-[9px] font-semibold text-ink-muted">/100</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 font-heading text-sm font-bold text-navy">
              <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              <span>SEO Score</span>
            </span>
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${palette.badge}`}
            >
              {palette.label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-ink-muted">
            <span>
              Độ dài: <strong className="text-navy">{analysis.wordCount} từ</strong>
            </span>
            <span>
              Mật độ: <strong className="text-navy">{analysis.keywordDensity}%</strong>
            </span>
            <span>
              Link nội bộ: <strong className="text-navy">{analysis.internalLinkCount}</strong>
            </span>
            <span>
              FAQ Schema:{" "}
              <strong className={analysis.faqCount >= 2 ? "text-emerald-700" : "text-navy"}>
                {analysis.faqCount >= 2 ? `${analysis.faqCount} câu` : "Chưa bật"}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Focus Keyword Input + Cannibalization Alert */}
      <div className="space-y-2 rounded-xl border border-line bg-surface p-3.5">
        <label
          htmlFor="postFocusKeyword"
          className="flex items-center justify-between text-xs font-bold text-navy"
        >
          <span className="inline-flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            <span>Từ khóa chính (Focus Keyword)</span>
          </span>
          <span className="text-[10px] font-normal text-ink-muted">1 cụm chính</span>
        </label>
        <input
          id="postFocusKeyword"
          type="text"
          maxLength={120}
          placeholder="VD: sửa máy tính phường buôn ma thuột"
          value={focusKeyword}
          onChange={(e) => onChangeFocusKeyword(e.target.value)}
          className="min-h-11 w-full rounded-xl border border-line bg-surface px-3 py-2 text-base sm:text-xs font-medium text-navy focus:border-brand focus:outline-none"
        />

        {analysis.cannibalizationMatches.length > 0 && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-status-danger-line bg-status-danger-bg p-2.5 text-[11px] text-status-danger-ink"
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold">Cảnh báo trùng Từ khóa chính (Ăn thịt từ khóa)!</p>
              <p className="mt-0.5">
                Đang trùng với:{" "}
                <strong>
                  {analysis.cannibalizationMatches.map((m) => `"${m.title}"`).join(", ")}
                </strong>
                . Nên đổi sang từ khóa phụ/ngách khác.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Google SERP Preview + Edit Snippet */}
      <div className="space-y-3 rounded-xl border border-line bg-surface p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-navy">Google SERP Preview</span>
          <div className="inline-flex rounded-lg border border-line bg-surface-subtle p-0.5">
            <button
              type="button"
              aria-pressed={serpMode === "desktop"}
              onClick={() => setSerpMode("desktop")}
              aria-label="Xem trước Google Desktop"
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                serpMode === "desktop"
                  ? "bg-surface text-navy shadow-xs"
                  : "text-ink-muted hover:text-navy"
              }`}
            >
              <Monitor className="h-3 w-3" aria-hidden="true" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              aria-pressed={serpMode === "mobile"}
              onClick={() => setSerpMode("mobile")}
              aria-label="Xem trước Google Mobile"
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                serpMode === "mobile"
                  ? "bg-surface text-navy shadow-xs"
                  : "text-ink-muted hover:text-navy"
              }`}
            >
              <Smartphone className="h-3 w-3" aria-hidden="true" />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        {/* Simulated Google Result Card */}
        <div
          className={`rounded-xl border border-line-subtle bg-white p-3 transition-all ${
            serpMode === "mobile" ? "max-w-[320px] mx-auto" : "w-full"
          }`}
        >
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-light text-[9px] font-extrabold text-brand">
              MQ
            </span>
            <div className="min-w-0 leading-tight">
              <p className="font-medium text-[#202124] truncate">
                MQTech - Sửa Máy Tính Tại Nhà BMT
              </p>
              <p className="text-[10px] text-[#4d5156] truncate">
                https://suamaytinhbmt.id.vn › bai-viet › {slug || "slug-bai-viet"}
              </p>
            </div>
          </div>
          <p className="mt-1.5 text-[15px] font-medium leading-snug text-[#1a0dab] break-words">
            {previewTitle}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#4d5156] break-words">
            {previewDesc}
          </p>
        </div>

        {/* Inline Edit Snippet inputs with length bars */}
        <div className="space-y-2.5 pt-1">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <label htmlFor="postSeoTitle" className="font-semibold text-ink-muted">
                SEO Title (45–60)
                {!seoTitle.trim() && titleLen > 0 && (
                  <span className="ml-1 font-normal text-[10px] text-ink-subtle">
                    (tự lấy từ Tiêu đề)
                  </span>
                )}
              </label>
              <span
                className={`font-mono font-semibold ${
                  titleLen >= 45 && titleLen <= 60
                    ? "text-emerald-700"
                    : titleLen > 60
                      ? "text-rose-600"
                      : "text-amber-600"
                }`}
              >
                {titleLen}/60
              </span>
            </div>
            <input
              id="postSeoTitle"
              maxLength={120}
              placeholder="Tiêu đề hiển thị trên kết quả tìm kiếm Google"
              value={seoTitle}
              onChange={(e) => onChangeSeoTitle(e.target.value)}
              className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 py-2 text-base sm:text-xs focus:border-brand focus:outline-none"
            />
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className={`h-full transition-all ${getLengthBarClass(titleLen, 45, 60)}`}
                style={{ width: `${titlePct}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <label htmlFor="postSeoDesc" className="font-semibold text-ink-muted">
                SEO Description (130–160)
                {!seoDescription.trim() && descLen > 0 && (
                  <span className="ml-1 font-normal text-[10px] text-ink-subtle">
                    (tự lấy từ Tóm tắt)
                  </span>
                )}
              </label>
              <span
                className={`font-mono font-semibold ${
                  descLen >= 130 && descLen <= 160
                    ? "text-emerald-700"
                    : descLen > 160
                      ? "text-rose-600"
                      : "text-amber-600"
                }`}
              >
                {descLen}/160
              </span>
            </div>
            <textarea
              id="postSeoDesc"
              rows={2}
              maxLength={250}
              placeholder="Mô tả tóm tắt hiển thị dưới tiêu đề Google"
              value={seoDescription}
              onChange={(e) => onChangeSeoDescription(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-base sm:text-xs leading-relaxed focus:border-brand focus:outline-none"
            />
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className={`h-full transition-all ${getLengthBarClass(descLen, 130, 160)}`}
                style={{ width: `${descPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Checklists */}
      <div className="space-y-2.5">
        <CheckGroup title="SEO Cơ bản" items={analysis.groups.basic} defaultOpen />
        <CheckGroup
          title="SEO Bổ sung & Schema"
          items={analysis.groups.additional}
          defaultOpen={false}
        />
        <CheckGroup
          title="Tiêu đề & Bố cục"
          items={analysis.groups.readability}
          defaultOpen={false}
        />
      </div>
    </aside>
  );
}
