"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export function ModalDialog({
  open,
  onOpenChange,
  title,
  description,
  maxWidthClass = "max-w-2xl",
  children,
}: ModalDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay-animate fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-2xl border border-line bg-surface p-6 shadow-2xl focus:outline-none",
            maxWidthClass
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4 border-b border-line-subtle pb-3">
            <div className="min-w-0">
              <Dialog.Title className="font-heading text-lg font-bold text-navy break-words">
                {title}
              </Dialog.Title>
              <Dialog.Description
                className={cn(
                  "text-xs text-ink-muted mt-0.5",
                  !description && "sr-only"
                )}
              >
                {description || "Biểu mẫu cập nhật thông tin quản trị MQTech BMT"}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Đóng hộp thoại"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface-muted hover:text-navy"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Xác nhận xóa",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay-animate fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-6 shadow-2xl focus:outline-none">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger-ink">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <Dialog.Title className="font-heading text-lg font-bold text-navy">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-sm leading-relaxed text-ink-muted break-words">
                {description}
              </Dialog.Description>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
            <Dialog.Close
              disabled={loading}
              className="min-h-11 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink-body transition-colors hover:bg-surface-subtle disabled:opacity-60"
            >
              Hủy bỏ
            </Dialog.Close>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="min-h-11 rounded-full bg-status-danger-solid px-5 py-2.5 text-sm font-semibold text-ink-inverse transition-colors hover:bg-status-danger-hover disabled:opacity-60"
            >
              {loading ? "Đang xóa..." : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
