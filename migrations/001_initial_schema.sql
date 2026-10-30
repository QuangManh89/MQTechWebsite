-- MQTech Initial Relational Schema Migration
-- Migration: 001_initial_schema.sql
-- Description: Creates core tables for service categories, requests, audit history, and admin accounts.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Service Categories Table
CREATE TABLE IF NOT EXISTS service_categories (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    delivery_modes VARCHAR(32)[] NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Seed confirmed 6 service categories if empty
INSERT INTO service_categories (id, title, slug, description, delivery_modes, active)
VALUES 
    ('svc_desktop_laptop', 'Sửa chữa máy tính bàn & Laptop', 'sua-chua-may-tinh-laptop', 'Khắc phục các sự cố phần cứng, nguồn, màn hình, bàn phím và nâng cấp linh kiện.', ARRAY['IN_STORE', 'ON_SITE'], TRUE),
    ('svc_os_software', 'Cài đặt hệ điều hành & Phần mềm', 'cai-dat-he-dieu-hanh-phan-mem', 'Cài đặt Windows, macOS, phần mềm văn phòng, đồ họa và sao lưu dữ liệu an toàn.', ARRAY['IN_STORE', 'ON_SITE'], TRUE),
    ('svc_maintenance', 'Vệ sinh & Bảo dưỡng thiết bị', 've-sinh-bao-duong-thiet-bi', 'Vệ sinh bụi bẩn, tra keo tản nhiệt cao cấp, tối ưu luồng gió làm mát thiết bị.', ARRAY['IN_STORE', 'ON_SITE'], TRUE),
    ('svc_printer', 'Sửa chữa & Nạp mực máy in', 'sua-chua-nap-muc-may-in', 'Khắc phục sự cố kẹt giấy, bản in mờ, lỗi kết nối và thay mực tận nơi tại Buôn Ma Thuột.', ARRAY['IN_STORE', 'ON_SITE'], TRUE),
    ('svc_network', 'Thi công & Sửa chữa mạng nội bộ', 'thi-cong-sua-chua-mang-noi-bo', 'Xử lý mất kết nối Internet, cấu hình Wi-Fi, modem, router và bấm đầu dây mạng.', ARRAY['ON_SITE'], TRUE),
    ('svc_data_recovery', 'Cứu dữ liệu & Phục hồi ổ cứng', 'cuu-du-lieu-phuc-hoi-o-cung', 'Cứu dữ liệu từ ổ cứng bad sector, xóa nhầm, format hoặc lỗi phân vùng.', ARRAY['IN_STORE'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Service Requests Table
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_code VARCHAR(16) UNIQUE NOT NULL,
    customer_name VARCHAR(128) NOT NULL,
    customer_phone VARCHAR(16) NOT NULL,
    service_mode VARCHAR(16) NOT NULL CHECK (service_mode IN ('IN_STORE', 'ON_SITE')),
    device_category VARCHAR(32) DEFAULT 'LAPTOP' NOT NULL CHECK (
        device_category IN ('LAPTOP', 'PC_DESKTOP', 'PRINTER', 'NETWORK', 'OTHER')
    ),
    service_category_id VARCHAR(64) NOT NULL REFERENCES service_categories(id),
    issue_description TEXT NOT NULL,
    service_address TEXT,
    preferred_contact_time VARCHAR(128),
    status VARCHAR(32) DEFAULT 'AWAITING_CONFIRMATION' NOT NULL CHECK (
        status IN ('AWAITING_CONFIRMATION', 'CONFIRMED', 'IN_PROGRESS', 'WAITING_FOR_APPROVAL', 'COMPLETED', 'CANCELLED')
    ),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for rapid lookup
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_ref_code ON service_requests(reference_code);
CREATE INDEX IF NOT EXISTS idx_service_requests_phone ON service_requests(customer_phone);

-- 3. Request Status History Audit Table
CREATE TABLE IF NOT EXISTS request_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    from_status VARCHAR(32) NOT NULL,
    to_status VARCHAR(32) NOT NULL,
    changed_by VARCHAR(128) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_status_history_request_id ON request_status_history(request_id);

-- 4. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(64) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) DEFAULT 'ADMIN' NOT NULL CHECK (role IN ('ADMIN', 'STAFF')),
    token_version INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
