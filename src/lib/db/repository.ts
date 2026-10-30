import { randomUUID } from "node:crypto";
import { generateReferenceCode } from "../utils/reference-code.ts";
import type {
  ServiceRequest,
  RequestStatusHistory,
  ServiceDeliveryMode,
  DeviceCategory,
  RequestStatus,
} from "./types.ts";
import type { CreateServiceRequestDTO } from "../validations/service-request.ts";
import { isValidStatusTransition } from "../constants/status-lifecycle.ts";
import { db } from "./client.ts";
import { getAppConfig } from "../env.ts";

export interface ListRequestsOptions {
  status?: RequestStatus;
  serviceMode?: ServiceDeliveryMode;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RequestStats {
  total: number;
  awaitingConfirmation: number;
  confirmed: number;
  inProgress: number;
  waitingForApproval: number;
  completed: number;
  cancelled: number;
}

declare global {
  var __mqtechDevRequests: Map<string, ServiceRequest> | undefined;
  var __mqtechDevHistory: RequestStatusHistory[] | undefined;
}

if (!globalThis.__mqtechDevRequests) {
  globalThis.__mqtechDevRequests = new Map();
}
if (!globalThis.__mqtechDevHistory) {
  globalThis.__mqtechDevHistory = [];
}

const devRequestsStore = globalThis.__mqtechDevRequests;
const devHistoryStore = globalThis.__mqtechDevHistory;

export class ServiceRequestRepository {
  /**
   * Persists a validated service request.
   * Generates a cryptographically secure, unpredictable reference code (e.g. MQT-8X2K9P).
   * Automatically sets status to 'AWAITING_CONFIRMATION'.
   */
  async create(data: CreateServiceRequestDTO): Promise<ServiceRequest> {
    const config = getAppConfig();
    const id = randomUUID();
    let referenceCode = generateReferenceCode("MQT");

    // Ensure uniqueness
    while (await this.findByReferenceCode(referenceCode)) {
      referenceCode = generateReferenceCode("MQT");
    }

    const now = new Date();
    const newRequest: ServiceRequest = {
      id,
      referenceCode,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      serviceMode: data.serviceMode,
      deviceCategory: data.deviceCategory,
      serviceCategoryId: data.serviceCategoryId,
      issueDescription: data.issueDescription,
      serviceAddress: data.serviceAddress,
      preferredContactTime: data.preferredContactTime,
      status: "AWAITING_CONFIRMATION",
      adminNotes: undefined,
      createdAt: now,
      updatedAt: now,
    };

    if (db.isConfigured) {
      try {
        return await db.transaction(async (tx) => {
          const insertSql = `
            INSERT INTO service_requests (
              id, reference_code, customer_name, customer_phone, service_mode,
              device_category, service_category_id, issue_description,
              service_address, preferred_contact_time, status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *;
          `;
          const params = [
            newRequest.id,
            newRequest.referenceCode,
            newRequest.customerName,
            newRequest.customerPhone,
            newRequest.serviceMode,
            newRequest.deviceCategory,
            newRequest.serviceCategoryId,
            newRequest.issueDescription,
            newRequest.serviceAddress || null,
            newRequest.preferredContactTime || null,
            newRequest.status,
            newRequest.createdAt,
            newRequest.updatedAt,
          ];
          await tx.query(insertSql, params);

          // Record initial status history
          const historySql = `
            INSERT INTO request_status_history (
              id, request_id, from_status, to_status, changed_by, note, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7);
          `;
          await tx.query(historySql, [
            randomUUID(),
            newRequest.id,
            "NONE",
            "AWAITING_CONFIRMATION",
            "CUSTOMER_WEB_INTAKE",
            "Yêu cầu tiếp nhận qua biểu mẫu trực tuyến",
            now,
          ]);

          return newRequest;
        });
      } catch (err) {
        if (!config.allowMemoryStore) {
          throw new Error(
            "Lưu trữ yêu cầu thất bại và bộ nhớ tạm không được phép trong môi trường này."
          );
        }
        console.warn(
          "PostgreSQL query failed, falling back to development store:",
          err
        );
      }
    } else if (!config.allowMemoryStore) {
      throw new Error(
        "Yêu cầu cấu hình cơ sở dữ liệu PostgreSQL trong môi trường sản xuất."
      );
    }

    // Development/Test fallback store
    devRequestsStore.set(newRequest.referenceCode, newRequest);
    devHistoryStore.push({
      id: randomUUID(),
      requestId: newRequest.id,
      fromStatus: "NONE",
      toStatus: "AWAITING_CONFIRMATION",
      changedBy: "CUSTOMER_WEB_INTAKE",
      note: "Yêu cầu tiếp nhận qua biểu mẫu trực tuyến",
      createdAt: now,
    });

    return newRequest;
  }

  /**
   * Retrieves a request by its unique reference code.
   * Returns null if not found.
   */
  async findByReferenceCode(referenceCode: string): Promise<ServiceRequest | null> {
    if (!referenceCode) return null;
    const config = getAppConfig();
    const normalized = referenceCode.toUpperCase().trim();

    if (db.isConfigured) {
      try {
        const rows = await db.query<Record<string, unknown>>(
          "SELECT * FROM service_requests WHERE reference_code = $1 LIMIT 1;",
          [normalized]
        );
        if (rows.length > 0) {
          return this.mapRowToRequest(rows[0]);
        }
        return null;
      } catch (err) {
        if (!config.allowMemoryStore) {
          throw new Error(
            "Truy vấn yêu cầu thất bại và bộ nhớ tạm không được phép trong môi trường này."
          );
        }
        console.warn("PostgreSQL query failed:", err);
      }
    } else if (!config.allowMemoryStore) {
      throw new Error(
        "Yêu cầu cấu hình cơ sở dữ liệu PostgreSQL trong môi trường sản xuất."
      );
    }

    return devRequestsStore.get(normalized) || null;
  }

  /**
   * Retrieves a request by its internal UUID id (Admin only).
   */
  async findById(id: string): Promise<ServiceRequest | null> {
    if (!id) return null;
    const config = getAppConfig();

    if (db.isConfigured) {
      try {
        const rows = await db.query<Record<string, unknown>>(
          "SELECT * FROM service_requests WHERE id = $1 LIMIT 1;",
          [id]
        );
        if (rows.length > 0) {
          return this.mapRowToRequest(rows[0]);
        }
        return null;
      } catch (err) {
        if (!config.allowMemoryStore) {
          throw new Error(
            "Truy vấn yêu cầu thất bại và bộ nhớ tạm không được phép trong môi trường này."
          );
        }
        console.warn("PostgreSQL query failed:", err);
      }
    } else if (!config.allowMemoryStore) {
      throw new Error(
        "Yêu cầu cấu hình cơ sở dữ liệu PostgreSQL trong môi trường sản xuất."
      );
    }

    for (const req of devRequestsStore.values()) {
      if (req.id === id) return req;
    }
    return null;
  }

  /**
   * Administrative query: Lists requests with filters, search, and pagination.
   */
  async listRequests(
    options: ListRequestsOptions = {}
  ): Promise<PaginatedResult<ServiceRequest>> {
    const config = getAppConfig();
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(50, Math.max(1, options.pageSize || 10));

    if (db.isConfigured) {
      try {
        const conditions: string[] = [];
        const params: unknown[] = [];
        let paramIdx = 1;

        if (options.status) {
          conditions.push(`status = $${paramIdx++}`);
          params.push(options.status);
        }

        if (options.serviceMode) {
          conditions.push(`service_mode = $${paramIdx++}`);
          params.push(options.serviceMode);
        }

        if (options.search && options.search.trim()) {
          const term = `%${options.search.trim().toLowerCase()}%`;
          conditions.push(
            `(LOWER(reference_code) LIKE $${paramIdx} OR LOWER(customer_name) LIKE $${paramIdx} OR customer_phone LIKE $${paramIdx})`
          );
          params.push(term);
          paramIdx++;
        }

        const whereClause =
          conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Total count
        const countRes = await db.query<{ count: string }>(
          `SELECT COUNT(*) as count FROM service_requests ${whereClause};`,
          params
        );
        const total = parseInt(countRes[0]?.count || "0", 10);

        // Paginated items
        const offset = (page - 1) * pageSize;
        const queryParams = [...params, pageSize, offset];
        const rows = await db.query<Record<string, unknown>>(
          `SELECT * FROM service_requests ${whereClause} ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++};`,
          queryParams
        );

        const items = rows.map((r) => this.mapRowToRequest(r));
        return {
          items,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize) || 1,
        };
      } catch (err) {
        if (!config.allowMemoryStore) {
          throw new Error(
            "Truy vấn danh sách yêu cầu thất bại và bộ nhớ tạm không được phép trong môi trường này."
          );
        }
        console.warn("PostgreSQL list query failed, using dev fallback:", err);
      }
    } else if (!config.allowMemoryStore) {
      throw new Error(
        "Yêu cầu cấu hình cơ sở dữ liệu PostgreSQL trong môi trường sản xuất."
      );
    }

    // In-memory filtered pagination
    let all = Array.from(devRequestsStore.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    if (options.status) {
      all = all.filter((r) => r.status === options.status);
    }
    if (options.serviceMode) {
      all = all.filter((r) => r.serviceMode === options.serviceMode);
    }
    if (options.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      all = all.filter(
        (r) =>
          r.referenceCode.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.customerPhone.includes(q)
      );
    }

    const total = all.length;
    const offset = (page - 1) * pageSize;
    const items = all.slice(offset, offset + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  /**
   * Validated server-side status transition with transactional history logging
   * and optimistic concurrency verification.
   */
  async updateStatus(
    id: string,
    newStatus: RequestStatus,
    changedBy: string,
    note?: string,
    expectedCurrentStatus?: RequestStatus
  ): Promise<{ success: boolean; request?: ServiceRequest; error?: string }> {
    const config = getAppConfig();
    const request = await this.findById(id);
    if (!request) {
      return { success: false, error: "Không tìm thấy yêu cầu dịch vụ." };
    }

    if (expectedCurrentStatus && request.status !== expectedCurrentStatus) {
      return {
        success: false,
        error:
          "Yêu cầu đã được cập nhật bởi một phiên làm việc khác. Vui lòng làm mới trang.",
      };
    }

    if (!isValidStatusTransition(request.status, newStatus)) {
      return {
        success: false,
        error: `Không thể chuyển trạng thái từ "${request.status}" sang "${newStatus}".`,
      };
    }

    const now = new Date();
    const prevStatus = request.status;

    if (db.isConfigured) {
      try {
        return await db.transaction(async (tx) => {
          // Concurrency safe update: checks status matches expected previous state
          const updateRes = await tx.query<Record<string, unknown>>(
            "UPDATE service_requests SET status = $1, updated_at = $2 WHERE id = $3 AND status = $4 RETURNING *;",
            [newStatus, now, id, prevStatus]
          );

          if (updateRes.length === 0) {
            return {
              success: false,
              error:
                "Yêu cầu đã được cập nhật bởi một phiên làm việc khác. Vui lòng làm mới trang.",
            };
          }

          await tx.query(
            `INSERT INTO request_status_history (id, request_id, from_status, to_status, changed_by, note, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7);`,
            [randomUUID(), id, prevStatus, newStatus, changedBy, note || null, now]
          );

          request.status = newStatus;
          request.updatedAt = now;
          return { success: true, request };
        });
      } catch (err) {
        if (!config.allowMemoryStore) {
          throw new Error(
            "Cập nhật trạng thái thất bại và bộ nhớ tạm không được phép trong môi trường này."
          );
        }
        console.warn("PostgreSQL status update failed:", err);
      }
    } else if (!config.allowMemoryStore) {
      throw new Error(
        "Yêu cầu cấu hình cơ sở dữ liệu PostgreSQL trong môi trường sản xuất."
      );
    }

    // In-memory update with concurrency verification
    if (expectedCurrentStatus && request.status !== expectedCurrentStatus) {
      return {
        success: false,
        error:
          "Yêu cầu đã được cập nhật bởi một phiên làm việc khác. Vui lòng làm mới trang.",
      };
    }

    request.status = newStatus;
    request.updatedAt = now;
    if (note) {
      request.adminNotes = request.adminNotes
        ? `${request.adminNotes}\n[${now.toLocaleDateString("vi-VN")}] ${note}`
        : `[${now.toLocaleDateString("vi-VN")}] ${note}`;
    }

    devHistoryStore.push({
      id: randomUUID(),
      requestId: id,
      fromStatus: prevStatus,
      toStatus: newStatus,
      changedBy,
      note,
      createdAt: now,
    });

    return { success: true, request };
  }

  /**
   * Retrieves audit status history for a given request.
   */
  async getStatusHistory(requestId: string): Promise<RequestStatusHistory[]> {
    const config = getAppConfig();

    if (db.isConfigured) {
      try {
        const rows = await db.query<Record<string, unknown>>(
          "SELECT * FROM request_status_history WHERE request_id = $1 ORDER BY created_at ASC;",
          [requestId]
        );
        return rows.map((r) => ({
          id: String(r.id),
          requestId: String(r.request_id),
          fromStatus: r.from_status as RequestStatus,
          toStatus: r.to_status as RequestStatus,
          changedBy: String(r.changed_by),
          note: r.note ? String(r.note) : undefined,
          createdAt: new Date(String(r.created_at)),
        }));
      } catch (err) {
        if (!config.allowMemoryStore) {
          throw new Error(
            "Truy vấn lịch sử thất bại và bộ nhớ tạm không được phép trong môi trường này."
          );
        }
        console.warn("PostgreSQL history query failed:", err);
      }
    } else if (!config.allowMemoryStore) {
      throw new Error(
        "Yêu cầu cấu hình cơ sở dữ liệu PostgreSQL trong môi trường sản xuất."
      );
    }

    return devHistoryStore
      .filter((h) => h.requestId === requestId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Retrieves operational request counts derived from actual data.
   */
  async getStats(): Promise<RequestStats> {
    const config = getAppConfig();
    const stats: RequestStats = {
      total: 0,
      awaitingConfirmation: 0,
      confirmed: 0,
      inProgress: 0,
      waitingForApproval: 0,
      completed: 0,
      cancelled: 0,
    };

    if (db.isConfigured) {
      try {
        const rows = await db.query<{ status: string; count: string }>(
          "SELECT status, COUNT(*) as count FROM service_requests GROUP BY status;"
        );
        for (const row of rows) {
          const count = parseInt(row.count, 10);
          stats.total += count;
          if (row.status === "AWAITING_CONFIRMATION") stats.awaitingConfirmation = count;
          else if (row.status === "CONFIRMED") stats.confirmed = count;
          else if (row.status === "IN_PROGRESS") stats.inProgress = count;
          else if (row.status === "WAITING_FOR_APPROVAL") stats.waitingForApproval = count;
          else if (row.status === "COMPLETED") stats.completed = count;
          else if (row.status === "CANCELLED") stats.cancelled = count;
        }
        return stats;
      } catch (err) {
        if (!config.allowMemoryStore) {
          throw new Error(
            "Truy vấn thống kê thất bại và bộ nhớ tạm không được phép trong môi trường này."
          );
        }
        console.warn("PostgreSQL stats query failed:", err);
      }
    } else if (!config.allowMemoryStore) {
      throw new Error(
        "Yêu cầu cấu hình cơ sở dữ liệu PostgreSQL trong môi trường sản xuất."
      );
    }

    for (const req of devRequestsStore.values()) {
      stats.total++;
      if (req.status === "AWAITING_CONFIRMATION") stats.awaitingConfirmation++;
      else if (req.status === "CONFIRMED") stats.confirmed++;
      else if (req.status === "IN_PROGRESS") stats.inProgress++;
      else if (req.status === "WAITING_FOR_APPROVAL") stats.waitingForApproval++;
      else if (req.status === "COMPLETED") stats.completed++;
      else if (req.status === "CANCELLED") stats.cancelled++;
    }

    return stats;
  }

  private mapRowToRequest(row: Record<string, unknown>): ServiceRequest {
    return {
      id: String(row.id),
      referenceCode: String(row.reference_code),
      customerName: String(row.customer_name),
      customerPhone: String(row.customer_phone),
      serviceMode: row.service_mode as ServiceDeliveryMode,
      deviceCategory: row.device_category as DeviceCategory,
      serviceCategoryId: String(row.service_category_id),
      issueDescription: String(row.issue_description),
      serviceAddress: row.service_address ? String(row.service_address) : undefined,
      preferredContactTime: row.preferred_contact_time
        ? String(row.preferred_contact_time)
        : undefined,
      status: row.status as RequestStatus,
      adminNotes: row.admin_notes ? String(row.admin_notes) : undefined,
      createdAt: new Date(String(row.created_at)),
      updatedAt: new Date(String(row.updated_at)),
    };
  }

  clearDevStore(): void {
    devRequestsStore.clear();
    devHistoryStore.length = 0;
  }

  get devStoreCount(): number {
    return devRequestsStore.size;
  }
}

export const serviceRequestRepo = new ServiceRequestRepository();
