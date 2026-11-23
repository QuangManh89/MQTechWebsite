"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Receipt, FileText } from "lucide-react";
import type { RepairTicket, SiteSetting } from "@/db/schema";
import {
  calculateItemsTotal,
  formatVnd,
  getLineItemTotal,
  parseTicketItems,
} from "@/lib/ticket-items";
import { cn } from "@/lib/utils";

type PaperSize = "A4" | "A5" | "K80";

interface InvoicePrintClientProps {
  ticket: RepairTicket;
  settings: SiteSetting;
  qrDataUrl: string;
  lookupUrl: string;
}

export function InvoicePrintClient({
  ticket,
  settings,
  qrDataUrl,
  lookupUrl,
}: InvoicePrintClientProps) {
  const [paper, setPaper] = useState<PaperSize>("A4");

  const pageSizeCss =
    paper === "K80"
      ? "80mm auto"
      : paper === "A5"
      ? "A5 portrait"
      : "A4 portrait";
  const pageMarginCss =
    paper === "K80" ? "3mm" : paper === "A5" ? "7mm" : "12mm";
  const isCompactA5 = paper === "A5";

  const items = parseTicketItems(ticket.itemsJson);
  const itemsTotal = calculateItemsTotal(items);
  const displayTotal =
    ticket.estimatedCost?.trim() ||
    (items.length > 0 ? formatVnd(itemsTotal) : "Liên hệ / Báo sau");

  const createdDateStr = new Date(ticket.createdAt).toLocaleDateString("vi-VN");
  const createdTimeStr = new Date(ticket.createdAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-surface-muted py-6 px-4 print:bg-white print:p-0">
      <style jsx global>{`
        .invoice-print-sheet,
        .invoice-print-sheet * {
          font-family: "Be Vietnam Pro", system-ui, -apple-system, sans-serif !important;
        }
        @media print {
          @page {
            size: ${pageSizeCss};
            margin: ${pageMarginCss};
          }
          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .invoice-keep-print-flex {
            display: flex !important;
          }
          .invoice-keep-print-block {
            display: block !important;
          }
          .invoice-keep-print-grid {
            display: grid !important;
          }
        }
      `}</style>

      {/* Non-printable Toolbar */}
      <div className="mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/phieu-sua"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-navy hover:border-brand hover:text-brand"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Quay lại</span>
          </Link>
          <div>
            <p className="font-heading text-sm font-bold text-navy">
              Xem trước Hóa đơn #{ticket.ticketCode}
            </p>
            <p className="text-[11px] text-ink-muted">
              Chọn khổ giấy phù hợp rồi bấm In / Lưu PDF
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Chọn khổ giấy in"
            className="inline-flex rounded-full border border-line bg-surface-subtle p-1"
          >
            <button
              type="button"
              onClick={() => setPaper("A4")}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors",
                paper === "A4"
                  ? "bg-navy text-ink-inverse shadow-sm"
                  : "text-ink-muted hover:text-navy"
              )}
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Khổ A4</span>
            </button>
            <button
              type="button"
              onClick={() => setPaper("A5")}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors",
                paper === "A5"
                  ? "bg-navy text-ink-inverse shadow-sm"
                  : "text-ink-muted hover:text-navy"
              )}
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Khổ A5</span>
            </button>
            <button
              type="button"
              onClick={() => setPaper("K80")}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors",
                paper === "K80"
                  ? "bg-navy text-ink-inverse shadow-sm"
                  : "text-ink-muted hover:text-navy"
              )}
            >
              <Receipt className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Khổ K80 (80mm)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-brand px-5 py-2 text-xs font-semibold text-ink-inverse shadow-sm hover:bg-brand-hover"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span>In hóa đơn / Lưu PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Sheet */}
      {paper === "A4" || paper === "A5" ? (
        <article
          className={cn(
            "invoice-print-sheet mx-auto w-full rounded-2xl border border-black bg-white text-black shadow-card print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none",
            isCompactA5 ? "max-w-[560px] p-5" : "max-w-[794px] p-9"
          )}
        >
          {/* Header with Brand Logo */}
          <header
            className={cn(
              "invoice-keep-print invoice-keep-print-flex flex flex-nowrap items-start justify-between gap-3 border-b-2 border-black",
              isCompactA5 ? "pb-3" : "pb-4"
            )}
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <img
                src="/brand/logo-light.svg"
                alt={settings.brandName}
                width={isCompactA5 ? 44 : 52}
                height={isCompactA5 ? 44 : 52}
                className={cn(
                  "shrink-0 rounded-xl border border-black p-1",
                  isCompactA5 ? "h-[44px] w-[44px]" : "h-[52px] w-[52px]"
                )}
              />
              <div className="min-w-0 space-y-0.5">
                <h1
                  className={cn(
                    "font-extrabold uppercase tracking-tight text-black",
                    isCompactA5 ? "text-sm" : "text-lg"
                  )}
                >
                  {settings.brandName}
                </h1>
                <p
                  className={cn(
                    "font-bold uppercase tracking-wider text-black",
                    isCompactA5 ? "text-[10px]" : "text-[11px]"
                  )}
                >
                  {settings.subTagline}
                </p>
                <p
                  className={cn(
                    "text-black",
                    isCompactA5 ? "text-[10px]" : "text-xs"
                  )}
                >
                  {settings.address}
                </p>
                <p
                  className={cn(
                    "font-medium text-black",
                    isCompactA5 ? "text-[10px]" : "text-xs"
                  )}
                >
                  Hotline / Zalo:{" "}
                  <span className="font-bold tabular-nums text-black">
                    {settings.hotline}
                  </span>{" "}
                  • Web: {settings.siteUrl || "suamaytinhbmt.id.vn"}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p
                className={cn(
                  "font-bold uppercase tracking-wider text-black",
                  isCompactA5 ? "text-[10px]" : "text-xs"
                )}
              >
                Mã phiếu
              </p>
              <p
                className={cn(
                  "font-extrabold tabular-nums text-black",
                  isCompactA5 ? "text-sm" : "text-lg"
                )}
              >
                {ticket.ticketCode}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-black",
                  isCompactA5 ? "text-[10px]" : "text-[11px]"
                )}
              >
                Ngày: {ticket.appointmentDate || createdDateStr}
              </p>
            </div>
          </header>

          {/* Invoice Title */}
          <div className={cn("text-center", isCompactA5 ? "my-3" : "my-5")}>
            <h2
              className={cn(
                "font-extrabold uppercase tracking-wide text-black",
                isCompactA5 ? "text-base" : "text-xl"
              )}
            >
              Hóa Đơn Sửa Chữa &amp; Phiếu Bảo Hành
            </h2>
          </div>

          {/* Customer & Device Info */}
          <section className="mb-5 grid gap-3 rounded-xl border border-black bg-white p-4 text-xs sm:grid-cols-2 print:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black">
                Thông tin khách hàng
              </p>
              <p className="text-sm font-bold text-black">
                {ticket.customerName}
              </p>
              <p className="font-mono font-semibold text-black">
                SĐT: {ticket.customerPhone}
              </p>
              {ticket.onsiteAddress && (
                <p className="text-black">Đ/C: {ticket.onsiteAddress}</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black">
                Thiết bị tiếp nhận
              </p>
              <p className="font-bold text-black">
                {ticket.deviceType}
                {ticket.deviceModel ? ` • ${ticket.deviceModel}` : ""}
              </p>
              {ticket.serialNumber && (
                <p className="font-mono text-black">
                  SN: {ticket.serialNumber}
                </p>
              )}
              <p className="text-black">
                Tình trạng: {ticket.issueDescription}
              </p>
            </div>
          </section>

          {/* Items Table */}
          <section className="mb-6 overflow-hidden rounded-xl border border-black">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-black bg-white text-[11px] font-bold uppercase tracking-wider text-black">
                <tr>
                  <th className="w-12 px-3.5 py-2.5 text-center border-r border-black">STT</th>
                  <th className="px-3.5 py-2.5 border-r border-black">
                    Hạng mục sửa chữa / Linh kiện thay thế
                  </th>
                  <th className="w-36 px-3.5 py-2.5 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {items.length > 0 ? (
                  items.map((item, idx) => {
                    const qty = Math.max(1, Number(item.quantity) || 1);
                    return (
                      <tr key={idx}>
                        <td className="px-3.5 py-2.5 text-center font-mono text-black border-r border-black">
                          {idx + 1}
                        </td>
                        <td className="px-3.5 py-2.5 font-medium text-black border-r border-black">
                          <div>
                            <span>{item.name}</span>
                            {qty > 1 && (
                              <span className="ml-1.5 font-mono text-[11px] text-black">
                                (x{qty} • {formatVnd(item.price)})
                              </span>
                            )}
                          </div>
                          {item.warranty && (
                            <p className="mt-0.5 text-[11px] font-medium text-black">
                              • Bảo hành: {item.warranty}
                            </p>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-black tabular-nums">
                          {formatVnd(getLineItemTotal(item))}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="px-3.5 py-2.5 text-center font-mono text-black border-r border-black">
                      1
                    </td>
                    <td className="px-3.5 py-2.5 font-medium text-black border-r border-black">
                      <div>
                        <span>{ticket.serviceCategory} — {ticket.issueDescription}</span>
                      </div>
                      {ticket.warrantyText && (
                        <p className="mt-0.5 text-[11px] font-medium text-black">
                          • Bảo hành: {ticket.warrantyText}
                        </p>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-black tabular-nums">
                      {displayTotal}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="border-t-2 border-black bg-white">
                <tr>
                  <td
                    colSpan={2}
                    className="px-3.5 py-3 text-right text-sm font-extrabold uppercase text-black border-r border-black"
                  >
                    Tổng hóa đơn thanh toán:
                  </td>
                  <td className="px-3.5 py-3 text-right font-mono text-base font-extrabold text-black tabular-nums">
                    {displayTotal}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* Signatures (Moved before Warranty per request) */}
          <footer className="invoice-keep-print invoice-keep-print-grid mb-6 grid grid-cols-2 gap-6 pt-2 text-center text-xs">
            <div>
              <p className="font-bold uppercase text-black">Khách hàng</p>
              <p className="text-[11px] italic text-black">
                (Ký &amp; ghi rõ họ tên)
              </p>
              <div className="h-16" />
              <p className="font-semibold text-black">
                {ticket.customerName}
              </p>
            </div>
            <div>
              <p className="font-bold uppercase text-black">
                Đại diện {settings.brandName.split("-")[0].trim()}
              </p>
              <p className="text-[11px] italic text-black">
                (Ký xác nhận &amp; bàn giao)
              </p>
              <div className="h-16" />
              <p className="font-semibold text-black">
                Kỹ thuật viên tiếp nhận
              </p>
            </div>
          </footer>

          {/* Warranty & QR Code (Moved to the bottom per request) */}
          <section className="flex items-center justify-between gap-4 rounded-xl border border-black bg-white p-4 text-xs">
            <div className="space-y-1.5 min-w-0">
              <p className="font-bold uppercase tracking-wider text-black">
                Chế độ bảo hành &amp; Ghi chú
              </p>
              <p className="font-semibold text-black">
                • {ticket.warrantyText || "Bảo hành điện tử theo số điện thoại"}
                {ticket.warrantyUntil
                  ? ` (Hạn đến: ${ticket.warrantyUntil})`
                  : ""}
              </p>
              {ticket.technicianNote && (
                <p className="text-black">
                  • Ghi chú kỹ thuật: {ticket.technicianNote}
                </p>
              )}
              <p className="text-[11px] text-black">
                Quét mã QR bên cạnh hoặc truy cập{" "}
                <span className="font-mono font-semibold text-black">
                  {lookupUrl.replace(/^https?:\/\//, "").split("?")[0]}
                </span>{" "}
                để tra cứu bảo hành bất cứ lúc nào.
              </p>
            </div>
            {qrDataUrl && (
              <div className="shrink-0 text-center">
                <img
                  src={qrDataUrl}
                  alt={`QR tra cứu ${ticket.ticketCode}`}
                  width={88}
                  height={88}
                  className="h-22 w-22 rounded-lg border border-black bg-white p-1"
                />
                <p className="mt-1 font-mono text-[10px] font-bold text-black">
                  Quét tra cứu BH
                </p>
              </div>
            )}
          </section>
        </article>
      ) : (
        /* K80 (80mm) Thermal Receipt Layout */
        <article className="invoice-print-sheet mx-auto w-[302px] rounded-xl border border-black bg-white p-4 text-[11px] leading-snug text-black shadow-card print:w-full print:max-w-[74mm] print:rounded-none print:border-0 print:p-0 print:shadow-none">
          {/* Header */}
          <header className="invoice-keep-print invoice-keep-print-block text-center border-b border-dashed border-black pb-3 space-y-1">
            <img
              src="/brand/logo-light.svg"
              alt={settings.brandName}
              width={40}
              height={40}
              className="mx-auto h-10 w-10"
            />
            <h1 className="font-heading text-sm font-extrabold uppercase text-black">
              {settings.brandName}
            </h1>
            <p className="text-[10px] text-black">{settings.address}</p>
            <p className="font-mono text-xs font-bold text-black">
              Hotline/Zalo: {settings.hotline}
            </p>
          </header>

          {/* Title & Meta */}
          <div className="py-2.5 text-center border-b border-dashed border-black">
            <h2 className="font-heading text-xs font-extrabold uppercase text-black">
              HÓA ĐƠN SỬA CHỮA
            </h2>
            <p className="font-mono text-xs font-bold mt-0.5 text-black">
              Mã: {ticket.ticketCode}
            </p>
            <p className="text-[10px] text-black">
              Ngày: {ticket.appointmentDate || createdDateStr} {createdTimeStr}
            </p>
          </div>

          {/* Customer Info */}
          <div className="py-2.5 border-b border-dashed border-black space-y-0.5 text-black">
            <p>
              <span className="font-bold">Khách:</span> {ticket.customerName}
            </p>
            <p className="font-mono">
              <span className="font-sans font-bold">SĐT:</span>{" "}
              {ticket.customerPhone}
            </p>
            <p>
              <span className="font-bold">Máy:</span> {ticket.deviceType}
              {ticket.deviceModel ? ` (${ticket.deviceModel})` : ""}
            </p>
            {ticket.serialNumber && (
              <p className="font-mono text-[10px]">SN: {ticket.serialNumber}</p>
            )}
          </div>

          {/* Items */}
          <div className="py-2.5 border-b border-dashed border-black space-y-1.5 text-black">
            <div className="flex justify-between font-bold uppercase text-[10px] border-b border-black pb-1">
              <span>Hạng mục</span>
              <span>Thành tiền</span>
            </div>
            {items.length > 0 ? (
              items.map((item, idx) => {
                const qty = Math.max(1, Number(item.quantity) || 1);
                return (
                  <div key={idx} className="flex justify-between gap-2">
                    <span className="flex-1">
                      {idx + 1}. {item.name}
                      {qty > 1 ? ` (x${qty})` : ""}
                      {item.warranty && (
                        <span className="block text-[10px] text-black">
                          • BH: {item.warranty}
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-semibold shrink-0 tabular-nums text-black">
                      {formatVnd(getLineItemTotal(item))}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex justify-between gap-2">
                <span className="flex-1">
                  1. {ticket.serviceCategory}
                  {ticket.warrantyText && (
                    <span className="block text-[10px] text-black">
                      • BH: {ticket.warrantyText}
                    </span>
                  )}
                </span>
                <span className="font-mono font-semibold shrink-0 tabular-nums text-black">
                  {displayTotal}
                </span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="py-2.5 border-b border-dashed border-black flex items-center justify-between text-black">
            <span className="text-xs font-extrabold uppercase">TỔNG CỘNG:</span>
            <span className="font-mono text-sm font-extrabold tabular-nums text-black">
              {displayTotal}
            </span>
          </div>

          {/* Warranty + QR */}
          <div className="pt-2.5 text-center space-y-2 text-black">
            {(ticket.warrantyText || ticket.warrantyUntil) && (
              <p className="text-[10px] font-semibold text-black">
                BH: {ticket.warrantyText || "Bảo hành điện tử"}
                {ticket.warrantyUntil ? ` (đến ${ticket.warrantyUntil})` : ""}
              </p>
            )}
            {qrDataUrl && (
              <div className="flex flex-col items-center">
                <img
                  src={qrDataUrl}
                  alt={`QR ${ticket.ticketCode}`}
                  width={76}
                  height={76}
                  className="h-19 w-19 border border-black bg-white p-0.5 rounded"
                />
                <p className="text-[9px] text-black mt-0.5 font-medium">
                  Quét QR để tra cứu bảo hành điện tử
                </p>
              </div>
            )}
            <p className="text-[10px] italic text-black pt-1">
              Cảm ơn quý khách đã tin tưởng {settings.brandName}!
            </p>
          </div>
        </article>
      )}
    </div>
  );
}
