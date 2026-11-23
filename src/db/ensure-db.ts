import { db, resetCorruptedPglite, runRawSql } from "./index";
import {
  siteSettings,
  services,
  pricingItems,
  posts,
  repairTickets,
  adminUsers,
} from "./schema";
import { count, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const globalForBootstrap = globalThis as unknown as {
  __mqEnsurePromise?: Promise<void>;
};

export const DDL_SQL = `
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  brand_name TEXT NOT NULL DEFAULT 'MQTech - Computer Service',
  sub_tagline TEXT NOT NULL DEFAULT 'DỊCH VỤ SỬA MÁY TÍNH TẠI NHÀ BMT',
  slogan TEXT NOT NULL DEFAULT 'Sự Hài Lòng Của Khách Hàng Là Động Lực Của Chúng Tôi.',
  ticket_prefix TEXT NOT NULL DEFAULT 'MQ',
  hotline TEXT NOT NULL DEFAULT '0987 482 573',
  hotline_raw TEXT NOT NULL DEFAULT '0987482573',
  zalo_url TEXT NOT NULL DEFAULT 'https://zalo.me/0987482573',
  facebook_url TEXT NOT NULL DEFAULT 'https://www.facebook.com/suamaytinhbmt',
  messenger_url TEXT NOT NULL DEFAULT 'https://m.me/suamaytinhbmt',
  email TEXT NOT NULL DEFAULT 'manhquang89@gmail.com',
  address TEXT NOT NULL DEFAULT 'Đường Võ Thị Sáu, P. Tân Lập, TP. Buôn Ma Thuột, Đắk Lắk',
  working_hours TEXT NOT NULL DEFAULT '07:30 - 20:00 (Thứ 2 - Chủ Nhật)',
  site_url TEXT NOT NULL DEFAULT 'https://suamaytinhbmt.id.vn',
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  today_received_count INTEGER NOT NULL DEFAULT 18,
  today_slots_left INTEGER NOT NULL DEFAULT 6,
  booking_discount TEXT NOT NULL DEFAULT '50.000đ',
  show_exact_prices BOOLEAN NOT NULL DEFAULT TRUE,
  telegram_bot_token TEXT NOT NULL DEFAULT '',
  telegram_chat_id TEXT NOT NULL DEFAULT '',
  enable_telegram BOOLEAN NOT NULL DEFAULT FALSE,
  smtp_host TEXT NOT NULL DEFAULT '',
  smtp_port INTEGER NOT NULL DEFAULT 587,
  smtp_user TEXT NOT NULL DEFAULT '',
  smtp_pass TEXT NOT NULL DEFAULT '',
  notify_email_to TEXT NOT NULL DEFAULT 'manhquang89@gmail.com',
  enable_email BOOLEAN NOT NULL DEFAULT FALSE,
  google_site_verification TEXT NOT NULL DEFAULT '',
  google_analytics_id TEXT NOT NULL DEFAULT '',
  google_maps_embed_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  short_desc TEXT NOT NULL,
  description TEXT NOT NULL,
  price_from TEXT NOT NULL,
  warranty TEXT NOT NULL,
  duration TEXT NOT NULL,
  image_url TEXT NOT NULL,
  symptoms_json TEXT NOT NULL DEFAULT '[]',
  service_prices_json TEXT NOT NULL DEFAULT '[]',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_items (
  id SERIAL PRIMARY KEY,
  tab_category TEXT NOT NULL,
  service_name TEXT NOT NULL,
  price_text TEXT NOT NULL,
  duration TEXT NOT NULL,
  warranty TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Kỹ thuật MQTech',
  read_time_minutes INTEGER NOT NULL DEFAULT 5,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  gallery_images TEXT NOT NULL DEFAULT '[]',
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS repair_tickets (
  id SERIAL PRIMARY KEY,
  ticket_code TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'ONLINE',
  service_mode TEXT NOT NULL DEFAULT 'ONSITE',
  onsite_address TEXT,
  device_type TEXT NOT NULL,
  service_category TEXT NOT NULL,
  device_model TEXT,
  serial_number TEXT,
  issue_description TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  appointment_slot TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  technician_note TEXT,
  estimated_cost TEXT,
  items_json TEXT NOT NULL DEFAULT '[]',
  warranty_text TEXT,
  warranty_until TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW',
  admin_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Linh kiện khác',
  unit TEXT NOT NULL DEFAULT 'Cái',
  quantity INTEGER NOT NULL DEFAULT 0,
  avg_cost INTEGER NOT NULL DEFAULT 0,
  sell_price INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 2,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  quantity_change INTEGER NOT NULL,
  unit_cost INTEGER NOT NULL DEFAULT 0,
  total_cost INTEGER NOT NULL DEFAULT 0,
  ticket_id INTEGER,
  ticket_code TEXT,
  supplier TEXT,
  receipt_image_url TEXT,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_transactions (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  title TEXT NOT NULL,
  transaction_date TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'CASH',
  receipt_image_url TEXT,
  stock_movement_id INTEGER,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_ticket_id ON stock_movements(ticket_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_date ON finance_transactions(transaction_date);
`;

async function bootstrapDatabase(): Promise<void> {
  await runRawSql(DDL_SQL);

  // Auto-migrate new columns for existing production databases
  try {
    await runRawSql("ALTER TABLE posts ADD COLUMN IF NOT EXISTS gallery_images TEXT NOT NULL DEFAULT '[]';");
    await runRawSql("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS google_site_verification TEXT NOT NULL DEFAULT '';");
    await runRawSql("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS google_analytics_id TEXT NOT NULL DEFAULT '';");
    await runRawSql("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS google_maps_embed_url TEXT NOT NULL DEFAULT '';");
    await runRawSql("ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'ADMIN';");
    await runRawSql("ALTER TABLE repair_tickets ADD COLUMN IF NOT EXISTS items_json TEXT NOT NULL DEFAULT '[]';");
  } catch (migErr) {
    console.warn("[bootstrapDatabase migration notice]", migErr);
  }

  // Ensure default site_settings row id=1
  const settingsCount = await db.select({ value: count() }).from(siteSettings);
  if (Number(settingsCount[0]?.value ?? 0) === 0) {
    await db.insert(siteSettings).values({ id: 1 }).onConflictDoNothing();
  }

  // Chỉ khởi tạo tài khoản admin mặc định nếu chưa tồn tại
  const defaultEmail = (process.env.ADMIN_EMAIL || "manhquang89@gmail.com").trim().toLowerCase();
  const defaultPass = process.env.ADMIN_PASSWORD || "MQTech@2026";
  const existingAdmin = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, defaultEmail))
    .limit(1);

  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash(defaultPass, 10);
    await db
      .insert(adminUsers)
      .values({
        email: defaultEmail,
        passwordHash,
        name: "Quản trị MQTech BMT",
      })
      .onConflictDoNothing();
  } else if (process.env.RESET_ADMIN_PASSWORD === "true") {
    // Chỉ ghi đè mật khẩu khi quản trị viên cố ý bật biến khẩn cấp RESET_ADMIN_PASSWORD=true
    const passwordHash = await bcrypt.hash(defaultPass, 10);
    await db
      .update(adminUsers)
      .set({ passwordHash })
      .where(eq(adminUsers.email, defaultEmail));
  }
}

export async function ensureDbReady(): Promise<void> {
  if (!globalForBootstrap.__mqEnsurePromise) {
    globalForBootstrap.__mqEnsurePromise = bootstrapDatabase()
      .catch(async (err) => {
        const errMsg = String(err?.message || err);
        if (
          !process.env.DATABASE_URL?.trim() &&
          (errMsg.includes("Aborted") || errMsg.includes("unreachable"))
        ) {
          console.warn("[ensureDbReady] PGlite corrupted/unreachable, resetting storage...", errMsg);
          await resetCorruptedPglite();
          await bootstrapDatabase();
          return;
        }
        throw err;
      })
      .catch((err) => {
        globalForBootstrap.__mqEnsurePromise = undefined;
        throw err;
      });
  }
  return globalForBootstrap.__mqEnsurePromise;
}
