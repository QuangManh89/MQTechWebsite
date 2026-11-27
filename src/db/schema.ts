import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  brandName: text("brand_name").notNull().default("MQTech - Sửa Máy Tính Tại Nhà BMT"),
  subTagline: text("sub_tagline").notNull().default("DỊCH VỤ SỬA MÁY TÍNH TẠI NHÀ BMT"),
  slogan: text("slogan").notNull().default("Sự Hài Lòng Của Khách Hàng Là Động Lực Của Chúng Tôi."),
  ticketPrefix: text("ticket_prefix").notNull().default("MQ"),
  hotline: text("hotline").notNull().default("0987 482 573"),
  hotlineRaw: text("hotline_raw").notNull().default("0987482573"),
  zaloUrl: text("zalo_url").notNull().default("https://zalo.me/0987482573"),
  facebookUrl: text("facebook_url").notNull().default("https://www.facebook.com/suamaytinhbmt"),
  messengerUrl: text("messenger_url").notNull().default("https://m.me/suamaytinhbmt"),
  email: text("email").notNull().default("manhquang89@gmail.com"),
  address: text("address").notNull().default("Đường Võ Thị Sáu, P. Tân Lập, TP. Buôn Ma Thuột, Đắk Lắk"),
  workingHours: text("working_hours").notNull().default("07:30 - 20:00 (Thứ 2 - Chủ Nhật)"),
  siteUrl: text("site_url").notNull().default(""),
  isOpen: boolean("is_open").notNull().default(true),
  todayReceivedCount: integer("today_received_count").notNull().default(18),
  todaySlotsLeft: integer("today_slots_left").notNull().default(6),
  bookingDiscount: text("booking_discount").notNull().default("50.000đ"),
  showExactPrices: boolean("show_exact_prices").notNull().default(true),
  telegramBotToken: text("telegram_bot_token").notNull().default(""),
  telegramChatId: text("telegram_chat_id").notNull().default(""),
  enableTelegram: boolean("enable_telegram").notNull().default(false),
  smtpHost: text("smtp_host").notNull().default(""),
  smtpPort: integer("smtp_port").notNull().default(587),
  smtpUser: text("smtp_user").notNull().default(""),
  smtpPass: text("smtp_pass").notNull().default(""),
  notifyEmailTo: text("notify_email_to").notNull().default("manhquang89@gmail.com"),
  enableEmail: boolean("enable_email").notNull().default(false),
  googleSiteVerification: text("google_site_verification").notNull().default(""),
  googleAnalyticsId: text("google_analytics_id").notNull().default(""),
  googleMapsEmbedUrl: text("google_maps_embed_url").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(), // laptop-macbook | pc-build | clean-upgrade | onsite-it
  shortDesc: text("short_desc").notNull(),
  description: text("description").notNull(),
  priceFrom: text("price_from").notNull(),
  warranty: text("warranty").notNull(),
  duration: text("duration").notNull(),
  imageUrl: text("image_url").notNull(),
  symptomsJson: text("symptoms_json").notNull().default("[]"),
  servicePricesJson: text("service_prices_json").notNull().default("[]"),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pricingItems = pgTable("pricing_items", {
  id: serial("id").primaryKey(),
  tabCategory: text("tab_category").notNull(), // laptop-macbook | pc-build | clean-upgrade | onsite-it
  serviceName: text("service_name").notNull(),
  priceText: text("price_text").notNull(),
  duration: text("duration").notNull(),
  warranty: text("warranty").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  coverImage: text("cover_image").notNull(),
  authorName: text("author_name").notNull().default("Kỹ thuật MQTech"),
  readTimeMinutes: integer("read_time_minutes").notNull().default(5),
  featured: boolean("featured").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  galleryImages: text("gallery_images").notNull().default("[]"),
  focusKeyword: text("focus_keyword").notNull().default(""),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const repairTickets = pgTable("repair_tickets", {
  id: serial("id").primaryKey(),
  ticketCode: text("ticket_code").notNull().unique(), // MQ-2026-XXXX
  source: text("source").notNull().default("ONLINE"), // ONLINE | COUNTER
  serviceMode: text("service_mode").notNull().default("ONSITE"), // ONSITE | STORE
  onsiteAddress: text("onsite_address"),
  deviceType: text("device_type").notNull(),
  serviceCategory: text("service_category").notNull(),
  deviceModel: text("device_model"),
  serialNumber: text("serial_number"),
  issueDescription: text("issue_description").notNull(),
  appointmentDate: text("appointment_date").notNull(),
  appointmentSlot: text("appointment_slot").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  status: text("status").notNull().default("PENDING"), // PENDING | CONFIRMED | DIAGNOSING | REPAIRING | COMPLETED | CANCELLED
  technicianNote: text("technician_note"),
  estimatedCost: text("estimated_cost"),
  itemsJson: text("items_json").notNull().default("[]"),
  warrantyText: text("warranty_text"),
  warrantyUntil: text("warranty_until"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contactInquiries = pgTable("contact_inquiries", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  topic: text("topic").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("NEW"), // NEW | REPLIED | ARCHIVED
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("ADMIN"), // ADMIN | EDITOR
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull().default("Linh kiện khác"),
  unit: text("unit").notNull().default("Cái"),
  quantity: integer("quantity").notNull().default(0),
  avgCost: integer("avg_cost").notNull().default(0),
  sellPrice: integer("sell_price").notNull().default(0),
  minStock: integer("min_stock").notNull().default(2),
  supplier: text("supplier"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const stockMovements = pgTable("stock_movements", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id")
    .notNull()
    .references(() => inventoryItems.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // IN | OUT_TICKET | OUT_RETAIL | RETURN_TICKET | ADJUST
  quantityChange: integer("quantity_change").notNull(),
  unitCost: integer("unit_cost").notNull().default(0),
  totalCost: integer("total_cost").notNull().default(0),
  ticketId: integer("ticket_id"),
  ticketCode: text("ticket_code"),
  supplier: text("supplier"),
  receiptImageUrl: text("receipt_image_url"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const financeTransactions = pgTable("finance_transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // INCOME | EXPENSE
  category: text("category").notNull(), // NHAP_HANG | MAT_BANG | DIEN_NUOC | SHIP_DI_LAI | QUANG_CAO | DUNG_CU | LUONG_THUONG | BAN_LE | THU_KHAC | KHAC
  amount: integer("amount").notNull(),
  title: text("title").notNull(),
  transactionDate: text("transaction_date").notNull(), // YYYY-MM-DD
  paymentMethod: text("payment_method").notNull().default("CASH"), // CASH | BANK
  receiptImageUrl: text("receipt_image_url"),
  stockMovementId: integer("stock_movement_id"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type Service = typeof services.$inferSelect;
export type PricingItem = typeof pricingItems.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type RepairTicket = typeof repairTickets.$inferSelect;
export type ContactInquiry = typeof contactInquiries.$inferSelect;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type StockMovement = typeof stockMovements.$inferSelect;
export type FinanceTransaction = typeof financeTransactions.$inferSelect;
