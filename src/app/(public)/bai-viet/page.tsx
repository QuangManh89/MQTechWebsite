import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/site-data";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kiến Thức Công Nghệ & Thủ Thuật Máy Tính",
  description:
    "Chia sẻ kinh nghiệm bảo dưỡng laptop, khắc phục lỗi Windows, nâng cấp SSD/RAM và mẹo dùng máy tính bền bỉ từ MQTech BMT.",
  alternates: {
    canonical: "https://suamaytinhbmt.id.vn/bai-viet",
  },
  openGraph: {
    siteName: "MQTech - Sửa Máy Tính Tại Nhà BMT",
    title: "Kiến Thức Công Nghệ & Thủ Thuật Máy Tính",
    description:
      "Chia sẻ kinh nghiệm bảo dưỡng laptop, khắc phục lỗi Windows, nâng cấp SSD/RAM và mẹo dùng máy tính bền bỉ từ MQTech BMT.",
    url: "https://suamaytinhbmt.id.vn/bai-viet",
    type: "website",
    locale: "vi_VN",
    images: [{ url: "/brand/og-banner.png", width: 1200, height: 630 }],
  },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="bg-surface">
      <section className="border-b border-line bg-surface-subtle py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Kiến thức" }]} />
          <h1 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-5xl">
            Kiến thức công nghệ &amp; hướng dẫn thực tế
          </h1>
          <p className="mt-4 max-w-2xl text-base text-ink-muted">
            Tổng hợp kinh nghiệm xử lý sự cố máy tính, vệ sinh phần cứng và
            tối ưu hiệu năng từ đội ngũ kỹ thuật MQTech Buôn Ma Thuột.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BlogExplorer posts={posts} />
        </div>
      </section>
    </div>
  );
}
