"use client";

import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { formatVnd } from "@/lib/ticket-items";
import { cn } from "@/lib/utils";

export type FinancePeriodMode = "week" | "month" | "quarter" | "year" | "all";

export interface FinanceTx {
  id: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  title: string;
  transactionDate: string;
  paymentMethod: string;
  receiptImageUrl: string | null;
  stockMovementId: number | null;
  note: string | null;
  createdAt: string;
}

export interface CompletedTicketRow {
  id: number;
  ticketCode: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  date: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  itemsCount: number;
}

interface FinanceRevenueChartProps {
  mode: FinancePeriodMode;
  from: string;
  to: string;
  month: string;
  completedTickets: CompletedTicketRow[];
  expenses: FinanceTx[];
  loading?: boolean;
}

interface ChartBucket {
  key: string;
  label: string;
  subLabel?: string;
  fullLabel: string;
  revenue: number;
  cogs: number;
  expense: number;
  operatingExpense: number;
  profit: number;
  ticketCount: number;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function parseYmdLocal(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y || 2026, (m || 1) - 1, d || 1);
}

function formatYmdLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function getTodayVnYm(): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(new Date())
      .slice(0, 7);
  } catch {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
  }
}

function normalizeYmd(raw: string | undefined | null): string {
  if (!raw) return "";
  return raw.slice(0, 10);
}

function formatCompactVnd(value: number): string {
  if (value <= 0) return "0";
  if (value >= 1_000_000_000) {
    const v = value / 1_000_000_000;
    return `${Number.isInteger(v) ? v : v.toFixed(1).replace(".", ",")}Tỷ`;
  }
  if (value >= 1_000_000) {
    const v = value / 1_000_000;
    return `${Number.isInteger(v) ? v : v.toFixed(1).replace(".", ",")}Tr`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }
  return `${Math.round(value)}đ`;
}

function niceCeil(maxVal: number): number {
  if (maxVal <= 0) return 1_000_000;
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
  const normalized = maxVal / magnitude;
  let step = 10;
  if (normalized <= 1.2) step = 1.2;
  else if (normalized <= 1.5) step = 1.5;
  else if (normalized <= 2) step = 2;
  else if (normalized <= 2.5) step = 2.5;
  else if (normalized <= 3) step = 3;
  else if (normalized <= 4) step = 4;
  else if (normalized <= 5) step = 5;
  else if (normalized <= 6) step = 6;
  else if (normalized <= 8) step = 8;
  return Math.ceil(step * magnitude);
}

function buildBuckets(
  mode: FinancePeriodMode,
  from: string,
  to: string,
  month: string,
  completedTickets: CompletedTicketRow[],
  expenses: FinanceTx[]
): ChartBucket[] {
  const buckets: ChartBucket[] = [];
  const indexByKey = new Map<string, number>();

  const pushBucket = (key: string, label: string, fullLabel: string, subLabel?: string) => {
    indexByKey.set(key, buckets.length);
    buckets.push({
      key,
      label,
      subLabel,
      fullLabel,
      revenue: 0,
      cogs: 0,
      expense: 0,
      operatingExpense: 0,
      profit: 0,
      ticketCount: 0,
    });
  };

  if (mode === "week") {
    const start = parseYmdLocal(from);
    const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const dayFull = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const ymd = formatYmdLocal(cur);
      const dm = `${pad2(cur.getDate())}/${pad2(cur.getMonth() + 1)}`;
      pushBucket(ymd, dayLabels[i], `${dayFull[i]} (${dm}/${cur.getFullYear()})`, dm);
    }

    for (const t of completedTickets) {
      const idx = indexByKey.get(normalizeYmd(t.date));
      if (idx !== undefined) {
        buckets[idx].revenue += t.revenue || 0;
        buckets[idx].cogs += t.cogs || 0;
        buckets[idx].ticketCount += 1;
      }
    }
    for (const tx of expenses) {
      const idx = indexByKey.get(normalizeYmd(tx.transactionDate));
      if (idx !== undefined) {
        const amt = tx.amount || 0;
        buckets[idx].expense += amt;
        if (tx.category !== "NHAP_HANG") {
          buckets[idx].operatingExpense += amt;
        }
      }
    }
  } else if (mode === "month") {
    const [yStr, mStr] = (month || getTodayVnYm()).split("-");
    const year = Number(yStr) || new Date().getFullYear();
    const mon = Number(mStr) || new Date().getMonth() + 1;
    const daysInMonth = new Date(year, mon, 0).getDate();
    const mm = pad2(mon);

    pushBucket("w1", "Tuần 1", `Tuần 1 (01–07/${mm}/${year})`, "1–7");
    pushBucket("w2", "Tuần 2", `Tuần 2 (08–14/${mm}/${year})`, "8–14");
    pushBucket("w3", "Tuần 3", `Tuần 3 (15–21/${mm}/${year})`, "15–21");
    pushBucket("w4", "Tuần 4", `Tuần 4 (22–28/${mm}/${year})`, "22–28");
    if (daysInMonth > 28) {
      const tailLabel = daysInMonth === 29 ? "29" : `29–${daysInMonth}`;
      pushBucket(
        "w5",
        tailLabel,
        `Cuối tháng (${tailLabel}/${mm}/${year})`,
        `${mm}/${year}`
      );
    }

    const resolveWeekKey = (ymd: string): string | null => {
      if (!ymd.startsWith(`${year}-${mm}-`)) return null;
      const day = Number(ymd.slice(8, 10));
      if (!day || day < 1) return null;
      if (day <= 7) return "w1";
      if (day <= 14) return "w2";
      if (day <= 21) return "w3";
      if (day <= 28) return "w4";
      return "w5";
    };

    for (const t of completedTickets) {
      const key = resolveWeekKey(normalizeYmd(t.date));
      const idx = key ? indexByKey.get(key) : undefined;
      if (idx !== undefined) {
        buckets[idx].revenue += t.revenue || 0;
        buckets[idx].cogs += t.cogs || 0;
        buckets[idx].ticketCount += 1;
      }
    }
    for (const tx of expenses) {
      const key = resolveWeekKey(normalizeYmd(tx.transactionDate));
      const idx = key ? indexByKey.get(key) : undefined;
      if (idx !== undefined) {
        const amt = tx.amount || 0;
        buckets[idx].expense += amt;
        if (tx.category !== "NHAP_HANG") {
          buckets[idx].operatingExpense += amt;
        }
      }
    }
  } else if (mode === "quarter") {
    const start = parseYmdLocal(from);
    const year = start.getFullYear();
    const startMonth = start.getMonth() + 1;
    for (let i = 0; i < 3; i++) {
      const m = startMonth + i;
      const ym = `${year}-${pad2(m)}`;
      pushBucket(ym, `Tháng ${m}`, `Tháng ${m}/${year}`);
    }

    for (const t of completedTickets) {
      const idx = indexByKey.get(normalizeYmd(t.date).slice(0, 7));
      if (idx !== undefined) {
        buckets[idx].revenue += t.revenue || 0;
        buckets[idx].cogs += t.cogs || 0;
        buckets[idx].ticketCount += 1;
      }
    }
    for (const tx of expenses) {
      const idx = indexByKey.get(normalizeYmd(tx.transactionDate).slice(0, 7));
      if (idx !== undefined) {
        const amt = tx.amount || 0;
        buckets[idx].expense += amt;
        if (tx.category !== "NHAP_HANG") {
          buckets[idx].operatingExpense += amt;
        }
      }
    }
  } else if (mode === "year") {
    const year = Number((from || "").slice(0, 4)) || new Date().getFullYear();
    for (let m = 1; m <= 12; m++) {
      const ym = `${year}-${pad2(m)}`;
      pushBucket(ym, `T${m}`, `Tháng ${m}/${year}`);
    }

    for (const t of completedTickets) {
      const idx = indexByKey.get(normalizeYmd(t.date).slice(0, 7));
      if (idx !== undefined) {
        buckets[idx].revenue += t.revenue || 0;
        buckets[idx].cogs += t.cogs || 0;
        buckets[idx].ticketCount += 1;
      }
    }
    for (const tx of expenses) {
      const idx = indexByKey.get(normalizeYmd(tx.transactionDate).slice(0, 7));
      if (idx !== undefined) {
        const amt = tx.amount || 0;
        buckets[idx].expense += amt;
        if (tx.category !== "NHAP_HANG") {
          buckets[idx].operatingExpense += amt;
        }
      }
    }
  } else {
    // mode === "all": earliest data month to latest data month (or current VN month)
    const allYms: string[] = [];
    for (const t of completedTickets) {
      const ym = normalizeYmd(t.date).slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(ym)) allYms.push(ym);
    }
    for (const tx of expenses) {
      const ym = normalizeYmd(tx.transactionDate).slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(ym)) allYms.push(ym);
    }

    const fallbackYm = getTodayVnYm();
    let minYm = fallbackYm;
    let maxYm = fallbackYm;
    if (allYms.length > 0) {
      allYms.sort();
      minYm = allYms[0];
      maxYm = allYms[allYms.length - 1];
    }

    const [minY, minM] = minYm.split("-").map(Number);
    const [maxY, maxM] = maxYm.split("-").map(Number);
    let curY = minY;
    let curM = minM;
    let guard = 0;
    while ((curY < maxY || (curY === maxY && curM <= maxM)) && guard < 120) {
      const ym = `${curY}-${pad2(curM)}`;
      const shortLabel = `${pad2(curM)}/${String(curY).slice(-2)}`;
      pushBucket(ym, shortLabel, `Tháng ${pad2(curM)}/${curY}`);
      curM += 1;
      if (curM > 12) {
        curM = 1;
        curY += 1;
      }
      guard += 1;
    }

    for (const t of completedTickets) {
      const idx = indexByKey.get(normalizeYmd(t.date).slice(0, 7));
      if (idx !== undefined) {
        buckets[idx].revenue += t.revenue || 0;
        buckets[idx].cogs += t.cogs || 0;
        buckets[idx].ticketCount += 1;
      }
    }
    for (const tx of expenses) {
      const idx = indexByKey.get(normalizeYmd(tx.transactionDate).slice(0, 7));
      if (idx !== undefined) {
        const amt = tx.amount || 0;
        buckets[idx].expense += amt;
        if (tx.category !== "NHAP_HANG") {
          buckets[idx].operatingExpense += amt;
        }
      }
    }
  }

  for (const b of buckets) {
    b.profit = b.revenue - b.cogs - b.operatingExpense;
  }

  return buckets;
}

export function FinanceRevenueChart({
  mode,
  from,
  to,
  month,
  completedTickets,
  expenses,
  loading = false,
}: FinanceRevenueChartProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [pinnedKey, setPinnedKey] = useState<string | null>(null);

  const buckets = useMemo(
    () => buildBuckets(mode, from, to, month, completedTickets, expenses),
    [mode, from, to, month, completedTickets, expenses]
  );

  const hasData = useMemo(
    () => buckets.some((b) => b.revenue > 0 || b.expense > 0),
    [buckets]
  );

  const yMax = useMemo(() => {
    const rawMax = buckets.reduce((acc, b) => {
      return Math.max(acc, b.revenue, b.expense, Math.max(0, b.profit));
    }, 0);
    return niceCeil(rawMax);
  }, [buckets]);

  const yTicks = useMemo(
    () => [yMax, Math.round((yMax * 2) / 3), Math.round(yMax / 3), 0],
    [yMax]
  );

  const activeKey = hoveredKey ?? pinnedKey;
  const activeBucket = useMemo(() => {
    if (activeKey) {
      const found = buckets.find((b) => b.key === activeKey);
      if (found) return found;
    }
    // Default to the latest non-zero bucket so the summary strip is always informative
    for (let i = buckets.length - 1; i >= 0; i--) {
      if (buckets[i].revenue > 0 || buckets[i].expense > 0) {
        return buckets[i];
      }
    }
    return null;
  }, [activeKey, buckets]);

  const modeSubtitle: Record<FinancePeriodMode, string> = {
    week: "Phân bổ theo từng ngày trong tuần (Thứ 2 – Chủ nhật)",
    month: "Gom nhóm theo từng tuần trong tháng để dễ so sánh",
    quarter: "So sánh từng tháng trong quý",
    year: "Tổng quan 12 tháng trong năm",
    all: "Diễn biến theo tháng từ đầu sổ đến hiện tại",
  };

  return (
    <section
      aria-label="Biểu đồ Doanh thu, Phần Chi và Lãi đơn"
      className="rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-card"
    >
      {/* Top Bar: Title + Legend */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand" aria-hidden="true" />
            <h2 className="font-heading text-base font-bold text-navy">
              Biểu đồ Doanh thu – Phần Chi – Lãi đơn
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-ink-muted">{modeSubtitle[mode]}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-navy">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-brand" aria-hidden="true" />
            <span>Doanh thu</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm bg-status-danger-solid"
              aria-hidden="true"
            />
            <span>Phần Chi</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm bg-status-success-solid"
              aria-hidden="true"
            />
            <span>Lãi đơn</span>
          </span>
        </div>
      </div>

      {/* Interactive Pinned / Hovered Bucket Readout Bar */}
      {hasData && activeBucket && !loading && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 rounded-xl border border-line bg-surface-subtle px-3.5 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-navy">
              {activeBucket.fullLabel}
            </span>
            <span className="rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-muted tabular-nums">
              {activeBucket.ticketCount} đơn hoàn thành
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono tabular-nums">
            <span className="text-ink-muted">
              Doanh thu:{" "}
              <strong className="font-bold text-brand">
                {formatVnd(activeBucket.revenue)}
              </strong>
            </span>
            <span className="text-ink-muted">
              Tổng Chi:{" "}
              <strong className="font-bold text-status-danger-ink">
                {formatVnd(activeBucket.expense)}
              </strong>
            </span>
            <span className="text-ink-muted">
              Lãi đơn:{" "}
              <strong
                className={cn(
                  "font-bold",
                  activeBucket.profit >= 0
                    ? "text-status-success-ink"
                    : "text-status-danger-ink"
                )}
              >
                {activeBucket.profit >= 0 ? "+" : ""}
                {formatVnd(activeBucket.profit)}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      {loading ? (
        <div className="mt-4 flex h-56 items-end gap-3 rounded-xl bg-surface-subtle/60 p-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex flex-1 items-end justify-center gap-1">
              <div className="h-28 w-3 animate-pulse rounded-t bg-line" />
              <div className="h-16 w-3 animate-pulse rounded-t bg-line" />
              <div className="h-20 w-3 animate-pulse rounded-t bg-line" />
            </div>
          ))}
        </div>
      ) : !hasData ? (
        <div className="mt-4 flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface-subtle/50 px-4 text-center">
          <BarChart3 className="h-8 w-8 text-ink-muted/60" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-ink-muted">
            Chưa có phát sinh doanh thu/chi phí trong kỳ này
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto pb-1">
          <div
            className={cn(
              "relative flex gap-2",
              buckets.length > 10 ? "min-w-[680px]" : "min-w-[360px]"
            )}
          >
            {/* Y-Axis Labels */}
            <div className="flex h-52 w-12 shrink-0 flex-col justify-between pb-1 text-right font-mono text-[11px] text-ink-muted tabular-nums">
              {yTicks.map((tick, idx) => (
                <span key={idx} className="leading-none">
                  {formatCompactVnd(tick)}
                </span>
              ))}
            </div>

            {/* Plot Area + X-Axis */}
            <div className="relative flex-1">
              {/* Horizontal Gridlines */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 flex h-52 flex-col justify-between"
              >
                {yTicks.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-full border-t",
                      idx === yTicks.length - 1
                        ? "border-line"
                        : "border-dashed border-line/70"
                    )}
                  />
                ))}
              </div>

              {/* Bars */}
              <div className="relative flex h-52 items-end gap-1.5 sm:gap-2.5 px-1">
                {buckets.map((bucket) => {
                  const isActive = activeBucket?.key === bucket.key;
                  const revPct = Math.min(100, (bucket.revenue / yMax) * 100);
                  const expPct = Math.min(100, (bucket.expense / yMax) * 100);
                  const profPct =
                    bucket.profit > 0
                      ? Math.min(100, (bucket.profit / yMax) * 100)
                      : 0;

                  const barWidthClass =
                    buckets.length <= 5
                      ? "w-4 sm:w-6"
                      : buckets.length <= 7
                      ? "w-3 sm:w-4"
                      : "w-2 sm:w-3";

                  return (
                    <button
                      key={bucket.key}
                      type="button"
                      onMouseEnter={() => setHoveredKey(bucket.key)}
                      onMouseLeave={() => setHoveredKey(null)}
                      onFocus={() => setHoveredKey(bucket.key)}
                      onBlur={() => setHoveredKey(null)}
                      onClick={() =>
                        setPinnedKey((prev) =>
                          prev === bucket.key ? null : bucket.key
                        )
                      }
                      aria-label={`${bucket.fullLabel}: Doanh thu ${formatVnd(
                        bucket.revenue
                      )}, Tổng chi ${formatVnd(bucket.expense)}, Lãi đơn ${formatVnd(
                        bucket.profit
                      )}, ${bucket.ticketCount} đơn hoàn thành`}
                      className={cn(
                        "group relative flex h-full flex-1 flex-col items-center justify-end rounded-t-lg px-0.5 pt-2 transition-colors focus:outline-none",
                        isActive
                          ? "bg-brand-light/70 ring-1 ring-inset ring-brand/25"
                          : "hover:bg-surface-subtle/80"
                      )}
                    >
                      <div className="flex h-full w-full items-end justify-center gap-0.5 sm:gap-1">
                        {/* Doanh thu */}
                        <span
                          style={{
                            height: `${
                              bucket.revenue > 0 ? Math.max(revPct, 2) : 0
                            }%`,
                          }}
                          className={cn(
                            "rounded-t bg-brand transition-all duration-300",
                            barWidthClass,
                            isActive ? "opacity-100" : "opacity-90 group-hover:opacity-100"
                          )}
                        />
                        {/* Phần Chi */}
                        <span
                          style={{
                            height: `${
                              bucket.expense > 0 ? Math.max(expPct, 2) : 0
                            }%`,
                          }}
                          className={cn(
                            "rounded-t bg-status-danger-solid transition-all duration-300",
                            barWidthClass,
                            isActive ? "opacity-100" : "opacity-90 group-hover:opacity-100"
                          )}
                        />
                        {/* Lãi đơn */}
                        <span
                          style={{
                            height: `${
                              bucket.profit > 0 ? Math.max(profPct, 2) : 0
                            }%`,
                          }}
                          className={cn(
                            "rounded-t bg-status-success-solid transition-all duration-300",
                            barWidthClass,
                            isActive ? "opacity-100" : "opacity-90 group-hover:opacity-100"
                          )}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* X-Axis Labels */}
              <div className="mt-2 flex gap-1.5 sm:gap-2.5 px-1">
                {buckets.map((bucket) => {
                  const isActive = activeBucket?.key === bucket.key;
                  return (
                    <div
                      key={bucket.key}
                      className="flex flex-1 flex-col items-center text-center"
                    >
                      <span
                        className={cn(
                          "text-[11px] font-semibold leading-tight",
                          isActive ? "text-brand" : "text-navy"
                        )}
                      >
                        {bucket.label}
                      </span>
                      {bucket.subLabel && (
                        <span className="mt-0.5 font-mono text-[10px] text-ink-muted tabular-nums">
                          {bucket.subLabel}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
