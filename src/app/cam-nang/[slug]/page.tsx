import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Calendar,
  Eye,
  ChevronRight,
  ShieldCheck,
  PhoneCall,
  ArrowRight,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { articleRepo } from "@/lib/db/article-repository";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const result = await articleRepo.listArticles({ status: "PUBLISHED", pageSize: 100 });
  return result.items.map((art) => ({ slug: art.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await articleRepo.getArticleBySlug(slug);

  if (!article || article.status !== "PUBLISHED") {
    return {
      title: "Không tìm thấy bài viết | MQTech",
    };
  }

  const url = `https://mqcomputech.com/cam-nang/${article.slug}`;

  return {
    title: `${article.title} | MQTech Buôn Ma Thuột`,
    description: article.summary,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      url,
      type: "article",
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : [],
    },
  };
}

function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono font-medium text-blue-700 border border-slate-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function renderMarkdownContent(content: string) {
  const blocks = content.split("\n\n");
  return blocks.map((block, idx) => {
    const trimmed = block.trim();

    // Image: ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const src = imgMatch[2];
      return (
        <figure
          key={idx}
          className="my-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-900 shadow-md"
        >
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={src}
              alt={alt}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          {alt && (
            <figcaption className="bg-slate-900/95 px-4 py-2.5 text-center text-xs font-medium text-slate-300 border-t border-slate-800">
              📸 {alt}
            </figcaption>
          )}
        </figure>
      );
    }

    // Callout alert: > [!WARNING] or > [!TIP] or > [!NOTE]
    if (trimmed.startsWith("> [!")) {
      const lines = trimmed.split("\n");
      const typeMatch = lines[0].match(/^> \[!(WARNING|CAUTION|TIP|NOTE|IMPORTANT)\]/i);
      const type = typeMatch ? typeMatch[1].toUpperCase() : "NOTE";
      const bodyLines = lines.slice(1).map((l) => l.replace(/^>\s?/, ""));
      const bodyText = bodyLines.join(" ").trim();

      const isWarn = type === "WARNING" || type === "CAUTION";
      const isTip = type === "TIP";

      return (
        <div
          key={idx}
          className={`my-6 rounded-2xl border p-5 ${
            isWarn
              ? "border-amber-300 bg-amber-50/80 text-amber-950"
              : isTip
              ? "border-emerald-300 bg-emerald-50/80 text-emerald-950"
              : "border-blue-300 bg-blue-50/80 text-blue-950"
          }`}
        >
          <div className="flex items-start gap-3">
            {isWarn ? (
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            ) : isTip ? (
              <Sparkles className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
            )}
            <div className="text-xs sm:text-sm leading-relaxed">
              <strong className="block font-bold text-sm mb-1">
                {isWarn ? "CẢNH BÁO QUAN TRỌNG" : isTip ? "MẸO KỸ THUẬT HỮU ÍCH" : "LƯU Ý KỸ THUẬT"}
              </strong>
              {renderFormattedText(bodyText)}
            </div>
          </div>
        </div>
      );
    }

    // Headings
    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={idx}
          className="text-xl sm:text-2xl font-bold text-slate-900 pt-6 pb-2 border-b border-slate-100"
        >
          {trimmed.replace("## ", "")}
        </h2>
      );
    }
    if (trimmed.startsWith("### ")) {
      return (
        <h3
          key={idx}
          className="text-lg sm:text-xl font-bold text-slate-900 pt-4"
        >
          {trimmed.replace("### ", "")}
        </h3>
      );
    }

    // Unordered list
    if (trimmed.startsWith("- ")) {
      const items = trimmed.split("\n").map((item) => item.replace(/^- /, "").trim());
      return (
        <ul key={idx} className="my-4 space-y-2 pl-2">
          {items.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
              <span>{renderFormattedText(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split("\n").map((item) => item.replace(/^\d+\.\s*/, "").trim());
      return (
        <ol key={idx} className="my-4 space-y-2 pl-2">
          {items.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] mt-0.5">
                {itemIdx + 1}
              </span>
              <span>{renderFormattedText(item)}</span>
            </li>
          ))}
        </ol>
      );
    }

    // Standard paragraph
    return (
      <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
        {renderFormattedText(trimmed)}
      </p>
    );
  });
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await articleRepo.getArticleBySlug(slug, true);

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  // Fetch related articles
  const allArticles = await articleRepo.listPublishedArticles({ pageSize: 6 });
  const relatedArticles = allArticles.items
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  // Schema.org Article Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    image: article.coverImageUrl ? [article.coverImageUrl] : [],
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: "MQTech — Computer Service",
      url: "https://mqcomputech.com",
    },
    publisher: {
      "@type": "Organization",
      name: "MQTech",
      logo: {
        "@type": "ImageObject",
        url: "https://mqcomputech.com/logo/mq-tech-app-icon-512.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://mqcomputech.com/cam-nang/${article.slug}`,
    },
  };

  const breadcrumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: "https://mqcomputech.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cẩm nang",
        item: "https://mqcomputech.com/cam-nang",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `https://mqcomputech.com/cam-nang/${article.slug}`,
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-brand-dark text-white selection:bg-blue-600 selection:text-white">
      {/* Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />

      {/* Header */}
      <Navbar />

      <main className="flex-1 bg-slate-50 text-slate-900 py-10 lg:py-16">
        <div className="mx-auto max-w-[880px] px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <ChevronRight className="h-3 w-3 text-slate-400" />
              </li>
              <li>
                <Link href="/cam-nang" className="hover:text-blue-600 transition-colors">
                  Cẩm nang
                </Link>
              </li>
              <li>
                <ChevronRight className="h-3 w-3 text-slate-400" />
              </li>
              <li className="font-semibold text-slate-800 line-clamp-1">
                {article.title}
              </li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="space-y-4 pb-8 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60">
                {article.categoryLabel}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {article.readTime}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {new Date(article.publishedAt).toLocaleDateString("vi-VN")}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                {article.views} lượt đọc
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.25] text-balance">
              {article.title}
            </h1>

            {/* Lead Summary */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
              {article.summary}
            </div>
          </header>

          {/* Cover Image from Cloudflare R2 or Local */}
          {article.coverImageUrl && (
            <div className="my-8 relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-md">
              <Image
                src={article.coverImageUrl}
                alt={article.title}
                fill
                priority
                unoptimized
                className="object-cover"
              />
            </div>
          )}

          {/* Step-by-Step Checklist */}
          {article.steps && article.steps.length > 0 && (
            <section className="my-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-sm">
                  ✓
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Quy Trình Sơ Cứu Thiết Bị Từng Bước
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thực hiện tuần tự từ bước 1 đến bước cuối cùng để hạn chế tối đa hư hại phần cứng.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {article.steps.map((st, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:p-5"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white font-mono text-xs font-bold text-blue-600 border border-blue-200 shadow-xs">
                      {st.number}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {st.action}
                      </h3>
                      {st.detail && (
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {st.detail}
                        </p>
                      )}
                      {st.warning && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                          <span>{st.warning}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Detailed Content Prose */}
          <article className="prose prose-slate max-w-none my-10 space-y-4 text-slate-800 text-sm sm:text-base leading-relaxed">
            {renderMarkdownContent(article.content)}
          </article>

          {/* Quick Tips Box */}
          {article.quickTips && article.quickTips.length > 0 && (
            <div className="my-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-base mb-3">
                <Sparkles className="h-5 w-5 text-amber-600" />
                <span>Mẹo kỹ thuật thực chiến đáng nhớ</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-amber-900">
                {article.quickTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technician Author Card */}
          <div className="my-10 rounded-2xl border border-slate-200 bg-white p-6 flex items-center gap-4 shadow-xs">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-blue-200 bg-blue-50 grid place-items-center">
              <ShieldCheck className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Đội ngũ kỹ thuật MQTech
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                Chuyên viên Sửa chữa &amp; Cứu dữ liệu Buôn Ma Thuột
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Quy trình minh bạch, kiểm tra đo đạc trước mắt khách hàng. Hỗ trợ tận tâm tại TP. Buôn Ma Thuột.
              </p>
            </div>
          </div>

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <section className="my-12 pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Cẩm Nang Kỹ Thuật Khác
                </h3>
                <Link
                  href="/cam-nang"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/cam-nang/${rel.slug}`}
                    className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {rel.coverImageUrl && (
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100 mb-3">
                          <Image
                            src={rel.coverImageUrl}
                            alt={rel.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      )}
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {rel.categoryLabel}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mt-2">
                        {rel.title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                      <span>{rel.readTime}</span>
                      <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Direct CTA Box to Hotline 0987 482 573 */}
          <div className="mt-14 rounded-2xl border border-slate-900 bg-brand-dark p-7 sm:p-9 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                <span>Kỹ thuật viên MQTech Buôn Ma Thuột</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Cần kỹ thuật viên hỗ trợ kiểm tra trực tiếp?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed">
                Đo kiểm linh kiện trước mắt khách hàng, báo giá minh bạch và niêm phong phần cứng an toàn.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <a
                href="tel:0987482573"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 px-6 text-xs font-bold text-white shadow-md transition-colors whitespace-nowrap"
              >
                <PhoneCall className="h-4 w-4" />
                <span>0987 482 573</span>
              </a>
              <Link
                href="/#yeu-cau-dich-vu"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white hover:bg-neutral-100 px-6 text-xs font-bold text-brand-dark shadow-md transition-colors whitespace-nowrap"
              >
                <span>Yêu cầu sửa chữa</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
