import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  CalendarCheck,
  Clock,
  User,
} from "lucide-react";
import {
  getPostBySlug,
  getPublishedPosts,
  getSiteSettings,
} from "@/lib/site-data";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ArticleBody } from "@/components/blog/ArticleBody";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Không tìm thấy bài viết" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, settings, allPosts] = await Promise.all([
    getPostBySlug(slug),
    getSiteSettings(),
    getPublishedPosts(),
  ]);

  if (!post) notFound();

  let galleryList: Array<{ url: string; caption?: string }> = [];
  try {
    if (post.galleryImages) {
      const parsed = JSON.parse(post.galleryImages);
      if (Array.isArray(parsed)) galleryList = parsed;
    }
  } catch {
    galleryList = [];
  }

  const allImages = [
    post.coverImage,
    ...galleryList.map((g) => g.url),
  ].filter(Boolean);

  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(post.publishedAt));

  const relatedPosts = allPosts.filter((p) => p.id !== post.id).slice(0, 2);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: allImages,
    datePublished: new Date(post.publishedAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: settings.brandName,
    },
  };

  return (
    <article className="bg-surface py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: "Kiến thức", href: "/bai-viet" },
            { label: post.title },
          ]}
        />

        <header className="space-y-4 mt-2">
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-ink-muted">
            <span className="inline-flex rounded-full bg-brand-light px-3 py-1 font-semibold text-brand">
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              <span>{post.authorName}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Calendar className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              <time dateTime={new Date(post.publishedAt).toISOString()}>
                {formattedDate}
              </time>
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Clock className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              <span>{post.readTimeMinutes} phút đọc</span>
            </span>
          </div>

          <h1 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:leading-[1.18] break-words">
            {post.title}
          </h1>
        </header>

        <ArticleBody
          content={post.content}
          coverImage={post.coverImage}
          title={post.title}
          galleryImagesJson={post.galleryImages}
        />

        <div className="mt-14 rounded-2xl bg-navy p-7 text-ink-inverse shadow-lg flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-heading text-lg font-bold">
              Cần hỗ trợ kiểm tra máy tại Buôn Ma Thuột?
            </p>
            <p className="text-sm text-ink-inverse-muted mt-1 break-words">
              Liên hệ {settings.brandName} — Hotline{" "}
              <span className="font-mono tabular-nums text-ink-inverse">
                {settings.hotline}
              </span>{" "}
              hoặc đặt lịch sửa tận nhà ngay.
            </p>
          </div>
          <Link
            href="/dat-lich"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-ink-inverse shrink-0 shadow-lg shadow-black/25 hover:bg-brand-hover"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            <span>Đặt lịch ngay</span>
          </Link>
        </div>

        {relatedPosts.length > 0 && (
          <section
            aria-label="Bài viết liên quan"
            className="mt-14 border-t border-line pt-12"
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="font-heading text-xl font-bold text-navy sm:text-2xl">
                Bài viết kỹ thuật khác
              </h2>
              <Link
                href="/bai-viet"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-hover"
              >
                <span>Xem thêm</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/bai-viet/${rel.slug}`}
                  className="group flex min-w-0 flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:border-brand/40"
                >
                  <div className="space-y-2">
                    <span className="inline-flex rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand">
                      {rel.category}
                    </span>
                    <h3 className="font-heading text-lg font-bold text-navy group-hover:text-brand transition-colors break-words">
                      {rel.title}
                    </h3>
                    <p className="text-sm text-ink-muted line-clamp-2 break-words">
                      {rel.excerpt}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand">
                    Đọc tiếp{" "}
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
