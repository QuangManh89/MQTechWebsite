-- ==============================================================================
-- MQTech PostgreSQL Relational Database Schema DDL
-- Safe, parameterized schema boundaries prepared for Phase P1.
-- This file defines schema structure only; it is not executed against production.
-- ==============================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Service Categories Table
CREATE TABLE IF NOT EXISTS service_categories (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(128) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    short_desc TEXT NOT NULL,
    icon VARCHAR(64) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Service Requests Table
-- Note: A submitted request is explicitly recorded as 'AWAITING_CONFIRMATION'.
-- Sequential IDs are NOT exposed publicly; public lookups use unique reference_code.
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_code VARCHAR(16) UNIQUE NOT NULL,
    customer_name VARCHAR(128) NOT NULL,
    customer_phone VARCHAR(32) NOT NULL,
    service_mode VARCHAR(16) NOT NULL CHECK (service_mode IN ('IN_STORE', 'ON_SITE')),
    service_category_id VARCHAR(64) NOT NULL REFERENCES service_categories(id),
    issue_description TEXT NOT NULL,
    preferred_contact_time VARCHAR(128),
    status VARCHAR(32) DEFAULT 'AWAITING_CONFIRMATION' NOT NULL CHECK (
        status IN ('AWAITING_CONFIRMATION', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    ),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for fast triage and lookups
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_ref_code ON service_requests(reference_code);
CREATE INDEX IF NOT EXISTS idx_service_requests_phone ON service_requests(customer_phone);

-- 3. Request Status History Table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
