import { MQTECH_SERVICES } from "../constants/services.ts";
import type { ServiceDeliveryMode, DeviceCategory } from "../db/types.ts";

export interface CreateServiceRequestDTO {
  customerName: string;
  customerPhone: string;
  serviceMode: ServiceDeliveryMode;
  deviceCategory: DeviceCategory;
  serviceCategoryId: string;
  issueDescription: string;
  serviceAddress?: string;
  preferredContactTime?: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

const VALID_DELIVERY_MODES: ServiceDeliveryMode[] = ["IN_STORE", "ON_SITE"];
const VALID_DEVICE_CATEGORIES: DeviceCategory[] = [
  "LAPTOP",
  "PC_DESKTOP",
  "PRINTER",
  "NETWORK",
  "OTHER",
];
const VALID_SERVICE_IDS = new Set(MQTECH_SERVICES.map((s) => s.id));

// Vietnamese phone number validation regex: 10 digits starting with 0 (or +84)
const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

// Forbidden keys that must never be accepted from client payloads
const FORBIDDEN_PASSWORD_KEYS = [
  "password",
  "pass",
  "matkhau",
  "mat_khau",
  "windowspassword",
  "windows_password",
  "biospassword",
  "bios_password",
  "emailpassword",
  "email_password",
  "devicepassword",
  "device_password",
  "pin",
  "credentials",
];

export function validateServiceRequestInput(
  rawInput: Record<string, unknown>
): ValidationResult<CreateServiceRequestDTO> {
  const errors: Record<string, string> = {};

  if (!rawInput || typeof rawInput !== "object") {
    return {
      success: false,
      errors: { form: "Dữ liệu yêu cầu không hợp lệ." },
    };
  }

  // Security check: Inspect payload keys for forbidden credential fields
  const payloadKeys = Object.keys(rawInput).map((k) => k.toLowerCase());
  for (const forbidden of FORBIDDEN_PASSWORD_KEYS) {
    if (payloadKeys.includes(forbidden)) {
      return {
        success: false,
        errors: {
          security:
            "Vì lý do bảo mật và quyền riêng tư, MQTech không bao giờ tiếp nhận mật khẩu thiết bị hoặc mật khẩu email của khách hàng qua biểu mẫu trực tuyến.",
        },
      };
    }
  }

  // 1. Customer Name
  const customerName =
    typeof rawInput.customerName === "string"
      ? rawInput.customerName.trim()
      : "";
  if (!customerName) {
    errors.customerName = "Vui lòng nhập họ và tên của bạn.";
  } else if (customerName.length < 2) {
    errors.customerName = "Họ và tên phải có ít nhất 2 ký tự.";
  } else if (customerName.length > 100) {
    errors.customerName = "Họ và tên không được vượt quá 100 ký tự.";
  }

  // 2. Customer Phone
  const rawPhone =
    typeof rawInput.customerPhone === "string"
      ? rawInput.customerPhone.trim().replace(/\s+/g, "")
      : "";
  if (!rawPhone) {
    errors.customerPhone = "Vui lòng nhập số điện thoại liên hệ hoặc Zalo.";
  } else if (!VN_PHONE_REGEX.test(rawPhone)) {
    errors.customerPhone =
      "Số điện thoại không đúng định dạng di động Việt Nam (ví dụ: 0912345678).";
  }

  // 3. Service Delivery Mode
  const serviceMode = rawInput.serviceMode as ServiceDeliveryMode;
  if (!serviceMode || !VALID_DELIVERY_MODES.includes(serviceMode)) {
    errors.serviceMode =
      "Vui lòng chọn hình thức dịch vụ hợp lệ (Tại tiệm hoặc Tận nơi).";
  }

  // 4. Device Category
  const deviceCategory = rawInput.deviceCategory as DeviceCategory;
  if (!deviceCategory || !VALID_DEVICE_CATEGORIES.includes(deviceCategory)) {
    errors.deviceCategory = "Vui lòng chọn loại thiết bị cần hỗ trợ.";
  }

  // 5. Service Category ID
  const serviceCategoryId =
    typeof rawInput.serviceCategoryId === "string"
      ? rawInput.serviceCategoryId.trim()
      : "";
  if (!serviceCategoryId || !VALID_SERVICE_IDS.has(serviceCategoryId)) {
    errors.serviceCategoryId =
      "Vui lòng chọn một trong 6 dịch vụ chính thức của MQTech.";
  }

  // 6. Issue Description
  const issueDescription =
    typeof rawInput.issueDescription === "string"
      ? rawInput.issueDescription.trim()
      : "";
  if (!issueDescription) {
    errors.issueDescription = "Vui lòng mô tả ngắn gọn tình trạng sự cố của máy.";
  } else if (issueDescription.length < 10) {
    errors.issueDescription =
      "Mô tả sự cố phải có ít nhất 10 ký tự để kỹ thuật viên chuẩn bị phương án.";
  } else if (issueDescription.length > 1000) {
    errors.issueDescription = "Mô tả sự cố không được vượt quá 1000 ký tự.";
  }

  // 7. Service Address (Required if ON_SITE mode)
  const serviceAddress =
    typeof rawInput.serviceAddress === "string"
      ? rawInput.serviceAddress.trim()
      : undefined;

  if (serviceMode === "ON_SITE") {
    if (!serviceAddress) {
      errors.serviceAddress =
        "Vui lòng nhập địa chỉ cụ thể tại Buôn Ma Thuột để kỹ thuật viên đến tận nơi.";
    } else if (serviceAddress.length < 5) {
      errors.serviceAddress = "Địa chỉ phải có ít nhất 5 ký tự.";
    } else if (serviceAddress.length > 200) {
      errors.serviceAddress = "Địa chỉ không được vượt quá 200 ký tự.";
    }
  }

  // 8. Preferred Contact Time (Optional)
  const preferredContactTime =
    typeof rawInput.preferredContactTime === "string"
      ? rawInput.preferredContactTime.trim().slice(0, 100)
      : undefined;

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      customerName,
      customerPhone: rawPhone,
      serviceMode,
      deviceCategory,
      serviceCategoryId,
      issueDescription,
      serviceAddress: serviceAddress || undefined,
      preferredContactTime: preferredContactTime || undefined,
    },
  };
}
