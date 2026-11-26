"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Camera,
  Image as ImageIcon,
  Info,
  Phone,
  ZoomIn,
} from "lucide-react";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { ImageLightbox, type LightboxImage } from "@/components/ui/ImageLightbox";

interface ArticleBodyProps {
  content: string;
  coverImage: string;
  title: string;
  galleryImagesJson?: string | null;
  category?: string;
  hotline?: string;
  hotlineRaw?: string;
  bookingDiscount?: string;
}

interface ContextualCtaConfig {
  heading: string;
  body: string;
  bookingHref: string;
  serviceHref?: string;
  serviceLabel?: string;
}

function getContextualCta(category?: string): ContextualCtaConfig {
  switch (category?.trim()) {
    case "Thủ Thuật Văn Phòng":
      return {
        heading:
          "Đang vướng lỗi Word/Excel, Unikey hay chia sẻ máy in LAN tại BMT?",
        body: "Kỹ thuật viên MQTech có mặt 15–20 phút tại P. Tân Lập, P. Tân An, P. Buôn Ma Thuột hoặc hỗ trợ qua UltraViewer — kiểm tra miễn phí, báo giá trước khi làm.",
        bookingHref: `/dat-lich?dich_vu=${encodeURIComponent(
          "Cài Win 10/11 & Phần mềm tại nhà BMT"
        )}`,
        serviceHref: "/dich-vu/bao-tri-it-cong-ty-phong-may",
        serviceLabel: "Xem dịch vụ bảo trì IT công ty & phòng máy",
      };
    case "Thủ Thuật Windows":
      return {
        heading:
          "Cần cài Win 10/11 sạch & phần mềm tận nhà tại Tân Lập, Tân An, Buôn Ma Thuột?",
        body: "Cài hệ điều hành sạch ổn định, giữ nguyên 100% dữ liệu, đầy đủ driver & bộ Office/Unikey chuẩn văn phòng — hoàn tất 30–45 phút.",
        bookingHref: `/dat-lich?dich_vu=${encodeURIComponent(
          "Cài Win 10/11 & Phần mềm tại nhà BMT"
        )}`,
        serviceHref: "/dich-vu/cai-win-10-11-phan-mem-tai-nha-bmt",
        serviceLabel: "Xem trang dịch vụ cài Win 10/11 tại nhà BMT",
      };
    case "Bảo Dưỡng Phần Cứng":
      return {
        heading: "Máy quá nhiệt, không lên nguồn hay lỗi màn hình tại BMT?",
        body: "Chẩn đoán phần cứng miễn phí 100%, vệ sinh tra keo tản nhiệt chuẩn Lab, quan sát trực tiếp lấy liền tại P. Tân Lập, P. Tân An & P. Buôn Ma Thuột.",
        bookingHref: `/dat-lich?dich_vu=${encodeURIComponent(
          "Sửa chữa Laptop Windows"
        )}`,
        serviceHref: "/kiem-tra-may-tinh",
        serviceLabel: "Tự test màn hình, bàn phím, loa, nhiệt độ miễn phí trước khi sửa",
      };
    case "Nâng Cấp Máy":
      return {
        heading:
          "Nâng cấp SSD NVMe & RAM giữ nguyên 100% dữ liệu — Lấy liền 30 phút",
        body: "Linh kiện chính hãng bảo hành 1 đổi 1 đến 36 tháng, miễn phí công lắp đặt & chuyển hệ điều hành tận nơi tại P. Tân Lập, P. Tân An, P. Buôn Ma Thuột.",
        bookingHref: `/dat-lich?dich_vu=${encodeURIComponent(
          "Nâng cấp RAM / SSD"
        )}`,
        serviceHref: "/dich-vu/nang-cap-ram-ssd-linh-kien",
        serviceLabel: "Xem bảng giá nâng cấp RAM & SSD chính hãng",
      };
    case "Cẩm Nang MacBook":
      return {
        heading:
          "Cần kiểm tra pin, nguồn hoặc vệ sinh MacBook chuẩn Lab tại BMT?",
        body: "Kỹ thuật viên chuyên dòng MacBook Intel & Apple Silicon, kiểm tra miễn phí, báo đúng bệnh, bảo hành điện tử minh bạch.",
        bookingHref: `/dat-lich?dich_vu=${encodeURIComponent(
          "Sửa MacBook chuyên nghiệp"
        )}`,
        serviceHref: "/dich-vu/sua-macbook-chuyen-nghiep",
        serviceLabel: "Xem dịch vụ sửa MacBook Air / Pro chuyên nghiệp",
      };
    default:
      return {
        heading: "Cần kỹ thuật viên kiểm tra máy tận nhà tại Buôn Ma Thuột?",
        body: "Có mặt nhanh 15–20 phút tại P. Tân Lập, P. Tân An & P. Buôn Ma Thuột, kiểm tra miễn phí 100%, báo giá minh bạch trước khi sửa.",
        bookingHref: "/dat-lich",
        serviceHref: "/dich-vu/sua-may-tinh-tai-nha-bmt",
        serviceLabel: "Xem dịch vụ sửa máy tính tại nhà BMT",
      };
  }
}

interface ParsedGalleryItem {
  url: string;
  caption?: string;
  name?: string;
}

export function ArticleBody({
  content,
  coverImage,
  title,
  galleryImagesJson,
  category,
  hotline,
  hotlineRaw,
  bookingDiscount,
}: ArticleBodyProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Parse gallery items from JSON
  const parsedGallery = useMemo<ParsedGalleryItem[]>(() => {
    if (!galleryImagesJson) return [];
    try {
      const parsed = JSON.parse(galleryImagesJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [galleryImagesJson]);

  // Extract all images across the article for the Lightbox carousel
  const allArticleImages = useMemo<LightboxImage[]>(() => {
    const list: LightboxImage[] = [];

    // Always include cover image as first item
    if (coverImage) {
      list.push({
        src: coverImage,
        alt: title,
        caption: `Ảnh bìa: ${title}`,
      });
    }

    // Extract inline markdown images ![alt](url)
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match: RegExpExecArray | null;
    while ((match = imgRegex.exec(content)) !== null) {
      const caption = match[1]?.trim() || "";
      const src = match[2]?.trim() || "";
      if (src && !list.some((item) => item.src === src)) {
        list.push({
          src,
          alt: caption || title,
          caption: caption || undefined,
        });
      }
    }

    // Append any gallery images not already included
    for (const item of parsedGallery) {
      if (item.url && !list.some((existing) => existing.src === item.url)) {
        list.push({
          src: item.url,
          alt: item.caption || item.name || title,
          caption: item.caption || item.name,
        });
      }
    }

    return list;
  }, [coverImage, title, content, parsedGallery]);

  const openLightboxForUrl = (src: string) => {
    const foundIdx = allArticleImages.findIndex((img) => img.src === src);
    if (foundIdx !== -1) {
      setActiveImageIdx(foundIdx);
    } else {
      setActiveImageIdx(0);
    }
    setLightboxOpen(true);
  };

  // Split content into blocks
  const blocks = useMemo(() => {
    return content.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  }, [content]);

  const contextualCta = useMemo(() => getContextualCta(category), [category]);

  // Insert contextual CTA once around the midpoint when article has >= 5 blocks & hotline is provided.
  // Never insert immediately after a heading block (## / ###).
  const inlineCtaAfterIdx = useMemo(() => {
    if (blocks.length < 5 || !hotline) return -1;
    let targetIdx = Math.max(2, Math.floor(blocks.length / 2));
    while (
      targetIdx < blocks.length - 1 &&
      (blocks[targetIdx].startsWith("## ") || blocks[targetIdx].startsWith("### "))
    ) {
      targetIdx += 1;
    }
    return targetIdx;
  }, [blocks, hotline]);

  const telHref = hotlineRaw
    ? `tel:${hotlineRaw}`
    : hotline
      ? `tel:${hotline.replace(/\s+/g, "")}`
      : undefined;

  function renderInlineFormatting(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /(\[[^\]]+\]\([^)]+\)|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
        const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
        if (linkMatch) {
          const label = linkMatch[1];
          const href = linkMatch[2].trim();
          const isExternal = /^https?:\/\//i.test(href);
          parts.push(
            <a
              key={match.index}
              href={href}
              {...(isExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="font-semibold text-brand underline decoration-brand/40 underline-offset-2 transition-colors hover:text-brand-hover hover:decoration-brand"
            >
              {label}
            </a>
          );
        } else {
          parts.push(token);
        }
      } else if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={match.index} className="font-semibold text-navy">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("*") && token.endsWith("*")) {
        parts.push(<em key={match.index}>{token.slice(1, -1)}</em>);
      } else if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code
            key={match.index}
            className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-brand font-medium border border-line-subtle"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  }

  // Gallery items that are not explicitly inserted inline into markdown
  const standaloneGalleryItems = useMemo(() => {
    return parsedGallery.filter((item) => !content.includes(item.url));
  }, [parsedGallery, content]);

  return (
    <div className="space-y-8">
      {/* Cover Image with Lightbox click */}
      <div
        className="group relative my-8 overflow-hidden rounded-2xl border border-line bg-surface-muted cursor-pointer transition-shadow hover:shadow-card"
        onClick={() => openLightboxForUrl(coverImage)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightboxForUrl(coverImage);
          }
        }}
        aria-label={`Xem ảnh bìa phóng to: ${title}`}
      >
        <ResponsiveImage
          src={coverImage}
          alt={title}
          width={1000}
          height={520}
          sizes="(max-width: 896px) 100vw, 896px"
          priority
          className="max-h-[460px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-navy/80 px-3 py-1.5 text-xs font-medium text-ink-inverse backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-3.5 w-3.5 text-brand-light" aria-hidden="true" />
          <span>Bấm để phóng to</span>
        </div>
      </div>

      {/* Article Content Stream */}
      <div className="mx-auto max-w-[68ch] space-y-6 text-base leading-relaxed text-ink-body break-words">
        {blocks.map((block, idx) => {
          const renderBlock = () => {
            // Check for Markdown Image: ![Caption](URL)
            const imgMatch = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(block);
            if (imgMatch) {
              const caption = imgMatch[1]?.trim();
              const src = imgMatch[2]?.trim();
              return (
                <figure
                  className="group my-8 overflow-hidden rounded-2xl border border-line bg-surface-muted shadow-card cursor-pointer transition-shadow hover:shadow-lg"
                  onClick={() => openLightboxForUrl(src)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openLightboxForUrl(src);
                    }
                  }}
                  aria-label={`Phóng to hình ảnh: ${caption || title}`}
                >
                  <div className="relative">
                    <ResponsiveImage
                      src={src}
                      alt={caption || title}
                      width={1000}
                      height={560}
                      sizes="(max-width: 896px) 100vw, 896px"
                      className="w-full object-cover max-h-[500px] transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-navy/80 px-3 py-1.5 text-xs font-medium text-ink-inverse backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="h-3.5 w-3.5 text-brand-light" aria-hidden="true" />
                      <span>Xem ảnh gốc</span>
                    </div>
                  </div>
                  {caption && (
                    <figcaption className="flex items-center justify-center gap-1.5 border-t border-line-subtle bg-surface px-4 py-2.5 text-center text-xs font-medium text-ink-muted">
                      <Camera className="h-3.5 w-3.5 text-brand shrink-0" aria-hidden="true" />
                      <span>{caption}</span>
                    </figcaption>
                  )}
                </figure>
              );
            }

            // Check for Horizontal Rule
            if (block === "---" || block === "***") {
              return <hr className="my-8 border-line" />;
            }

            // Check for Markdown Table
            const tableLines = block.trim().split("\n").map((l) => l.trim()).filter(Boolean);
            if (
              tableLines.length >= 2 &&
              tableLines.every((l) => l.startsWith("|") && l.endsWith("|")) &&
              tableLines[1].includes("-")
            ) {
              const headerCells = tableLines[0]
                .slice(1, -1)
                .split("|")
                .map((c) => c.trim());
              const dataRows = tableLines.slice(2);

              return (
                <div className="my-6 overflow-x-auto rounded-xl border border-line shadow-card">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-line bg-surface-subtle text-xs font-semibold uppercase tracking-wider text-navy">
                      <tr>
                        {headerCells.map((h, i) => (
                          <th key={i} className="px-4 py-3">
                            {renderInlineFormatting(h)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line bg-surface">
                      {dataRows.map((row, rIdx) => {
                        const cells = row
                          .slice(1, -1)
                          .split("|")
                          .map((c) => c.trim());
                        return (
                          <tr
                            key={rIdx}
                            className="transition-colors hover:bg-surface-muted/50"
                          >
                            {cells.map((cell, cIdx) => (
                              <td key={cIdx} className="px-4 py-3 text-ink-body">
                                {renderInlineFormatting(cell)}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            }

            // Check for Headings
            if (block.startsWith("### ")) {
              return (
                <h3 className="pt-4 font-heading text-lg font-bold tracking-tight text-navy sm:text-xl">
                  {renderInlineFormatting(block.replace(/^###\s+/, ""))}
                </h3>
              );
            }
            if (block.startsWith("## ")) {
              return (
                <h2 className="pt-6 font-heading text-xl font-bold tracking-tight text-navy sm:text-2xl">
                  {renderInlineFormatting(block.replace(/^##\s+/, ""))}
                </h2>
              );
            }

            // Check for Blockquote / Callout (> )
            if (block.startsWith("> ")) {
              const cleanText = block.replace(/^>\s*/gm, "");
              return (
                <div className="my-5 flex gap-3 rounded-2xl border border-brand/20 bg-brand-light/30 p-4 text-sm text-navy sm:p-5">
                  <Info className="h-5 w-5 text-brand shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="leading-relaxed font-medium">
                    {renderInlineFormatting(cleanText)}
                  </div>
                </div>
              );
            }

            // Check for Bullet Lists
            if (
              block
                .split("\n")
                .every((line) => line.trim().startsWith("- ") || line.trim().startsWith("* "))
            ) {
              const items = block
                .split("\n")
                .map((l) => l.replace(/^[-*]\s+/, "").trim())
                .filter(Boolean);
              return (
                <ul className="my-4 space-y-2 pl-2">
                  {items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2.5 text-ink-body">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      <span className="leading-relaxed">{renderInlineFormatting(item)}</span>
                    </li>
                  ))}
                </ul>
              );
            }

            // Check for Numbered / Ordered Lists (1. 2. 3.)
            if (block.split("\n").every((line) => /^\d+\.\s+/.test(line.trim()))) {
              const items = block
                .split("\n")
                .map((l) => l.replace(/^\d+\.\s+/, "").trim())
                .filter(Boolean);
              return (
                <ol className="my-4 space-y-2 pl-5 list-decimal text-ink-body">
                  {items.map((item, itemIdx) => (
                    <li key={itemIdx} className="leading-relaxed">
                      {renderInlineFormatting(item)}
                    </li>
                  ))}
                </ol>
              );
            }

            // Normal Paragraph
            return (
              <p className="leading-relaxed">
                {renderInlineFormatting(block)}
              </p>
            );
          };

          return (
            <React.Fragment key={idx}>
              {renderBlock()}
              {idx === inlineCtaAfterIdx && hotline && (
                <aside
                  aria-label="Hỗ trợ kỹ thuật MQTech"
                  className="my-8 rounded-2xl border border-line bg-surface-subtle p-5 sm:p-6 shadow-card"
                >
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-brand"
                        aria-hidden="true"
                      />
                      <span>Hỗ trợ tận nơi: P. Tân Lập • P. Tân An • P. Buôn Ma Thuột</span>
                    </div>
                    <h3 className="font-heading text-lg font-bold leading-snug text-navy sm:text-xl">
                      {contextualCta.heading}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-muted">
                      {contextualCta.body}
                    </p>
                    {contextualCta.serviceHref && contextualCta.serviceLabel && (
                      <div>
                        <Link
                          href={contextualCta.serviceHref}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-hover"
                        >
                          <span>{contextualCta.serviceLabel}</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <Link
                        href={contextualCta.bookingHref}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cta px-5 py-2.5 text-sm font-semibold text-ink-inverse shadow-cta-glow transition-all hover:bg-cta-hover hover:-translate-y-0.5"
                      >
                        <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>
                          {bookingDiscount
                            ? `Đặt lịch (Giảm ${bookingDiscount})`
                            : "Đặt lịch ngay"}
                        </span>
                      </Link>
                      {telHref && (
                        <a
                          href={telHref}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-navy bg-surface px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-ink-inverse"
                        >
                          <Phone
                            className="h-4 w-4 shrink-0 text-brand"
                            aria-hidden="true"
                          />
                          <span className="font-mono tabular-nums">
                            {hotline}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                </aside>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Standalone Article Gallery Section (Album ảnh thực tế & Kỹ thuật) */}
      {standaloneGalleryItems.length > 0 && (
        <section
          aria-label="Hình ảnh minh họa thực tế"
          className="mx-auto max-w-[68ch] mt-12 rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="h-5 w-5 text-brand" aria-hidden="true" />
            <h3 className="font-heading text-lg font-bold text-navy">
              Bộ sưu tập hình ảnh thực tế ({standaloneGalleryItems.length})
            </h3>
          </div>
          <p className="text-xs text-ink-muted mb-6">
            Bấm vào từng ảnh để xem chi tiết tình trạng linh kiện và quá trình xử lý kỹ thuật.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {standaloneGalleryItems.map((item, gIdx) => (
              <div
                key={gIdx}
                className="group relative overflow-hidden rounded-xl border border-line bg-surface-muted aspect-[4/3] cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => openLightboxForUrl(item.url)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLightboxForUrl(item.url);
                  }
                }}
                aria-label={`Xem ảnh: ${item.caption || item.name || `Ảnh ${gIdx + 1}`}`}
              >
                <img
                  src={item.url}
                  alt={item.caption || item.name || "Ảnh minh họa thực tế"}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-xs font-medium text-ink-inverse truncate">
                    {item.caption || item.name || "Bấm xem ảnh"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      <ImageLightbox
        images={allArticleImages}
        currentIndex={activeImageIdx}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(newIdx) => setActiveImageIdx(newIdx)}
      />
    </div>
  );
}
