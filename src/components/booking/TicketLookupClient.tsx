"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Calendar, Search, ShieldCheck, Wrench } from "lucide-react";
import { TICKET_STATUS_MAP, cn } from "@/lib/utils";
import {
  calculateItemsTotal,
  formatVnd,
  getLineItemTotal,
  parseTicketItems,
} from "@/lib/ticket-items";

interface TicketLookupItem {
  id: number;
  ticketCode: string;
  source: string;
  serviceMode: string;
  deviceType: string;
  deviceModel: string | null;
  serviceCategory: string;
  issueDescription: string;
  appointmentDate: string;
  appointmentSlot: string;
  customerName: string;
  status: string;
  technicianNote: string | null;
  estimatedCost: string | null;
  itemsJson?: string | null;
  warrantyText: string | null;
  warrantyUntil: string | null;
}

export function TicketLookupClient({ initialCode }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode || "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<TicketLookupItem[] | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function doSearch(targetCode: string, targetPhone: string) {
    if (!targetCode.trim() && !targetPhone.trim()) {
      setErrorMsg("Vui lòng nhập Mã phiếu (VD: MQ-2026-1001) hoặc Số điện thoại để tra cứu.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    let timedOut = false;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15_000);

    setErrorMsg(null);
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (targetCode.trim()) qs.set("code", targetCode.trim());
      if (targetPhone.trim()) qs.set("phone", targetPhone.trim());

      const res = await fetch(`/api/tickets/lookup?${qs.toString()}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Không thể tra cứu thông tin lúc này.");
        return;
      }
      setResults(data.tickets || []);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError" && !timedOut) {
        return;
      }
      setErrorMsg(
        timedOut
          ? "Quá thời gian phản hồi 15 giây. Vui lòng kiểm tra mạng và bấm Thử lại."
          : "Mất kết nối máy chủ khi tra cứu. Vui lòng thử lại."
      );
    } finally {
      window.clearTimeout(timeoutId);
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (initialCode) {
      void doSearch(initialCode, "");
    }
    return () => abortRef.current?.abort();
  }, [initialCode]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void doSearch(code, phone);
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8 space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <label
              htmlFor="lookupCode"
              className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2"
            >
              Mã phiếu sửa chữa
            </label>
            <input
              id="lookupCode"
              type="text"
              maxLength={40}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="VD: MQ-2026-1001"
              className="min-h-12 w-full rounded-xl border border-line bg-surface px-4 py-3 font-mono text-base text-navy sm:text-sm"
            />
          </div>

          <div className="sm:col-span-5">
            <label
              htmlFor="lookupPhone"
              className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2"
            >
              Hoặc Số điện thoại
            </label>
            <input
              id="lookupPhone"
              type="tel"
              maxLength={20}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="VD: 0987482573"
              className="min-h-12 w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-navy sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-ink-inverse shadow-brand-glow hover:bg-brand-hover disabled:opacity-60"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>{loading ? "Đang tìm..." : "Tra cứu"}</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-status-danger-line bg-status-danger-bg px-4 py-3 text-xs font-medium text-status-danger-ink"
          >
            <span className="inline-flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-status-danger-ink" aria-hidden="true" />
              {errorMsg}
            </span>
            <button
              type="button"
              onClick={() => void doSearch(code, phone)}
              className="min-h-11 rounded-full bg-status-danger-solid px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-status-danger-hover"
            >
              Thử lại
            </button>
          </div>
        )}
      </form>

      {results !== null && (
        <div aria-live="polite" className="space-y-4">
          {results.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-8 text-center text-sm text-ink-muted">
              Không tìm thấy phiếu sửa chữa nào khớp thông tin vừa nhập. Vui
              lòng kiểm tra lại mã phiếu hoặc số điện thoại đã đăng ký.
            </div>
          ) : (
            results.map((ticket) => {
              const statusInfo = TICKET_STATUS_MAP[ticket.status] ?? {
                label: ticket.status,
                badgeClass: "bg-surface-muted text-ink-body border-line",
              };
              return (
                <div
                  key={ticket.id}
                  className="rounded-2xl border border-line bg-surface p-6 shadow-card"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle pb-4">
                    <div className="min-w-0">
                      <span className="font-mono text-lg font-bold text-brand tabular-nums">
                        {ticket.ticketCode}
                      </span>
                      <p className="text-sm font-semibold text-navy mt-0.5 break-words">
                        {ticket.customerName} • {ticket.deviceType}{" "}
                        {ticket.deviceModel ? `(${ticket.deviceModel})` : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-3.5 py-1 text-xs font-semibold shrink-0",
                        statusInfo.badgeClass
                      )}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Wrench
                        className="h-4 w-4 shrink-0 text-brand mt-0.5"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-ink-muted">Dịch vụ / Lỗi</p>
                        <p className="font-medium text-navy break-words">
                          {ticket.serviceCategory}
                        </p>
                        <p className="text-xs text-ink-muted mt-0.5 break-words">
                          {ticket.issueDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 min-w-0">
                      <Calendar
                        className="h-4 w-4 shrink-0 text-brand mt-0.5"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-ink-muted">
                          Lịch hẹn &amp; Chi phí
                        </p>
                        <p className="font-medium text-navy">
                          {ticket.appointmentDate} ({ticket.appointmentSlot})
                        </p>
                        {ticket.estimatedCost && (
                          <p className="font-mono text-xs font-bold text-brand mt-1 break-words">
                            Chi phí: {ticket.estimatedCost}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 min-w-0">
                      <ShieldCheck
                        className="h-4 w-4 shrink-0 text-status-success-ink mt-0.5"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-ink-muted">
                          Bảo hành điện tử
                        </p>
                        <p className="font-medium text-navy break-words">
                          {ticket.warrantyText || "Đang cập nhật sau nghiệm thu"}
                        </p>
                        {ticket.warrantyUntil && (
                          <p className="font-mono text-xs font-semibold text-status-success-ink mt-0.5 tabular-nums">
                            Hạn BH đến: {ticket.warrantyUntil}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {parseTicketItems(ticket.itemsJson).length > 0 && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface-subtle">
                      <div className="border-b border-line-subtle px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-navy">
                        Chi tiết hạng mục sửa chữa &amp; linh kiện
                      </div>
                      <ul className="divide-y divide-line-subtle bg-surface px-4">
                        {parseTicketItems(ticket.itemsJson).map((item, idx) => {
                          const qty = Math.max(1, Number(item.quantity) || 1);
                          return (
                            <li
                              key={idx}
                              className="flex items-center justify-between gap-3 py-2.5 text-xs sm:text-sm"
                            >
                              <div className="min-w-0">
                                <p className="text-ink-body font-medium">
                                  {item.name}
                                  {qty > 1 && (
                                    <span className="ml-1.5 font-mono text-xs text-ink-muted">
                                      (x{qty})
                                    </span>
                                  )}
                                </p>
                                {item.warranty && (
                                  <p className="text-xs font-semibold text-brand">
                                    • BH: {item.warranty}
                                  </p>
                                )}
                              </div>
                              <span className="font-mono font-semibold text-navy tabular-nums shrink-0">
                                {formatVnd(getLineItemTotal(item))}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-xs sm:text-sm">
                        <span className="font-semibold text-navy">Tổng chi phí:</span>
                        <span className="font-mono font-bold text-brand tabular-nums">
                          {ticket.estimatedCost ||
                            formatVnd(
                              calculateItemsTotal(parseTicketItems(ticket.itemsJson))
                            )}
                        </span>
                      </div>
                    </div>
                  )}

                  {ticket.technicianNote && (
                    <div className="mt-4 rounded-xl bg-surface-subtle px-4 py-3 text-xs text-ink-body break-words">
                      <strong className="text-navy">Ghi chú kỹ thuật: </strong>
                      {ticket.technicianNote}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
