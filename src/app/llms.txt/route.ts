import {
  getActivePricing,
  getPublishedPosts,
  getPublishedServices,
  getSiteSettings,
} from "@/lib/site-data";

export const dynamic = "force-dynamic";

const PRICING_CATEGORY_LABELS: Record<string, string> = {
  "laptop-macbook": "Laptop & MacBook",
  "pc-build": "PC & Build Máy Bộ",
  "clean-upgrade": "Vệ Sinh & Nâng Cấp",
  "onsite-it": "Sửa Tận Nhà & Bảo Trì IT",
};

const clean = (value: string | null | undefined): string =>
  (value ?? "").trim();

export async function GET() {
  const [settings, services, pricingItems, posts] = await Promise.all([
    getSiteSettings(),
    getPublishedServices(),
    getActivePricing(),
    getPublishedPosts(),
  ]);

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    settings.siteUrl ||
    "https://suamaytinhbmt.id.vn"
  ).replace(/\/$/, "");

  const facebookUrl =
    clean(settings.facebookUrl) || "https://www.facebook.com/suamaytinhbmt";
  const youtubeUrl = "https://www.youtube.com/@mqtechbmt";

  const lines: string[] = [
    "# MQTech - Sửa Máy Tính Tại Nhà BMT",
    "",
    `> ${settings.subTagline}. ${settings.slogan} Dịch vụ sửa máy tính, laptop, MacBook tận nhà và chuẩn phòng Lab tại Phường Tân Lập, Phường Tân An và Phường Buôn Ma Thuột (Đắk Lắk) — có mặt 15-20 phút, kiểm tra miễn phí, báo giá công khai, quan sát trực tiếp và bảo hành điện tử.`,
    "",
    "## Thông tin liên hệ & Khu vực phục vụ",
    "",
    `- **Thương hiệu:** ${settings.brandName}`,
    `- **Website:** ${baseUrl}`,
    `- **Facebook Fanpage chính thức:** ${facebookUrl}`,
    `- **Kênh YouTube chính thức:** ${youtubeUrl}`,
    `- **Địa chỉ:** ${settings.address}`,
    `- **Hotline / Zalo:** ${settings.hotline} (${settings.zaloUrl})`,
    `- **Email:** ${settings.email}`,
    `- **Giờ làm việc:** ${settings.workingHours}`,
    `- **Ưu đãi đặt lịch trực tuyến:** Giảm ngay ${settings.bookingDiscount} tại ${baseUrl}/dat-lich`,
    "- **Khu vực phục vụ tận nơi (15-20 phút):** Phường Tân Lập, Phường Tân An và Phường Buôn Ma Thuột (Tỉnh Đắk Lắk).",
    "",
    "## Dịch vụ chính",
    "",
  ];

  if (services.length > 0) {
    for (const service of services) {
      const shortDesc = clean(service.shortDesc);
      const priceFrom = clean(service.priceFrom);
      const duration = clean(service.duration);
      const warranty = clean(service.warranty);
      const metaParts = [
        priceFrom ? `Giá tham khảo: ${priceFrom}` : "",
        duration ? `Thời gian: ${duration}` : "",
        warranty ? `Bảo hành: ${warranty}` : "",
      ].filter(Boolean);
      const descSuffix = shortDesc ? `: ${shortDesc}` : "";
      const metaSuffix = metaParts.length > 0 ? ` (${metaParts.join(" | ")})` : "";
      lines.push(
        `- [${service.title}](${baseUrl}/dich-vu/${service.slug})${descSuffix}${metaSuffix}`
      );
    }
  } else {
    lines.push(
      `- [Danh sách dịch vụ MQTech BMT](${baseUrl}/dich-vu): Sửa máy tính tại nhà BMT, sửa Laptop Windows, sửa MacBook, sửa & build PC, vệ sinh tra keo tản nhiệt, nâng cấp RAM/SSD và bảo trì IT doanh nghiệp.`
    );
  }

  lines.push("", "## Bảng giá tham khảo", "");
  lines.push(`Xem đầy đủ bảng giá niêm yết công khai tại: [Bảng giá MQTech BMT](${baseUrl}/bang-gia)`);
  lines.push("");

  if (pricingItems.length > 0) {
    const grouped = new Map<string, typeof pricingItems>();
    for (const item of pricingItems) {
      const bucket = grouped.get(item.tabCategory) ?? [];
      bucket.push(item);
      grouped.set(item.tabCategory, bucket);
    }

    for (const [category, items] of grouped.entries()) {
      const label = PRICING_CATEGORY_LABELS[category] || category;
      lines.push(`### ${label}`, "");
      for (const item of items) {
        const priceText = settings.showExactPrices
          ? clean(item.priceText)
          : "Liên hệ báo giá";
        const duration = clean(item.duration);
        const warranty = clean(item.warranty);
        const detailParts = [
          priceText,
          duration ? `Thời gian: ${duration}` : "",
          warranty ? `Bảo hành: ${warranty}` : "",
        ].filter(Boolean);
        const detailSuffix =
          detailParts.length > 0 ? `: ${detailParts.join(" — ")}` : "";
        lines.push(`- **${item.serviceName}**${detailSuffix}`);
      }
      lines.push("");
    }
  }

  lines.push(
    "## Công cụ miễn phí & Tra cứu",
    "",
    `- [Đặt lịch sửa chữa trực tuyến](${baseUrl}/dat-lich): Đặt lịch sửa tận nhà hoặc tại tiệm BMT, giảm ngay ${settings.bookingDiscount}.`,
    `- [Tra cứu bảo hành & tiến độ sửa chữa điện tử](${baseUrl}/tra-cuu): Kiểm tra tình trạng máy và thời hạn bảo hành theo mã phiếu (${settings.ticketPrefix}-...) hoặc số điện thoại.`,
    `- [Công cụ kiểm tra phần cứng máy tính miễn phí](${baseUrl}/kiem-tra-may-tinh): Test bàn phím, điểm chết màn hình, webcam, micro, loa và chuột trực tiếp trên trình duyệt.`,
    `- [Bảng giá dịch vụ công khai](${baseUrl}/bang-gia): Tra cứu chi phí sửa Laptop, MacBook, PC, vệ sinh và nâng cấp linh kiện tại Buôn Ma Thuột.`,
    `- [Liên hệ & Chỉ đường](${baseUrl}/lien-he): Thông tin địa chỉ, bản đồ, hotline và gửi yêu cầu tư vấn kỹ thuật.`,
    "",
    "## Kiến thức & Hướng dẫn kỹ thuật",
    ""
  );

  if (posts.length > 0) {
    for (const post of posts) {
      const excerpt = clean(post.excerpt);
      const excerptSuffix = excerpt ? `: ${excerpt}` : "";
      lines.push(
        `- [${post.title}](${baseUrl}/bai-viet/${post.slug})${excerptSuffix}`
      );
    }
  } else {
    lines.push(
      `- [Kiến thức & Kinh nghiệm sửa máy tính BMT](${baseUrl}/bai-viet): Hướng dẫn chẩn đoán lỗi, bảo dưỡng và tối ưu Laptop, MacBook, PC.`
    );
  }

  lines.push("");

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
