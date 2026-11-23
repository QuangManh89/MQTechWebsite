"use client";

import React, { useMemo, useState } from "react";
import { Camera, Image as ImageIcon, ZoomIn, Info } from "lucide-react";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { ImageLightbox, type LightboxImage } from "@/components/ui/ImageLightbox";

interface ArticleBodyProps {
  content: string;
  coverImage: string;
  title: string;
  galleryImagesJson?: string | null;
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
          // Check for Markdown Image: ![Caption](URL)
          const imgMatch = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(block);
          if (imgMatch) {
            const caption = imgMatch[1]?.trim();
            const src = imgMatch[2]?.trim();
            return (
              <figure
                key={idx}
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
            return <hr key={idx} className="my-8 border-line" />;
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
              <div
                key={idx}
                className="my-6 overflow-x-auto rounded-xl border border-line shadow-card"
              >
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
              <h2
                key={idx}
                className="pt-6 font-heading text-xl font-bold tracking-tight text-navy sm:text-2xl"
              >
                {renderInlineFormatting(block.replace(/^###\s+/, ""))}
              </h2>
            );
          }
          if (block.startsWith("## ")) {
            return (
              <h2
                key={idx}
                className="pt-6 font-heading text-xl font-bold tracking-tight text-navy sm:text-2xl"
              >
                {renderInlineFormatting(block.replace(/^##\s+/, ""))}
              </h2>
            );
          }

          // Check for Blockquote / Callout (> )
          if (block.startsWith("> ")) {
            const cleanText = block.replace(/^>\s*/gm, "");
            return (
              <div
                key={idx}
                className="my-5 flex gap-3 rounded-2xl border border-brand/20 bg-brand-light/30 p-4 text-sm text-navy sm:p-5"
              >
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
              <ul key={idx} className="my-4 space-y-2 pl-2">
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
              <ol key={idx} className="my-4 space-y-2 pl-5 list-decimal text-ink-body">
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
            <p key={idx} className="leading-relaxed">
              {renderInlineFormatting(block)}
            </p>
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
