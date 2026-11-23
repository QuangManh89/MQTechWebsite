"use client";

import React, { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export interface LightboxImage {
  src: string;
  alt?: string;
  caption?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (index: number) => void;
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const current = images[currentIndex];
  const hasMultiple = images.length > 1;

  const handlePrev = useCallback(() => {
    if (!hasMultiple || !onNavigate) return;
    const nextIdx = (currentIndex - 1 + images.length) % images.length;
    onNavigate(nextIdx);
  }, [currentIndex, hasMultiple, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (!hasMultiple || !onNavigate) return;
    const nextIdx = (currentIndex + 1) % images.length;
    onNavigate(nextIdx);
  }, [currentIndex, hasMultiple, images.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh phóng to"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm p-4 sm:p-6 transition-all animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top bar controls */}
      <div
        className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-white/90 border border-white/10">
          <ZoomIn className="h-3.5 w-3.5 text-brand-light" aria-hidden="true" />
          <span>
            {hasMultiple
              ? `Ảnh ${currentIndex + 1} / ${images.length}`
              : "Phóng to hình ảnh"}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cửa sổ phóng to ảnh"
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white transition hover:bg-white/20 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Prev button */}
      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label="Xem ảnh trước"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white transition hover:bg-white/25 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      {/* Next button */}
      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Xem ảnh kế tiếp"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white transition hover:bg-white/25 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          <ChevronRight className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      {/* Main Image container */}
      <div
        className="relative max-h-[85vh] max-w-[92vw] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.alt || current.caption || "Hình ảnh chi tiết bài viết"}
          className="max-h-[76vh] max-w-full rounded-xl object-contain shadow-2xl select-none"
        />

        {(current.caption || current.alt) && (
          <div className="mt-3 max-w-2xl text-center">
            <p className="text-xs sm:text-sm text-white/80 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 inline-block break-words">
              {current.caption || current.alt}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
