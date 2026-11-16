-- MQTech Media Storage Metadata Schema Migration
-- Migration: 002_media_storage.sql
-- Description: Creates the media_assets table for tracking media files stored in Cloudflare R2.
-- Note: Binary objects reside exclusively in Cloudflare R2; PostgreSQL tracks only metadata and verification keys.
-- Privacy Boundary: Explicitly distinguishes PUBLIC website assets from PRIVATE customer attachments.

CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_key VARCHAR(512) UNIQUE NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(64) NOT NULL,
    size_bytes BIGINT NOT NULL,
    checksum_sha256 VARCHAR(64),
    width INT,
    height INT,
    alt_text TEXT,
    visibility VARCHAR(32) DEFAULT 'PRIVATE' NOT NULL CHECK (
        visibility IN ('PUBLIC', 'PRIVATE')
    ),
    category VARCHAR(64) DEFAULT 'CUSTOMER_ATTACHMENT' NOT NULL CHECK (
        category IN ('MARKETING', 'SERVICE_ASSET', 'CUSTOMER_ATTACHMENT')
    ),
    uploaded_by VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING' NOT NULL CHECK (
        status IN ('PENDING', 'ACTIVE', 'ARCHIVED', 'DELETED')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_assets_status ON media_assets(status);
CREATE INDEX IF NOT EXISTS idx_media_assets_visibility ON media_assets(visibility);
CREATE INDEX IF NOT EXISTS idx_media_assets_category ON media_assets(category);
CREATE INDEX IF NOT EXISTS idx_media_assets_created_at ON media_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_object_key ON media_assets(object_key);
