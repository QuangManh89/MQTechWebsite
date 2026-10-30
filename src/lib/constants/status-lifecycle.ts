import type { RequestStatus } from "../db/types.ts";

export interface StatusMeta {
  status: RequestStatus;
  label: string;
  description: string;
  badgeClass: string;
}

export const REQUEST_STATUS_META: Record<RequestStatus, StatusMeta> = {
  AWAITING_CONFIRMATION: {
    status: "AWAITING_CONFIRMATION",
    label: "Chờ xác nhận",
    description: "Yêu cầu mới tiếp nhận từ website, chờ kỹ thuật viên liên hệ xác nhận",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  CONFIRMED: {
    status: "CONFIRMED",
    label: "Đã xác nhận",
    description: "Đã liên hệ khách hàng qua điện thoại/Zalo và thống nhất thời gian tiếp nhận",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  IN_PROGRESS: {
    status: "IN_PROGRESS",
    label: "Đang xử lý",
    description: "Kỹ thuật viên đang chẩn đoán hoặc tiến hành sửa chữa thiết bị",
    badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  WAITING_FOR_APPROVAL: {
    status: "WAITING_FOR_APPROVAL",
    label: "Chờ khách duyệt",
    description: "Đã kiểm tra và báo giá/phương án chi tiết, chờ khách hàng phản hồi đồng ý",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  COMPLETED: {
    status: "COMPLETED",
    label: "Hoàn thành",
    description: "Đã hoàn tất sửa chữa, kiểm thử đạt chuẩn và bàn giao cho khách hàng",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  CANCELLED: {
    status: "CANCELLED",
    label: "Đã hủy",
    description: "Yêu cầu bị hủy theo đề nghị của khách hàng hoặc do không liên lạc được",
    badgeClass: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  },
};

/**
 * Strict Server-Side State Transition Rules:
 * Enforces valid state progressions and prevents illegal workflow jumps.
 */
export const VALID_STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  AWAITING_CONFIRMATION: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["WAITING_FOR_APPROVAL", "COMPLETED", "CANCELLED"],
  WAITING_FOR_APPROVAL: ["IN_PROGRESS", "CANCELLED"],
  COMPLETED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

/**
 * Validates whether a state transition from `currentStatus` to `nextStatus` is permitted.
 */
export function isValidStatusTransition(
  currentStatus: RequestStatus,
  nextStatus: RequestStatus
): boolean {
  if (currentStatus === nextStatus) return false;
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(nextStatus) : false;
}
