"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import type { Article, ArticleCategory } from "@/lib/db/types";
import { GUIDE_ARTICLES } from "@/lib/constants/guides";

export function KnowledgeSection({
  initialArticles,
}: {
  initialArticles?: Article[];
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Normalize articles to display: if initialArticles passed, use top 3; else fallback
  const displayArticles = initialArticles && initialArticles.length > 0
    ? initialArticles.slice(0, 3)
    : GUIDE_ARTICLES.slice(0, 3).map((g) => ({
        id: g.id,
        slug: g.id,
        title: g.title,
        summary: g.summary,
        category: g.category as ArticleCategory,
        categoryLabel: g.categoryLabel,
        readTime: g.readTime,
        steps: g.steps,
        coverImageUrl: g.coverImage || `/cam-nang/${g.id}.webp`,
      }));

  const handleCopyTips = (articleId: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(articleId);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <section id="cam-nang" className="py-20 bg-slate-50 text-slate-900 border-b border-slate-200/80">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Hướng Dẫn Tự Sơ Cứu Thiết Bị An Toàn
          </h2>
          <p className="text-base text-slate-600 mt-3 leading-relaxed text-pretty">
            Quy trình chuẩn giúp bạn tự bảo vệ dữ liệu và sơ cứu máy tính an toàn trước khi mang đi sửa. Có thể sao chép nhanh 1 chạm để lưu vào điện thoại.
          </p>
        </div>

        {/* 3-Column Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayArticles.map((card) => {
            const isCopied = copiedId === card.id;
            const copyContent = `${card.title}\n\nQuy trình thực hiện:\n${card.steps
              .map((s) => `${s.number}. ${s.action}: ${s.detail}`)
              .join("\n")}\n\n(Nguồn: MQTech Máy Tính Buôn Ma Thuột - Hotline: 0987 482 573)`;

            return (
              <div
                key={card.id}
                className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {card.coverImageUrl && (
                    <Link
                      href={`/cam-nang/${card.slug}`}
                      className="relative block aspect-[16/9] w-full overflow-hidden bg-slate-100"
                    >
                      <Image
                        src={card.coverImageUrl}
                        alt={card.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </Link>
                  )}

                  <div className="p-6 sm:p-7">
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                        {card.categoryLabel}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        {card.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug text-balance hover:text-blue-600 transition-colors">
                      <Link href={`/cam-nang/${card.slug}`}>
                        {card.title}
                      </Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {card.summary}
                    </p>

                    {/* Checklist steps right on the card face */}
                    <div className="space-y-2.5 pt-3.5 border-t border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500">
                        Checklist sơ cứu 3 bước:
                      </div>

                      {card.steps.slice(0, 3).map((st, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">
                            <strong className="text-slate-900">{st.number}.</strong> {st.action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-6 sm:p-7 pt-0 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyTips(card.id, copyContent)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
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
                    href={`/cam-nang/${card.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md"
                  >
                    <span>Xem chi tiết</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Articles Link Button */}
        <div className="mt-8 text-center">
          <Link
            href="/cam-nang"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-2.5 text-xs font-bold text-slate-800 shadow-xs hover:border-blue-400 hover:bg-slate-50 transition-colors"
          >
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span>Xem tất cả cẩm nang hướng dẫn kỹ thuật</span>
            <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
          </Link>
        </div>

        {/* 4th Card Special Spotlight: Network & Remote Office */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-100/90 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
              <Sparkles className="h-4 w-4" />
              <span>Hỗ trợ kỹ thuật tận nơi Buôn Ma Thuột</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 text-balance">
              Cần cứu dữ liệu gấp hoặc cấu hình máy in/mạng văn phòng?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl text-pretty">
              Kỹ thuật viên MQTech hỗ trợ kiểm tra tận nơi tại BMT hoặc hỗ trợ từ xa qua UltraViewer / AnyDesk nhanh chóng, bảo mật.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:0987482573"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-600/20 transition-transform duration-150 hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Hotline: 0987 482 573</span>
            </a>
            <Link
              href="#yeu-cau-dich-vu"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 font-semibold text-xs transition-colors duration-150 shadow-xs whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Gửi yêu cầu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
