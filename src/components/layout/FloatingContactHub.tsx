"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageCircle,
  X,
  PhoneCall,
  CalendarCheck,
  ChevronRight,
} from "lucide-react";

const MESSENGER_URL = "https://m.me/suamaytinhbmt";
const ZALO_URL = "https://zalo.me/0987482573";
const HOTLINE_TEL = "tel:0987482573";
const HOTLINE_DISPLAY = "0987 482 573";

export function FloatingContactHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const hubRef = useRef<HTMLDivElement>(null);

  // Automatically show welcome bubble after 3.5s if not previously dismissed in session
  useEffect(() => {
    const isDismissed =
      typeof window !== "undefined" &&
      sessionStorage.getItem("mqtech_chat_bubble_dismissed") === "true";

    if (!isDismissed) {
      const timer = setTimeout(() => {
        setShowBubble(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (hubRef.current && !hubRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleDismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBubble(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("mqtech_chat_bubble_dismissed", "true");
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      setShowBubble(false);
    }
    setIsOpen(!isOpen);
  };

  const handleBookClick = () => {
    setIsOpen(false);
    const intakeSection = document.getElementById("yeu-cau-dich-vu");
    if (intakeSection) {
      intakeSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      ref={hubRef}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-auto"
      aria-label="Kênh liên hệ trực tiếp MQTech"
    >
      {/* Welcome Bubble (shows after 3.5s) */}
      {showBubble && !isOpen && (
        <div className="mb-3 mr-1 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-[280px] sm:max-w-[320px]">
          <div className="relative rounded-2xl bg-white p-3.5 sm:p-4 text-slate-800 shadow-2xl border border-slate-200/90 flex items-start gap-3">
            {/* Pulsing online indicator */}
            <div className="relative mt-0.5 shrink-0">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
            </div>

            <div className="flex-1 text-xs sm:text-[13px] leading-relaxed">
              <div className="font-bold text-slate-900 mb-0.5">
                Kỹ thuật viên MQTech đang online
              </div>
              <p className="text-slate-600">
                👋 Bạn cần hỗ trợ kỹ thuật hoặc báo giá sửa chữa? Nhắn tin qua Facebook hoặc gọi ngay!
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <a
                  href={MESSENGER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowBubble(false)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-[11px] font-bold text-white shadow-xs hover:from-blue-500 hover:to-indigo-500 transition-colors"
                >
                  <span>Chat Messenger</span>
                  <ChevronRight className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={handleDismissBubble}
              aria-label="Đóng thông báo chào đón"
              className="shrink-0 -mr-1 -mt-1 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Bottom pointer triangle */}
            <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 bg-white border-r border-b border-slate-200/90" />
          </div>
        </div>
      )}

      {/* Speed Dial Menu Options (When Opened) */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="mb-3 space-y-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200 flex flex-col items-end"
        >
          {/* Option 1: Facebook Messenger */}
          <a
            href={MESSENGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className="group flex items-center gap-3 rounded-full bg-white pl-4 pr-2 py-2 text-xs sm:text-[13px] font-bold text-slate-800 shadow-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-blue-500/10 hover:shadow-2xl transition-all duration-150"
          >
            <span className="text-slate-700 group-hover:text-blue-600 transition-colors">
              Chat Facebook Messenger
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-[#0084FF] via-[#00B2FF] to-[#A824E8] text-white shadow-md group-hover:scale-105 transition-transform">
              {/* Messenger SVG Icon */}
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
                className="shrink-0"
              >
                <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.513 3.734 7.21V22l3.355-1.842c.91.252 1.88.388 2.911.388 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.042 12.445l-2.583-2.756-5.042 2.756 5.542-5.882 2.667 2.756 4.958-2.756-5.542 5.882z" />
              </svg>
            </div>
          </a>

          {/* Option 2: Zalo Chat */}
          <a
            href={ZALO_URL}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className="group flex items-center gap-3 rounded-full bg-white pl-4 pr-2 py-2 text-xs sm:text-[13px] font-bold text-slate-800 shadow-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-blue-500/10 hover:shadow-2xl transition-all duration-150"
          >
            <span className="text-slate-700 group-hover:text-blue-600 transition-colors">
              Nhắn tin Zalo (0987 482 573)
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#0068FF] text-white shadow-md group-hover:scale-105 transition-transform">
              {/* Zalo Text Icon */}
              <span className="font-extrabold text-[13px] tracking-tighter">Zalo</span>
            </div>
          </a>

          {/* Option 3: Direct Hotline Call */}
          <a
            href={HOTLINE_TEL}
            role="menuitem"
            className="group flex items-center gap-3 rounded-full bg-white pl-4 pr-2 py-2 text-xs sm:text-[13px] font-bold text-slate-800 shadow-xl border border-slate-200/90 hover:border-emerald-400 hover:shadow-emerald-500/10 hover:shadow-2xl transition-all duration-150"
          >
            <span className="text-slate-700 group-hover:text-emerald-600 transition-colors">
              Gọi Hotline: {HOTLINE_DISPLAY}
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white shadow-md group-hover:scale-105 transition-transform">
              <PhoneCall className="h-5 w-5" />
            </div>
          </a>

          {/* Option 4: Service Request Intake Flow */}
          <Link
            href="/#yeu-cau-dich-vu"
            onClick={handleBookClick}
            role="menuitem"
            className="group flex items-center gap-3 rounded-full bg-white pl-4 pr-2 py-2 text-xs sm:text-[13px] font-bold text-slate-800 shadow-xl border border-slate-200/90 hover:border-indigo-400 hover:shadow-2xl transition-all duration-150"
          >
            <span className="text-slate-700 group-hover:text-indigo-600 transition-colors">
              Gửi phiếu yêu cầu sửa chữa
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-white shadow-md group-hover:scale-105 transition-transform">
              <CalendarCheck className="h-5 w-5 text-blue-400" />
            </div>
          </Link>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="relative">
        {/* Pulsing Animated Wave Ring (Visible when closed) */}
        {!isOpen && (
          <div className="absolute -inset-1.5 rounded-full bg-blue-500/40 animate-ping pointer-events-none" />
        )}

        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={isOpen ? "Đóng menu liên hệ" : "Mở kênh chat và liên hệ MQTech"}
          className={`relative flex h-14 w-14 sm:h-15 sm:w-15 items-center justify-center rounded-full shadow-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/50 ${
            isOpen
              ? "bg-slate-900 text-white hover:bg-slate-800 rotate-90"
              : "bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white hover:scale-105 hover:shadow-blue-500/30"
          }`}
        >
          {isOpen ? (
            <X className="h-6 w-6 stroke-[2.5]" />
          ) : (
            <MessageCircle className="h-7 w-7 stroke-[2.2]" />
          )}
        </button>
      </div>
    </div>
  );
}
