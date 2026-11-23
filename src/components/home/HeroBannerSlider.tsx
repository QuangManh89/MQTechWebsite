"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { cn } from "@/lib/utils";

export interface BannerSlide {
  id: string;
  src: string;
  shortLabel: string;
  alt: string;
  href: string;
}

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: "laptop-pc",
    src: "/banners/laptoppc.webp?v=2",
    shortLabel: "Sửa chữa Laptop & PC",
    alt: "MQTech - Sửa chữa Laptop & PC siêu tốc tại TP. Buôn Ma Thuột, Đắk Lắk: lấy liền 30 - 60 phút, bảo hành 6 - 12 tháng, miễn phí kiểm tra, Hotline 0987 482 573",
    href: `/dat-lich?dich_vu=${encodeURIComponent("Sửa chữa Laptop Windows")}`,
  },
  {
    id: "nang-cap",
    src: "/banners/nangcap.webp",
    shortLabel: "Chẩn đoán & Nâng cấp",
    alt: "MQTech - Chẩn đoán & nâng cấp phần cứng SSD NVMe Gen 4 siêu tốc, mở rộng RAM DDR4/DDR5, thay keo tản nhiệt và vệ sinh làm mát",
    href: `/dat-lich?dich_vu=${encodeURIComponent("Nâng cấp RAM / SSD")}`,
  },
  {
    id: "windows-soft",
    src: "/banners/win.webp",
    shortLabel: "Cài đặt Windows & Phần mềm",
    alt: "MQTech - Cài đặt Windows & phần mềm bảo toàn dữ liệu 100%, diệt sạch mã độc, cập nhật đủ driver lấy liền sau 30 phút",
    href: `/dat-lich?dich_vu=${encodeURIComponent("Sửa máy tính tại nhà BMT")}`,
  },
];

export function HeroBannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hoverOrFocus, setHoverOrFocus] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef<number>(0);
  const deltaXRef = useRef<number>(0);
  const didSwipeRef = useRef<boolean>(false);

  const count = BANNER_SLIDES.length;

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % count);
  }, [count]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    function handleChange(e: MediaQueryListEvent) {
      setReducedMotion(e.matches);
    }
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const clearDragState = useCallback(() => {
    pointerIdRef.current = null;
    startXRef.current = 0;
    deltaXRef.current = 0;
  }, []);

  useEffect(() => {
    window.addEventListener("blur", clearDragState);
    return () => window.removeEventListener("blur", clearDragState);
  }, [clearDragState]);

  useEffect(() => {
    if (reducedMotion || userPaused || hoverOrFocus) return;
    const timer = window.setInterval(() => {
      if (!document.hidden && pointerIdRef.current === null) {
        goNext();
      }
    }, 6000);
    return () => window.clearInterval(timer);
  }, [goNext, hoverOrFocus, reducedMotion, userPaused]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== null) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    deltaXRef.current = 0;
    didSwipeRef.current = false;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== e.pointerId) return;
    deltaXRef.current = e.clientX - startXRef.current;
    if (Math.abs(deltaXRef.current) > 12) {
      didSwipeRef.current = true;
    }
  }

  function handlePointerEnd(e: React.PointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== e.pointerId) return;
    const dx = deltaXRef.current;
    clearDragState();
    if (dx <= -48) {
      goNext();
    } else if (dx >= 48) {
      goPrev();
    }
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Banner dịch vụ nổi bật MQTech"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHoverOrFocus(true)}
      onMouseLeave={() => setHoverOrFocus(false)}
      onFocusCapture={() => setHoverOrFocus(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setHoverOrFocus(false);
        }
      }}
      className="space-y-2.5"
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={clearDragState}
        onLostPointerCapture={clearDragState}
        className="relative overflow-hidden rounded-2xl border border-line bg-navy shadow-card-hover touch-pan-y select-none"
      >
        <div
          className={cn(
            "flex w-full",
            !reducedMotion &&
              "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          )}
          style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
        >
          {BANNER_SLIDES.map((slide, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${idx + 1} / ${count}: ${slide.shortLabel}`}
                aria-hidden={!isCurrent}
                className="w-full shrink-0 aspect-[8/3]"
              >
                <Link
                  href={slide.href}
                  tabIndex={isCurrent ? 0 : -1}
                  aria-label={`${slide.shortLabel} — Đặt lịch ngay`}
                  onClick={(e) => {
                    if (didSwipeRef.current) {
                      e.preventDefault();
                      didSwipeRef.current = false;
                    }
                  }}
                  className="block h-full w-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
                >
                  <ResponsiveImage
                    src={slide.src}
                    alt={slide.alt}
                    width={1920}
                    height={720}
                    sizes="(max-width: 1280px) 100vw, 1216px"
                    priority={idx === 0}
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Chọn nhanh banner dịch vụ"
          className="flex flex-wrap items-center gap-2"
        >
          {BANNER_SLIDES.map((slide, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                aria-pressed={active}
                aria-label={`Banner 0${idx + 1}: ${slide.shortLabel}`}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors sm:px-4",
                  active
                    ? "border-brand bg-brand text-ink-inverse shadow-sm"
                    : "border-line bg-surface text-ink-body hover:border-brand/40 hover:text-navy"
                )}
              >
                <span className="font-mono tabular-nums">0{idx + 1}</span>
                <span className="hidden sm:inline">{slide.shortLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-pressed={userPaused}
              aria-label={
                userPaused
                  ? "Tiếp tục tự động chuyển banner"
                  : "Tạm dừng tự động chuyển banner"
              }
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-navy transition-colors hover:border-brand hover:text-brand"
            >
              {userPaused ? (
                <Play className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Pause className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={goPrev}
            aria-label="Xem banner trước"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-navy transition-colors hover:border-brand hover:text-brand"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Xem banner tiếp theo"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-navy transition-colors hover:border-brand hover:text-brand"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Đang hiển thị banner {activeIndex + 1} trên {count}:{" "}
        {BANNER_SLIDES[activeIndex]?.shortLabel}
      </p>
    </div>
  );
}
