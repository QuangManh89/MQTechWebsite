"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  MapPin,
  PhoneCall,
  BookOpen,
} from "lucide-react";
import { BANNER_SLIDES } from "@/lib/constants/guides";

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlay || isHovered) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlay, isHovered, nextSlide]);

  const slide = BANNER_SLIDES[currentSlide];

  return (
    <section className="relative overflow-hidden bg-brand-dark text-white pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-20 border-b border-white/10">
      {/* Structured Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hero-glow opacity-50"
      />

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Top Header & Subheading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300">
              <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Dịch vụ máy tính Buôn Ma Thuột · Trực tiếp &amp; Minh bạch</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Sửa Chữa Chuyên Nghiệp.{" "}
              <span className="text-blue-400">Minh Bạch Từng Quy Trình.</span>
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Chẩn đoán trực tiếp trước mắt bạn, báo giá rõ ràng và niêm phong linh kiện trước khi tiến hành tại Buôn Ma Thuột.
            </p>
          </div>

          {/* Quick Hotline Badge */}
          <div className="shrink-0 flex items-center gap-3">
            <a
              href="tel:0987482573"
              className="inline-flex items-center gap-2.5 rounded-full bg-emerald-600/20 border border-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-600/30 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              title="Gọi hotline hỗ trợ kỹ thuật 24/7"
            >
              <PhoneCall className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>Hotline 24/7: 0987 482 573</span>
            </a>
          </div>
        </div>

        {/* =========================================================================
            MỤC BANNER CAROUSEL (1920x720 Widescreen Display)
            ========================================================================= */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Banner nổi bật dịch vụ MQTech"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-full aspect-[1920/720] overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-neutral-950 shadow-2xl group"
        >
          {/* Banner Images Track */}
          <div className="relative h-full w-full">
            {BANNER_SLIDES.map((item, idx) => {
              const isActive = currentSlide === idx;
              return (
                <div
                  key={item.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} trên ${BANNER_SLIDES.length}: ${item.title}`}
                  aria-hidden={!isActive}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out motion-reduce:transition-none ${
                    isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <Link
                    href={item.href}
                    className="block relative h-full w-full group/banner focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 rounded-2xl sm:rounded-3xl"
                    title={`Bấm để ${item.title}`}
                  >
                    <Image
                      src={item.imageSrc}
                      alt={item.altText}
                      fill
                      priority={idx === 0}
                      unoptimized
                      sizes="(max-width: 1280px) 100vw, 1280px"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover/banner:scale-[1.01] motion-reduce:transform-none"
                    />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows (WCAG 2.5.8 compliant touch targets >= 44x44px) */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Chuyển về banner trước"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 hover:bg-black/75 border border-white/20 text-white backdrop-blur-md transition-all duration-150 opacity-80 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95 motion-reduce:transform-none shadow-lg"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Chuyển sang banner tiếp theo"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 hover:bg-black/75 border border-white/20 text-white backdrop-blur-md transition-all duration-150 opacity-80 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95 motion-reduce:transform-none shadow-lg"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Banner Bottom Controls Bar */}
          <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 z-20 flex items-center justify-between px-3 sm:px-6 pointer-events-none">
            {/* Tag Badge */}
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 text-[11px] font-semibold text-white pointer-events-auto">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span>{slide.tag}</span>
              <span className="text-neutral-400">({currentSlide + 1}/{BANNER_SLIDES.length})</span>
            </div>

            {/* Dots Pagination & Auto-play Pause/Play */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 pointer-events-auto mx-auto sm:mx-0">
              <div className="flex items-center gap-1.5">
                {BANNER_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Xem banner ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                      currentSlide === idx
                        ? "w-7 bg-blue-500 shadow-sm shadow-blue-500/50"
                        : "w-2.5 bg-white/40 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>

              <div className="h-3 w-px bg-white/20 mx-1" />

              <button
                type="button"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                aria-label={isAutoPlay ? "Tạm dừng tự động chuyển banner" : "Bật tự động chuyển banner"}
                className="text-neutral-300 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                title={isAutoPlay ? "Tạm dừng tự động chuyển" : "Tự động chuyển tiếp"}
              >
                {isAutoPlay ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-emerald-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            QUICK ACTIONS & TRUST GUARANTEES BAR
            ========================================================================= */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-md space-y-4">
          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="#yeu-cau-dich-vu"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-transform duration-150 hover:scale-[1.02] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="truncate">Đặt lịch hẹn ngay</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 hidden sm:inline" />
            </Link>

            <a
              href="tel:0987482573"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition-transform duration-150 hover:scale-[1.02] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <PhoneCall className="h-4 w-4 shrink-0" />
              <span className="truncate">Hotline: 0987 482 573</span>
            </a>

            <Link
              href="/device-test"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-3 text-xs sm:text-sm font-semibold text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
              <span className="truncate">Test máy trực tuyến</span>
            </Link>

            <Link
              href="/cam-nang"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <BookOpen className="h-4 w-4 text-neutral-400 shrink-0" />
              <span className="truncate">Cẩm nang sơ cứu</span>
            </Link>
          </div>

          {/* 3 Transparent Guarantees */}
          <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span><strong>Báo giá trước:</strong> Không tự ý thay thế linh kiện</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
              <span><strong>Niêm phong 100%:</strong> Khách ký tên trực tiếp lên linh kiện</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span><strong>Bảo toàn dữ liệu:</strong> Bảo mật file cá nhân tuyệt đối</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
