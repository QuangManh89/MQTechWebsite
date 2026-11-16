"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Clock,
  ArrowRight,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Copy,
  Check,
  BookOpen,
} from "lucide-react";
import type { Article } from "@/lib/db/types";
import { ARTICLE_CATEGORIES } from "@/lib/validations/article";

export function KnowledgeHubClient({
  articles,
}: {
  articles: Article[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTips = (articleId: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(articleId);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCategory =
        selectedCategory === "ALL" || art.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  return (
    <div className="space-y-12">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              selectedCategory === "ALL"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Tất cả ({articles.length})
          </button>
          {Object.entries(ARTICLE_CATEGORIES).map(([key, cat]) => {
            const count = articles.filter((a) => a.category === key).length;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  selectedCategory === key
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm cẩm nang, sự cố..."
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy bài viết phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Vui lòng thử tìm với từ khóa khác hoặc chọn chuyên mục &quot;Tất cả&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("ALL");
              setSearchQuery("");
            }}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            Xem tất cả bài viết
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredArticles.map((art) => {
            const isCopied = copiedId === art.id;
            const copyContent = `${art.title}\n\nQuy trình sơ cứu:\n${art.steps
              .map((s) => `${s.number}. ${s.action}: ${s.detail}`)
              .join("\n")}\n\n(Nguồn: MQTech Máy Tính Buôn Ma Thuột - Hotline: 0987 482 573)`;

            return (
              <article
                key={art.id}
                className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Article Cover Image from Cloudflare R2 */}
                  {art.coverImageUrl && (
                    <Link
                      href={`/cam-nang/${art.slug}`}
                      className="relative block h-48 w-full overflow-hidden bg-slate-100"
                    >
                      <Image
                        src={art.coverImageUrl}
                        alt={art.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>
                  )}

                  <div className="p-6">
                    {/* Category & Read Time */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                        {art.categoryLabel}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Clock className="h-3 w-3" />
                        {art.readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      <Link href={`/cam-nang/${art.slug}`}>
                        {art.title}
                      </Link>
                    </h2>

                    {/* Summary */}
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>

                    {/* Checklist preview */}
                    {art.steps && art.steps.length > 0 && (
                      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
                        <div className="text-[11px] font-semibold text-slate-500">
                          Checklist sơ cứu:
                        </div>
                        {art.steps.slice(0, 2).map((st, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1 leading-snug">
                              <strong className="text-slate-900">{st.number}.</strong> {st.action}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyTips(art.id, copyContent)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700 font-bold whitespace-nowrap">Đã chép mẹo!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 shrink-0" />
                        <span className="whitespace-nowrap">Sao chép mẹo</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/cam-nang/${art.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>Đọc chi tiết</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Emergency CTA Card */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 to-slate-50 p-7 sm:p-9 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/60 px-3 py-1 text-xs font-semibold text-blue-800">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Kỹ thuật viên Buôn Ma Thuột hỗ trợ trực tiếp</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Thiết bị gặp sự cố phức tạp hơn bình thường?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            Nếu máy bị sập nguồn liên tục, có mùi khét hoặc lỗi phần cứng nghiêm trọng, hãy tắt máy ngay và liên hệ kỹ thuật viên để được đo kiểm trực tiếp trước mắt bạn.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <a
            href="tel:0987482573"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 px-6 text-xs font-bold text-white shadow-md transition-colors whitespace-nowrap"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Hotline: 0987 482 573</span>
          </a>
          <Link
            href="/#yeu-cau-dich-vu"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white hover:bg-slate-100 px-6 text-xs font-bold text-slate-900 border border-slate-200 shadow-xs transition-colors whitespace-nowrap"
          >
            <span>Đặt lịch tận nơi</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
