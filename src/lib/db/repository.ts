import { randomUUID } from "node:crypto";
import { generateReferenceCode } from "../utils/reference-code.ts";
import type {
  ServiceRequest,
  RequestStatusHistory,
  ServiceDeliveryMode,
  DeviceCategory,
} from "./types.ts";
import type { CreateServiceRequestDTO } from "../validations/service-request.ts";
import { db } from "./client.ts";

/**
 * In-memory development store for requests when PostgreSQL is not yet connected.
 * Preserves requests in memory during development and automated tests.
 */
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
        await db.query(insertSql, params);

        // Record initial status history
        const historySql = `
          INSERT INTO request_status_history (
            id, request_id, from_status, to_status, changed_by, note, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7);
        `;
        await db.query(historySql, [
          randomUUID(),
          newRequest.id,
          "NONE",
          "AWAITING_CONFIRMATION",
          "CUSTOMER_WEB_INTAKE",
          "Yêu cầu tiếp nhận qua biểu mẫu trực tuyến",
          now,
        ]);

        return newRequest;
      } catch (err) {
        console.warn(
          "PostgreSQL query failed, falling back to development store:",
          err
        );
      }
    }

    // Development/Test fallback store
    devRequestsStore.set(newRequest.referenceCode, newRequest);
    devHistoryStore.push({
      id: randomUUID(),
      requestId: newRequest.id,
      fromStatus: "AWAITING_CONFIRMATION",
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
    const normalized = referenceCode.toUpperCase().trim();

    if (db.isConfigured) {
      try {
        const rows = await db.query<Record<string, unknown>>(
          "SELECT * FROM service_requests WHERE reference_code = $1 LIMIT 1;",
          [normalized]
        );
        if (rows.length > 0) {
          const row = rows[0];
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
            status: "AWAITING_CONFIRMATION",
            adminNotes: row.admin_notes ? String(row.admin_notes) : undefined,
            createdAt: new Date(String(row.created_at)),
            updatedAt: new Date(String(row.updated_at)),
          };
        }
      } catch (err) {
        console.warn("PostgreSQL query failed:", err);
      }
    }

    return devRequestsStore.get(normalized) || null;
  }

  /**
   * Clears the development store (useful for automated tests).
   */
  clearDevStore(): void {
    devRequestsStore.clear();
    devHistoryStore.length = 0;
  }

  /**
   * Total number of records in development store.
   */
  get devStoreCount(): number {
    return devRequestsStore.size;
  }
}

export const serviceRequestRepo = new ServiceRequestRepository();
