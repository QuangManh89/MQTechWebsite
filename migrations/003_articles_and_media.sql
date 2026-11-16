-- MQTech Article & Media Publishing Schema Migration
-- Migration: 003_articles_and_media.sql
-- Description: Creates the articles index table for high-performance search and relational queries,
--              integrating with Cloudflare R2 Object Storage (mqtech-media-staging).

CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    cover_image_url VARCHAR(512),
    category VARCHAR(64) NOT NULL CHECK (
        category IN ('hardware', 'software', 'thermal', 'network', 'tips')
    ),
    category_label VARCHAR(64) NOT NULL,
    read_time VARCHAR(32) DEFAULT '5 phút' NOT NULL,
    difficulty VARCHAR(32) DEFAULT 'Trung bình' NOT NULL,
    status VARCHAR(32) DEFAULT 'PUBLISHED' NOT NULL CHECK (
        status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')
    ),
    views INT DEFAULT 0 NOT NULL,
    r2_object_key VARCHAR(512) NOT NULL,
    author_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_r2_object_key ON articles(r2_object_key);

-- Seed initial authoritative articles
INSERT INTO articles (
    id, slug, title, summary, cover_image_url, category, category_label, read_time, difficulty, status, views, r2_object_key, published_at
) VALUES 
(
    'e6a12b40-8b01-4c6e-a39c-7f5e8d9c0a1b',
    'liquid-spill-emergency',
    'Cấp cứu Laptop bị vào nước hoặc đổ cà phê',
    'Quy trình 3 bước vàng ngắt nguồn điện và sơ cứu máy tính khi bị đổ chất lỏng để giảm thiểu tối đa nguy cơ cháy chập bo mạch chủ.',
    'https://pub-staging.r2.dev/articles/images/sample-liquid-spill.webp',
    'hardware',
    'Cấp cứu phần cứng',
    '3 phút đọc',
    'Cần hỗ trợ kỹ thuật',
    'PUBLISHED',
    342,
    'articles/posts/liquid-spill-emergency.json',
    CURRENT_TIMESTAMP - INTERVAL '14 days'
),
(
    '4a2b9c8d-7e6f-5a4b-3c2d-1e0f9a8b7c6d',
    'blue-screen-bsod-rescue',
    'Xử lý màn hình xanh (BSOD) và vòng lặp Restart',
    'Cách đọc mã lỗi STOP CODE và khởi động vào Safe Mode để sao lưu dữ liệu khẩn cấp trước khi hệ điều hành Windows sụp đổ hoàn toàn.',
    'https://pub-staging.r2.dev/articles/images/sample-bsod.webp',
    'software',
    'Tối ưu phần mềm',
    '5 phút đọc',
    'Trung bình',
    'PUBLISHED',
    518,
    'articles/posts/blue-screen-bsod-rescue.json',
    CURRENT_TIMESTAMP - INTERVAL '10 days'
),
(
    '1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
    'thermal-throttle-maintenance',
    'Nhận biết Laptop quá nhiệt, tự sập nguồn khi làm việc',
    'Dấu hiệu quạt kêu to, vỏ máy nóng ran và máy tự tắt đột ngột do keo tản nhiệt bị khô cứng hoặc bụi bám kín khe tản nhiệt.',
    'https://pub-staging.r2.dev/articles/images/sample-thermal.webp',
    'thermal',
    'Vệ sinh & Tản nhiệt',
    '4 phút đọc',
    'Dễ',
    'PUBLISHED',
    289,
    'articles/posts/thermal-throttle-maintenance.json',
    CURRENT_TIMESTAMP - INTERVAL '5 days'
)
ON CONFLICT (slug) DO NOTHING;
