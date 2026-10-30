/**
 * MQTech Database Entity Definitions & Lifecycle Enums
 */

export type ServiceDeliveryMode = "IN_STORE" | "ON_SITE";

export type DeviceCategory =
  | "LAPTOP"
  | "PC_DESKTOP"
  | "PRINTER"
  | "NETWORK"
  | "OTHER";

export type RequestStatus =
  | "AWAITING_CONFIRMATION" // Initial submitted state (Chờ xác nhận)
  | "CONFIRMED"             // Confirmed by staff (Đã xác nhận)
  | "IN_PROGRESS"           // Under active repair (Đang xử lý)
  | "WAITING_FOR_APPROVAL"  // Waiting for customer decision on quote/plan (Chờ khách duyệt)
  | "COMPLETED"             // Service completed and handed over (Hoàn thành)
  | "CANCELLED";            // Cancelled (Đã hủy)

export interface ServiceRequest {
  id: string;
  referenceCode: string; // Random alphanumeric token (e.g. MQT-8X2K)
  customerName: string;
  customerPhone: string;
  serviceMode: ServiceDeliveryMode;
  deviceCategory: DeviceCategory;
  serviceCategoryId: string;
  issueDescription: string;
  serviceAddress?: string; // Required for ON_SITE mode
  preferredContactTime?: string;
  status: RequestStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestStatusHistory {
  id: string;
  requestId: string;
  fromStatus: RequestStatus | "NONE";
  toStatus: RequestStatus;
  changedBy: string;
  note?: string;
  createdAt: Date;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  fullName: string;
  role: "ADMIN" | "STAFF";
  tokenVersion: number;
  isActive: boolean;
  createdAt: Date;
}
