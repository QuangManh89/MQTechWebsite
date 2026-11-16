import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { KnowledgeHubClient } from "@/components/cam-nang/KnowledgeHubClient";
import { articleRepo } from "@/lib/db/article-repository";

export const metadata: Metadata = {
  title: "Cẩm Nang Xử Lý Sự Cố & Sơ Cứu Máy Tính | MQTech Buôn Ma Thuột",
  description:
    "Tổng hợp hướng dẫn tự sơ cứu laptop vô nước, khắc phục màn hình xanh BSOD, kiểm tra sức khỏe ổ cứng SSD và mẹo sử dụng máy tính an toàn từ kỹ thuật viên MQTech.",
  alternates: {
    canonical: "https://mqcomputech.com/cam-nang",
  },
  openGraph: {
    title: "Cẩm Nang Kỹ Thuật & Sơ Cứu Máy Tính | MQTech",
    description:
      "Hướng dẫn tự sơ cứu máy tính an toàn, bảo vệ dữ liệu trước khi mang đi sửa tại Buôn Ma Thuột.",
    url: "https://mqcomputech.com/cam-nang",
    siteName: "MQTech — Computer Service",
    locale: "vi_VN",
    type: "website",
  },
};

export default async function KnowledgeHubPage() {
  const result = await articleRepo.listPublishedArticles({ pageSize: 50 });
  const articles = result.items;

  return (
    <div className="flex min-h-screen flex-col bg-brand-dark text-white selection:bg-indigo-500 selection:text-white">
      {/* Sticky Header */}
      <Navbar />

      <main className="flex-1 bg-slate-50 text-slate-900">
        {/* Hero Header Banner */}
        <section className="bg-brand-dark text-white py-14 lg:py-20 border-b border-white/10">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-8 text-center max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Cẩm Nang Kỹ Thuật Thực Chiến
            </h1>
            <p className="mt-4 text-base sm:text-lg text-neutral-300 leading-relaxed text-pretty">
              Quy trình chuẩn giúp bạn tự sơ cứu máy tính an toàn, bảo toàn dữ liệu cá nhân trước khi mang đi sửa. Toàn bộ hình ảnh và bài viết được lưu trữ minh bạch trên hệ thống Cloudflare R2.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
            <KnowledgeHubClient articles={articles} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
