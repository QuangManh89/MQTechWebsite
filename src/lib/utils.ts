import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTicketCode(prefix = "MQ"): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix.toUpperCase()}-${year}-${randomDigits}`;
}

export const SERVICE_CATEGORIES = [
  { key: "all", label: "Tất cả" },
  { key: "laptop-macbook", label: "Laptop & MacBook" },
  { key: "pc-build", label: "PC & Build Máy Bộ" },
  { key: "clean-upgrade", label: "Vệ Sinh & Nâng Cấp" },
  { key: "onsite-it", label: "Sửa Tại Nhà & IT BMT" },
] as const;

export const TICKET_STATUS_MAP: Record<
  string,
  { label: string; badgeClass: string }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    badgeClass:
      "bg-status-warning-bg text-status-warning-ink border-status-warning-line",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    badgeClass:
      "bg-status-info-bg text-status-info-ink border-status-info-line",
  },
  DIAGNOSING: {
    label: "Đang kiểm tra",
    badgeClass: "bg-brand-light text-brand border-brand-soft",
  },
  REPAIRING: {
    label: "Đang sửa chữa",
    badgeClass: "bg-brand-soft/60 text-brand-hover border-brand/30",
  },
  COMPLETED: {
    label: "Hoàn thành",
    badgeClass:
      "bg-status-success-bg text-status-success-ink border-status-success-line",
  },
  CANCELLED: {
    label: "Đã hủy",
    badgeClass: "bg-surface-muted text-ink-muted border-line",
  },
};

export function getCategoryLabel(key: string): string {
  return (
    SERVICE_CATEGORIES.find((c) => c.key === key)?.label ?? "Dịch vụ kỹ thuật"
  );
}
