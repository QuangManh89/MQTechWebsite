"use client";

import Link from "next/link";
import { CalendarCheck, Facebook, MessageCircle, Phone } from "lucide-react";

interface FloatingQuickContactProps {
  hotline: string;
  hotlineRaw: string;
  zaloUrl: string;
  messengerUrl: string;
}

export function FloatingQuickContact({
  hotline,
  hotlineRaw,
  zaloUrl,
  messengerUrl,
}: FloatingQuickContactProps) {
  return (
    <aside
      aria-label="Liên hệ nhanh"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around gap-1 border-t border-line bg-surface/95 pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:inset-auto sm:bottom-6 sm:right-4 lg:right-6 sm:flex-col sm:items-end sm:gap-2.5 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
    >
      <Link
        href="/dat-lich"
        title="Đặt lịch sửa tại nhà / tại tiệm"
        aria-label="Đặt lịch sửa chữa trực tuyến"
        className="group flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-xl bg-navy px-2 py-2 text-xs font-semibold text-ink-inverse shadow-sm ring-1 ring-surface/15 transition-all hover:bg-brand min-[380px]:gap-1.5 min-[380px]:px-3 sm:h-12 sm:w-12 sm:flex-initial sm:rounded-full sm:p-0 sm:shadow-lg sm:hover:scale-105"
      >
        <CalendarCheck
          className="h-4 w-4 shrink-0 text-brand-glow group-hover:text-ink-inverse sm:h-5 sm:w-5"
          aria-hidden="true"
        />
        <span className="truncate sm:sr-only">Đặt lịch</span>
      </Link>

      <a
        href={messengerUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Nhắn tin Fanpage Facebook"
        aria-label="Nhắn tin Messenger Fanpage"
        className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-xl border border-line bg-surface-subtle px-2 py-2 text-xs font-semibold text-navy transition-all hover:border-brand hover:text-brand min-[380px]:gap-1.5 min-[380px]:px-3 sm:h-12 sm:w-12 sm:flex-initial sm:rounded-full sm:border-0 sm:bg-navy sm:p-0 sm:text-ink-inverse sm:shadow-lg sm:hover:scale-105 sm:hover:bg-brand"
      >
        <Facebook className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden="true" />
        <span className="truncate sm:sr-only">Fanpage</span>
      </a>

      <a
        href={zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Chat Zalo hỗ trợ nhanh"
        aria-label="Chat Zalo MQTech"
        className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-xl border border-brand/30 bg-brand-light px-2 py-2 text-xs font-semibold text-brand transition-all hover:bg-brand hover:text-ink-inverse min-[380px]:gap-1.5 min-[380px]:px-3 sm:h-12 sm:w-12 sm:flex-initial sm:rounded-full sm:border-0 sm:bg-brand sm:p-0 sm:text-ink-inverse sm:shadow-lg sm:hover:scale-105 sm:hover:bg-brand-hover"
      >
        <MessageCircle
          className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
          aria-hidden="true"
        />
        <span className="truncate sm:sr-only">Zalo</span>
      </a>

      <a
        href={`tel:${hotlineRaw}`}
        title={`Gọi ngay ${hotline}`}
        aria-label={`Gọi hotline ${hotline}`}
        className="relative flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-xl bg-brand px-2 py-2 text-xs font-semibold text-ink-inverse shadow-sm transition-all hover:bg-brand-hover min-[380px]:gap-1.5 min-[380px]:px-3 sm:h-14 sm:w-14 sm:flex-initial sm:rounded-full sm:p-0 sm:shadow-brand-glow sm:hover:scale-105 sm:hover:ring-4 sm:hover:ring-brand/25"
      >
        <Phone
          className="relative h-4 w-4 shrink-0 sm:h-6 sm:w-6"
          aria-hidden="true"
        />
        <span className="truncate sm:sr-only">Gọi ngay</span>
      </a>
    </aside>
  );
}
