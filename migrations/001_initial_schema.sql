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
    ('svc_desktop_laptop', 'Sửa Chữa Laptop & PC', 'sua-chua-laptop-pc', 'Chẩn đoán lỗi mất nguồn, màn hình, bàn phím, quạt tản nhiệt, bản lề và linh kiện cho mọi dòng máy tính bàn và laptop.', ARRAY['IN_STORE', 'ON_SITE'], TRUE),
    ('svc_windows_software', 'Cài Đặt Windows & Phần Mềm', 'cai-dat-windows-phan-mem', 'Cài đặt hệ điều hành Windows chuẩn, cập nhật driver đầy đủ, diệt virus và tối ưu tốc độ máy hoạt động mượt mà.', ARRAY['IN_STORE', 'ON_SITE'], TRUE),
    ('svc_hardware_upgrade', 'Chẩn Đoán & Nâng Cấp Phần Cứng', 'chan-doan-nang-cap-phan-cung', 'Nâng cấp ổ cứng SSD tốc độ cao, mở rộng dung lượng RAM, thay keo tản nhiệt chuyên dụng và vệ sinh hệ thống làm mát.', ARRAY['IN_STORE', 'ON_SITE'], TRUE),
    ('svc_printer_service', 'Dịch Vụ Máy In Văn Phòng', 'dich-vu-may-in', 'Sửa chữa máy in kẹt giấy, không in được, cài đặt chia sẻ máy in qua mạng LAN và bảo dưỡng hộp mực văn phòng.', ARRAY['IN_STORE', 'ON_SITE'], TRUE),
    ('svc_network_wifi', 'Mạng LAN & Wi-Fi Nội Bộ', 'thi-cong-xu-ly-mang-lan-wifi', 'Thi công bấm đầu dây mạng, cấu hình modem Wi-Fi, khắc phục rớt mạng và mở rộng vùng phủ sóng cho nhà ở và văn phòng.', ARRAY['ON_SITE'], TRUE),
    ('svc_business_it', 'Hỗ Trợ IT Doanh Nghiệp', 'ho-tro-it-doanh-nghiep', 'Gói dịch vụ bảo trì định kỳ, hỗ trợ kỹ thuật máy tính, sao lưu dữ liệu và xử lý sự cố công nghệ thông tin cho doanh nghiệp.', ARRAY['ON_SITE'], TRUE)
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
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
