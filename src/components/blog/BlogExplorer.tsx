"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Search } from "lucide-react";
import type { Post } from "@/db/schema";
import { cn } from "@/lib/utils";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";

export function BlogExplorer({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("Tất cả");

  const categories = useMemo(
    () => ["Tất cả", ...Array.from(new Set(posts.map((p) => p.category)))],
    [posts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchCat =
        selectedCat === "Tất cả" || post.category === selectedCat;
      const matchSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [posts, query, selectedCat]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <label htmlFor="blog-search-input" className="sr-only">
            Tìm kiếm bài viết kỹ thuật
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          />
          <input
            id="blog-search-input"
            type="search"
            maxLength={120}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bài viết: màn hình xanh, vệ sinh laptop..."
            className="min-h-11 w-full rounded-full border border-line bg-surface py-3 pl-11 pr-4 text-base text-navy sm:text-sm"
          />
        </div>

        <div
          role="group"
          aria-label="Lọc chuyên mục bài viết"
          className="flex flex-wrap gap-2"
        >
          {categories.map((cat) => {
            const active = selectedCat === cat;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedCat(cat)}
                className={cn(
                  "min-h-11 rounded-full px-4 py-2 text-xs font-semibold transition-all sm:text-sm",
                  active
                    ? "bg-brand text-ink-inverse"
                    : "border border-line bg-surface text-ink-muted hover:border-brand/40"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Đang hiển thị {filtered.length} bài viết.
      </p>

      {filtered.length === 0 ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-line bg-surface-subtle p-10 text-center space-y-4"
        >
          <p className="text-sm text-ink-muted break-words">
            Không tìm thấy bài viết phù hợp với bộ lọc hiện tại.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedCat("Tất cả");
            }}
            className="inline-flex min-h-11 items-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-ink-inverse hover:bg-brand-hover"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {featured && (
            <Link
              href={`/bai-viet/${featured.slug}`}
              className="group grid overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-card-hover lg:grid-cols-2"
            >
              <div className="h-64 overflow-hidden bg-surface-muted lg:h-full">
                <ResponsiveImage
                  src={featured.coverImage}
                  alt={featured.title}
                  width={800}
                  height={500}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex min-w-0 flex-col justify-between p-6 sm:p-8">
                <div className="space-y-3">
                  <span className="inline-flex rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
                    {featured.category}
                  </span>
                  <h2 className="font-heading text-2xl font-bold text-navy group-hover:text-brand transition-colors break-words">
                    {featured.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-ink-muted break-words">
                    {featured.excerpt}
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {featured.authorName} • {featured.readTimeMinutes} phút đọc
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-brand">
                    Đọc bài <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/bai-viet/${post.slug}`}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-card-hover"
              >
                <div className="h-48 overflow-hidden bg-surface-muted">
                  <ResponsiveImage
                    src={post.coverImage}
                    alt={post.title}
                    width={640}
                    height={384}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between p-6">
                  <div className="space-y-2.5">
                    <span className="inline-flex rounded-full bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand">
                      {post.category}
                    </span>
                    <h3 className="font-heading text-lg font-bold text-navy group-hover:text-brand transition-colors break-words">
                      {post.title}
                    </h3>
                    <p className="text-sm text-ink-muted line-clamp-3 break-words">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-between text-xs text-ink-muted">
                    <span>{post.readTimeMinutes} phút đọc</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-brand">
                      Đọc thêm <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
