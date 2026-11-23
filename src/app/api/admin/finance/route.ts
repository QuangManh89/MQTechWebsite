import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import {
  financeTransactions,
  inventoryItems,
  repairTickets,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth";
import {
  calculateItemsCogs,
  calculateItemsTotal,
  parseTicketItems,
  parseVndString,
} from "@/lib/ticket-items";

export const dynamic = "force-dynamic";

function toDateStr(d: Date): string {
  const vnOffsetMs = 7 * 60 * 60 * 1000;
  return new Date(d.getTime() + vnOffsetMs).toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM
  const fromParam = searchParams.get("from"); // YYYY-MM-DD
  const toParam = searchParams.get("to"); // YYYY-MM-DD

  const nowMonth = toDateStr(new Date()).slice(0, 7);
  const activeMonth = month || (!fromParam && !toParam ? nowMonth : "");

  const [allTx, completedTickets, allInventory] = await Promise.all([
    db
      .select()
      .from(financeTransactions)
      .orderBy(
        desc(financeTransactions.transactionDate),
        desc(financeTransactions.createdAt)
      ),
    db
      .select()
      .from(repairTickets)
      .where(eq(repairTickets.status, "COMPLETED"))
      .orderBy(desc(repairTickets.updatedAt)),
    db.select().from(inventoryItems),
  ]);

  const inRange = (dateStr: string): boolean => {
    if (fromParam && dateStr < fromParam) return false;
    if (toParam && dateStr > toParam) return false;
    if (!fromParam && !toParam && activeMonth && activeMonth !== "ALL") {
      return dateStr.startsWith(activeMonth);
    }
    return true;
  };

  const transactions = allTx.filter((t) => inRange(t.transactionDate));

  // Summarize completed tickets within the selected period
  const periodTickets = completedTickets
    .map((t) => {
      const ticketDate =
        t.appointmentDate && /^\d{4}-\d{2}-\d{2}$/.test(t.appointmentDate)
          ? t.appointmentDate
          : toDateStr(new Date(t.updatedAt));
      const items = parseTicketItems(t.itemsJson);
      const itemsTotal = calculateItemsTotal(items);
      const revenue =
        itemsTotal > 0 ? itemsTotal : parseVndString(t.estimatedCost);
      const cogs = calculateItemsCogs(items);
      return {
        id: t.id,
        ticketCode: t.ticketCode,
        customerName: t.customerName,
        customerPhone: t.customerPhone,
        deviceModel: t.deviceModel || t.deviceType,
        date: ticketDate,
        revenue,
        cogs,
        grossProfit: revenue - cogs,
        itemsCount: items.length,
      };
    })
    .filter((t) => inRange(t.date));

  const repairRevenue = periodTickets.reduce((s, t) => s + t.revenue, 0);
  const repairCogs = periodTickets.reduce((s, t) => s + t.cogs, 0);

  const otherIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);

  const operatingExpenses = transactions
    .filter((t) => t.type === "EXPENSE" && t.category !== "NHAP_HANG")
    .reduce((s, t) => s + t.amount, 0);

  const stockPurchaseCashOut = transactions
    .filter((t) => t.type === "EXPENSE" && t.category === "NHAP_HANG")
    .reduce((s, t) => s + t.amount, 0);

  const totalRevenue = repairRevenue + otherIncome;
  const totalCashOut = operatingExpenses + stockPurchaseCashOut;

  // 2 parallel metrics as designed:
  // 1) Business Profit (P&L) — excludes stock purchase cash out so COGS is not double-counted
  const businessProfit = totalRevenue - repairCogs - operatingExpenses;
  // 2) Actual Cashflow — all cash in minus all cash out including stock purchases
  const cashflow = totalRevenue - totalCashOut;

  const inventoryValue = allInventory.reduce(
    (s, item) => s + Math.max(0, item.quantity) * Math.max(0, item.avgCost),
    0
  );

  // Expense breakdown by category
  const expenseByCategory: Record<string, number> = {};
  for (const tx of transactions) {
    if (tx.type === "EXPENSE") {
      expenseByCategory[tx.category] =
        (expenseByCategory[tx.category] || 0) + tx.amount;
    }
  }

  return NextResponse.json({
    period: {
      month: activeMonth,
      from: fromParam || "",
      to: toParam || "",
    },
    summary: {
      repairRevenue,
      repairCogs,
      otherIncome,
      totalRevenue,
      operatingExpenses,
      stockPurchaseCashOut,
      totalCashOut,
      businessProfit,
      cashflow,
      inventoryValue,
      completedTicketCount: periodTickets.length,
    },
    expenseByCategory,
    transactions,
    completedTickets: periodTickets,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const body = await req.json();

  const type = body.type === "INCOME" ? "INCOME" : "EXPENSE";
  const category = String(
    body.category || (type === "INCOME" ? "THU_KHAC" : "KHAC")
  ).trim();
  const title = String(body.title ?? "").trim();
  const amount = Math.max(0, Math.round(Number(body.amount) || 0));
  const transactionDate =
    body.transactionDate || toDateStr(new Date());
  const paymentMethod = body.paymentMethod === "BANK" ? "BANK" : "CASH";
  const receiptImageUrl = body.receiptImageUrl
    ? String(body.receiptImageUrl).trim()
    : null;
  const note = body.note ? String(body.note).trim() : null;

  if (!title) {
    return NextResponse.json(
      { error: "Vui lòng nhập nội dung thu/chi" },
      { status: 400 }
    );
  }
  if (amount <= 0) {
    return NextResponse.json(
      { error: "Số tiền phải lớn hơn 0" },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(financeTransactions)
    .values({
      type,
      category,
      amount,
      title,
      transactionDate,
      paymentMethod,
      receiptImageUrl,
      note,
    })
    .returning();

  return NextResponse.json({ transaction: created }, { status: 201 });
}
