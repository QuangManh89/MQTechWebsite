"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  RefreshCw,
  Search,
  ExternalLink,
  Clock,
  FileText,
  User,
  Phone,
  MapPin,
  Calendar,
  X,
  History,
  Check,
  Shield,
} from "lucide-react";
import type { AdminSession } from "@/lib/auth/session.ts";
import type {
  ServiceRequest,
  RequestStatus,
  RequestStatusHistory,
} from "@/lib/db/types.ts";
import {
  REQUEST_STATUS_META,
  VALID_STATUS_TRANSITIONS,
} from "@/lib/constants/status-lifecycle.ts";
import { MQTECH_SERVICES } from "@/lib/constants/services.ts";

interface StatsData {
  total: number;
  awaitingConfirmation: number;
  confirmed: number;
  inProgress: number;
  waitingForApproval: number;
  completed: number;
  cancelled: number;
}

export function AdminDashboardClient({
  currentUser,
}: {
  currentUser: AdminSession;
}) {
  const router = useRouter();

  // Filter & Pagination States
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Data States
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Detail Modal States
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null
  );
  const [requestHistory, setRequestHistory] = useState<RequestStatusHistory[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [targetStatus, setTargetStatus] = useState<RequestStatus | "">("");
  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok && !cancelled) {
          const statsJson = await statsRes.json();
          setStats(statsJson.data);
        }
      } catch {
        // Ignored in background polling
      }

      try {
        const params = new URLSearchParams();
        if (selectedStatus) params.set("status", selectedStatus);
        if (selectedMode) params.set("serviceMode", selectedMode);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        params.set("page", page.toString());
        params.set("pageSize", pageSize.toString());

        const res = await fetch(`/api/admin/requests?${params.toString()}`);
        if (!res.ok) {
          if (res.status === 401 && !cancelled) {
            router.push("/admin/login");
            return;
          }
          throw new Error("Không thể tải danh sách yêu cầu.");
        }

        const json = await res.json();
        if (!cancelled) {
          setRequests(json.data.items);
          setTotalPages(json.data.totalPages);
          setTotalCount(json.data.total);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [
    selectedStatus,
    selectedMode,
    searchQuery,
    page,
    pageSize,
    router,
    refreshTrigger,
  ]);

  const handleRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  const openDetailModal = async (req: ServiceRequest) => {
    setSelectedRequest(req);
    setDetailLoading(true);
    setTargetStatus("");
    setStatusNote("");
    setStatusError(null);
    setStatusSuccess(null);

    try {
      const res = await fetch(`/api/admin/requests/${req.id}`);
      if (res.ok) {
        const json = await res.json();
        setSelectedRequest(json.data.request);
        setRequestHistory(json.data.history);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !targetStatus) return;
    setUpdatingStatus(true);
    setStatusError(null);
    setStatusSuccess(null);

    try {
      const res = await fetch(`/api/admin/requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          currentStatus: selectedRequest.status,
          note: statusNote.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatusError(json.error || "Cập nhật trạng thái không thành công.");
        return;
      }

      setSelectedRequest(json.data.request);
      setRequestHistory(json.data.history);
      setStatusSuccess(
        `Đã chuyển trạng thái sang "${REQUEST_STATUS_META[targetStatus].label}".`
      );
      setTargetStatus("");
      setStatusNote("");

      // Refresh list & stats in background
      setRefreshTrigger((prev) => prev + 1);
    } catch {
      setStatusError("Lỗi kết nối khi cập nhật trạng thái.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getServiceName = (serviceId: string) => {
    const s = MQTECH_SERVICES.find((item) => item.id === serviceId);
    return s ? s.title : serviceId;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col font-sans">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A0A0B]/90 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-white text-[#0A0A0B] font-bold text-[13px]">
              MQ
            </div>
            <div>
              <div className="font-bold tracking-tight text-white text-[15px] flex items-center gap-2">
                <span>MQTech Admin</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono text-white/70">
                  v1.0
                </span>
              </div>
              <div className="text-[11px] text-white/40">
                Tiếp nhận & Quản lý yêu cầu dịch vụ
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-[12.5px] text-white/60 hover:text-white transition"
            >
              <span>Xem trang web</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] text-white/80">
              <Shield className="h-3.5 w-3.5 text-[#3B82F6]" />
              <span className="font-medium">{currentUser.fullName}</span>
              <span className="text-white/30">•</span>
              <span className="text-white/50 text-[11px]">
                {currentUser.role}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 text-[12px] font-medium text-red-400 hover:bg-red-500/20 transition"
              title="Đăng xuất khỏi hệ thống (thu hồi phiên trên tất cả thiết bị)"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 lg:px-8 py-8 space-y-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <button
              type="button"
              onClick={() => {
                setSelectedStatus("");
                setPage(1);
              }}
              className={`rounded-[16px] p-4 text-left border transition-all ${
                selectedStatus === ""
                  ? "bg-white/10 border-white/30"
                  : "bg-[#121214] border-white/10 hover:border-white/20"
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/50 block">
                Tổng yêu cầu
              </span>
              <span className="text-[26px] font-bold text-white tracking-tight mt-1 block">
                {stats.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedStatus("AWAITING_CONFIRMATION");
                setPage(1);
              }}
              className={`rounded-[16px] p-4 text-left border transition-all ${
                selectedStatus === "AWAITING_CONFIRMATION"
                  ? "bg-amber-500/15 border-amber-500/40"
                  : "bg-[#121214] border-white/10 hover:border-amber-500/20"
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-amber-400/80 block">
                Chờ xác nhận
              </span>
              <span className="text-[26px] font-bold text-amber-400 tracking-tight mt-1 block">
                {stats.awaitingConfirmation}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedStatus("CONFIRMED");
                setPage(1);
              }}
              className={`rounded-[16px] p-4 text-left border transition-all ${
                selectedStatus === "CONFIRMED"
                  ? "bg-blue-500/15 border-blue-500/40"
                  : "bg-[#121214] border-white/10 hover:border-blue-500/20"
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-blue-400/80 block">
                Đã xác nhận
              </span>
              <span className="text-[26px] font-bold text-blue-400 tracking-tight mt-1 block">
                {stats.confirmed}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedStatus("IN_PROGRESS");
                setPage(1);
              }}
              className={`rounded-[16px] p-4 text-left border transition-all ${
                selectedStatus === "IN_PROGRESS"
                  ? "bg-indigo-500/15 border-indigo-500/40"
                  : "bg-[#121214] border-white/10 hover:border-indigo-500/20"
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-indigo-400/80 block">
                Đang xử lý
              </span>
              <span className="text-[26px] font-bold text-indigo-400 tracking-tight mt-1 block">
                {stats.inProgress}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedStatus("WAITING_FOR_APPROVAL");
                setPage(1);
              }}
              className={`rounded-[16px] p-4 text-left border transition-all ${
                selectedStatus === "WAITING_FOR_APPROVAL"
                  ? "bg-purple-500/15 border-purple-500/40"
                  : "bg-[#121214] border-white/10 hover:border-purple-500/20"
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-purple-400/80 block">
                Chờ duyệt
              </span>
              <span className="text-[26px] font-bold text-purple-400 tracking-tight mt-1 block">
                {stats.waitingForApproval}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedStatus("COMPLETED");
                setPage(1);
              }}
              className={`rounded-[16px] p-4 text-left border transition-all ${
                selectedStatus === "COMPLETED"
                  ? "bg-emerald-500/15 border-emerald-500/40"
                  : "bg-[#121214] border-white/10 hover:border-emerald-500/20"
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-400/80 block">
                Hoàn thành
              </span>
              <span className="text-[26px] font-bold text-emerald-400 tracking-tight mt-1 block">
                {stats.completed}
              </span>
            </button>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="rounded-[20px] bg-[#121214] border border-white/10 p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 max-w-[380px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm mã MQT, tên khách, số ĐT..."
                className="w-full rounded-[12px] bg-white/[0.04] border border-white/10 pl-9 pr-4 py-2.5 text-[13.5px] text-white placeholder-white/40 outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            </div>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-[12px] bg-[#18181B] border border-white/10 px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-[#3B82F6] transition"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.values(REQUEST_STATUS_META).map((s) => (
                <option key={s.status} value={s.status}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Mode Dropdown */}
            <select
              value={selectedMode}
              onChange={(e) => {
                setSelectedMode(e.target.value);
                setPage(1);
              }}
              className="rounded-[12px] bg-[#18181B] border border-white/10 px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-[#3B82F6] transition"
            >
              <option value="">Tất cả hình thức</option>
              <option value="IN_STORE">Mang máy đến tiệm</option>
              <option value="ON_SITE">Sửa chữa tận nơi</option>
            </select>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-[12px] text-white/40">
              Tổng {totalCount} kết quả
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[12.5px] font-medium text-white/80 hover:bg-white/10 transition"
              title="Tải lại danh sách"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="rounded-[20px] bg-[#121214] border border-white/10 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 text-center text-white/40 flex flex-col items-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-[#3B82F6]" />
              <span className="text-[14px]">Đang tải danh sách yêu cầu...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-16 text-center text-white/40 flex flex-col items-center gap-3">
              <FileText className="h-8 w-8 text-white/20" />
              <span className="text-[14px] text-white/60">
                Không tìm thấy yêu cầu tiếp nhận nào phù hợp.
              </span>
              <span className="text-[12px] text-white/30">
                Hãy thử đổi điều kiện lọc hoặc xóa từ khóa tìm kiếm.
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13.5px]">
                <thead className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/40">
                  <tr>
                    <th className="px-6 py-4">Mã Tiếp Nhận</th>
                    <th className="px-6 py-4">Khách Hàng</th>
                    <th className="px-6 py-4">Số Điện Thoại</th>
                    <th className="px-6 py-4">Hình Thức & Thiết Bị</th>
                    <th className="px-6 py-4">Dịch Vụ Yêu Cầu</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                    <th className="px-6 py-4">Ngày Nhận</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {requests.map((r) => {
                    const statusMeta = REQUEST_STATUS_META[r.status];
                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4 font-mono font-bold text-white tracking-wider">
                          {r.referenceCode}
                        </td>
                        <td className="px-6 py-4 font-medium text-white">
                          {r.customerName}
                        </td>
                        <td className="px-6 py-4 text-white/70 font-mono text-[12.5px]">
                          {r.customerPhone}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-white/[0.06] text-white/80">
                            {r.serviceMode === "IN_STORE"
                              ? "Tại tiệm"
                              : "Tận nơi"}
                            <span className="text-white/30">•</span>
                            {r.deviceCategory}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/80">
                          {getServiceName(r.serviceCategoryId)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${statusMeta.badgeClass}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/40 text-[12px]">
                          {new Date(r.createdAt).toLocaleString("vi-VN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openDetailModal(r)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-white/20 transition active:scale-[0.98]"
                          >
                            <span>Xử lý</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between text-[13px] text-white/60">
              <span>
                Trang {page} trên {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-full border border-white/10 px-3.5 py-1.5 text-[12px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition"
                >
                  Trang trước
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-full border border-white/10 px-3.5 py-1.5 text-[12px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition"
                >
                  Trang sau
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Request Detail & Transition Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-[720px] max-h-[90vh] overflow-y-auto rounded-[24px] bg-[#121214] border border-white/15 p-6 sm:p-8 shadow-2xl relative text-white">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[20px] font-bold text-white tracking-wider">
                    {selectedRequest.referenceCode}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                      REQUEST_STATUS_META[selectedRequest.status].badgeClass
                    }`}
                  >
                    {REQUEST_STATUS_META[selectedRequest.status].label}
                  </span>
                </div>
                <p className="text-[12px] text-white/40 mt-1">
                  Đã tạo lúc:{" "}
                  {new Date(selectedRequest.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/15 transition text-white/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-6 space-y-6">
              {/* Customer Information Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-[16px] bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[12px] font-medium text-white/40">
                    <User className="h-3.5 w-3.5 text-[#3B82F6]" />
                    <span>Khách hàng</span>
                  </div>
                  <div className="font-semibold text-[15px] text-white">
                    {selectedRequest.customerName}
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-[13px] text-white/80">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    <a
                      href={`tel:${selectedRequest.customerPhone}`}
                      className="hover:underline text-white font-mono"
                    >
                      {selectedRequest.customerPhone}
                    </a>
                  </div>
                </div>

                <div className="rounded-[16px] bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[12px] font-medium text-white/40">
                    <MapPin className="h-3.5 w-3.5 text-[#3B82F6]" />
                    <span>Hình thức phục vụ</span>
                  </div>
                  <div className="font-semibold text-[14px] text-white">
                    {selectedRequest.serviceMode === "IN_STORE"
                      ? "Mang máy đến tiệm"
                      : "Sửa chữa tận nơi"}
                  </div>
                  {selectedRequest.serviceAddress ? (
                    <p className="text-[12.5px] text-white/70 leading-relaxed">
                      {selectedRequest.serviceAddress}
                    </p>
                  ) : (
                    <p className="text-[12px] text-white/40">
                      Khách sẽ mang thiết bị đến tiệm
                    </p>
                  )}
                </div>
              </div>

              {/* Service & Issue Details */}
              <div className="rounded-[16px] bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-white/40">
                    Dịch vụ:{" "}
                    <strong className="text-white">
                      {getServiceName(selectedRequest.serviceCategoryId)}
                    </strong>
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-white/70">
                    Thiết bị: {selectedRequest.deviceCategory}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 block mb-1">
                    Mô tả tình trạng sự cố
                  </span>
                  <p className="text-[13.5px] text-white/90 bg-[#18181B] p-3.5 rounded-[12px] border border-white/10 leading-relaxed">
                    {selectedRequest.issueDescription}
                  </p>
                </div>

                {selectedRequest.preferredContactTime && (
                  <div className="flex items-center gap-2 text-[12.5px] text-white/60">
                    <Calendar className="h-3.5 w-3.5 text-[#3B82F6]" />
                    <span>
                      Khung giờ liên hệ: {selectedRequest.preferredContactTime}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Transition Action Panel */}
              <div className="rounded-[18px] bg-white/[0.04] border border-white/10 p-5 space-y-4">
                <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#3B82F6]" />
                  <span>Cập Nhật Trạng Thái Xử Lý</span>
                </h4>

                {statusError && (
                  <div className="rounded-[10px] bg-red-500/10 border border-red-500/20 p-2.5 text-[12px] text-red-400">
                    {statusError}
                  </div>
                )}
                {statusSuccess && (
                  <div className="rounded-[10px] bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[12px] text-emerald-400">
                    {statusSuccess}
                  </div>
                )}

                {VALID_STATUS_TRANSITIONS[selectedRequest.status].length ===
                0 ? (
                  <div className="rounded-[10px] bg-neutral-500/10 border border-neutral-500/20 p-3 text-[12.5px] text-white/60">
                    Yêu cầu này đã đạt trạng thái kết thúc (
                    {REQUEST_STATUS_META[selectedRequest.status].label}) và không
                    thể chuyển trạng thái thêm.
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="text-[12px] text-white/60 block mb-2">
                        Chọn trạng thái tiếp theo hợp lệ:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {VALID_STATUS_TRANSITIONS[selectedRequest.status].map(
                          (statusKey) => {
                            const meta = REQUEST_STATUS_META[statusKey];
                            const isSelected = targetStatus === statusKey;
                            return (
                              <button
                                key={statusKey}
                                type="button"
                                onClick={() => setTargetStatus(statusKey)}
                                className={`rounded-full px-4 py-2 text-[12.5px] font-semibold border transition ${
                                  isSelected
                                    ? "bg-white text-[#0A0A0B] border-white shadow-sm"
                                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                                }`}
                              >
                                {meta.label}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="statusNote"
                        className="text-[12px] text-white/60 block mb-1.5"
                      >
                        Ghi chú kỹ thuật / nhật ký xử lý:
                      </label>
                      <input
                        id="statusNote"
                        type="text"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="Ví dụ: Đã gọi điện thoại xác nhận, hẹn 15:30 đến lấy máy"
                        className="w-full rounded-[10px] bg-[#18181B] border border-white/10 px-3.5 py-2 text-[13px] text-white placeholder-white/30 outline-none focus:border-[#3B82F6]"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!targetStatus || updatingStatus}
                      onClick={handleUpdateStatus}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-[#0A0A0B] shadow-md hover:bg-[#F5F5F7] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingStatus ? (
                        <span>Đang lưu...</span>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Lưu chuyển trạng thái</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Audit Status History Timeline */}
              <div className="space-y-3">
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-white/50 flex items-center gap-2">
                  <History className="h-4 w-4 text-[#3B82F6]" />
                  <span>Nhật Ký Chuyển Trạng Thái</span>
                </h4>

                {detailLoading ? (
                  <p className="text-[12px] text-white/40">
                    Đang tải nhật ký...
                  </p>
                ) : requestHistory.length === 0 ? (
                  <p className="text-[12px] text-white/40">
                    Chưa có thay đổi trạng thái nào khác.
                  </p>
                ) : (
                  <div className="divide-y divide-white/[0.06] rounded-[14px] bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                    {requestHistory.map((h) => (
                      <div key={h.id} className="p-3.5 text-[12.5px] space-y-1">
                        <div className="flex items-center justify-between text-white/50 text-[11px]">
                          <span>
                            Người thực hiện:{" "}
                            <strong className="text-white">
                              {h.changedBy}
                            </strong>
                          </span>
                          <span>
                            {new Date(h.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-white/60">
                            {h.fromStatus === "NONE"
                              ? "Khởi tạo"
                              : REQUEST_STATUS_META[h.fromStatus]?.label ||
                                h.fromStatus}
                          </span>
                          <span className="text-white/30">→</span>
                          <span className="font-semibold text-[#3B82F6]">
                            {REQUEST_STATUS_META[h.toStatus]?.label ||
                              h.toStatus}
                          </span>
                        </div>
                        {h.note && (
                          <p className="text-[12px] text-white/60 bg-black/20 p-2 rounded-md italic">
                            &quot;{h.note}&quot;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
