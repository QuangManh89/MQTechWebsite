import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { MQTECH_SERVICES } from "../src/lib/constants/services.ts";

/**
 * CANONICAL MQTECH BUSINESS SERVICES SPECIFICATION:
 * As approved in docs/BUSINESS_REQUIREMENTS.md:
 * 1. Desktop & Laptop Repair (Sửa chữa Máy tính bàn & Laptop)
 * 2. Windows & Software Support (Cài đặt & Xử lý sự cố phần mềm)
 * 3. Hardware Diagnostics & Replacement (Chẩn đoán & Thay thế phần cứng)
 * 4. Printer Services (Sửa chữa & Cài đặt máy in)
 * 5. LAN & Wi-Fi Networking (Thi công & Xử lý mạng LAN / Wi-Fi)
 * 6. Business IT Support (Dịch vụ IT Doanh nghiệp & Văn phòng)
 */
export const CANONICAL_SERVICES = [
  {
    id: "svc_desktop_laptop",
    slug: "sua-chua-laptop-pc",
    title: "Sửa Chữa Laptop & PC",
    deliveryModes: ["IN_STORE", "ON_SITE"],
  },
  {
    id: "svc_windows_software",
    slug: "cai-dat-windows-phan-mem",
    title: "Cài Đặt Windows & Phần Mềm",
    deliveryModes: ["IN_STORE", "ON_SITE"],
  },
  {
    id: "svc_hardware_upgrade",
    slug: "chan-doan-nang-cap-phan-cung",
    title: "Chẩn Đoán & Nâng Cấp Phần Cứng",
    deliveryModes: ["IN_STORE", "ON_SITE"],
  },
  {
    id: "svc_printer_service",
    slug: "dich-vu-may-in",
    title: "Dịch Vụ Máy In Văn Phòng",
    deliveryModes: ["IN_STORE", "ON_SITE"],
  },
  {
    id: "svc_network_wifi",
    slug: "thi-cong-xu-ly-mang-lan-wifi",
    title: "Mạng LAN & Wi-Fi Nội Bộ",
    deliveryModes: ["ON_SITE"],
  },
  {
    id: "svc_business_it",
    slug: "ho-tro-it-doanh-nghiep",
    title: "Hỗ Trợ IT Doanh Nghiệp",
    deliveryModes: ["ON_SITE"],
  },
];

describe("MQTech Canonical Services Specification Verification", () => {
  test("should have exactly 6 confirmed service categories", () => {
    assert.strictEqual(
      MQTECH_SERVICES.length,
      6,
      "MQTech must have exactly 6 confirmed services"
    );
  });

  test("should match the approved canonical 6 service IDs, slugs, and display titles exactly", () => {
    for (let i = 0; i < CANONICAL_SERVICES.length; i++) {
      const canonical = CANONICAL_SERVICES[i];
      const actual = MQTECH_SERVICES[i];

      assert.strictEqual(
        actual.id,
        canonical.id,
        `Service #${i + 1} ID mismatch: expected ${canonical.id}, got ${actual.id}`
      );
      assert.strictEqual(
        actual.slug,
        canonical.slug,
        `Service #${i + 1} slug mismatch: expected ${canonical.slug}, got ${actual.slug}`
      );
      assert.strictEqual(
        actual.title,
        canonical.title,
        `Service #${i + 1} title mismatch: expected ${canonical.title}, got ${actual.title}`
      );
      assert.deepStrictEqual(
        actual.deliveryModes,
        canonical.deliveryModes,
        `Service #${i + 1} deliveryModes mismatch`
      );
    }
  });

  test("should ensure migrations/001_initial_schema.sql seeds match the canonical 6 services", () => {
    const migrationPath = path.resolve(process.cwd(), "migrations/001_initial_schema.sql");
    const migrationSql = fs.readFileSync(migrationPath, "utf8");

    for (const service of CANONICAL_SERVICES) {
      assert.ok(
        migrationSql.includes(`'${service.id}'`),
        `Migration 001 must seed canonical ID ${service.id}`
      );
      assert.ok(
        migrationSql.includes(`'${service.slug}'`),
        `Migration 001 must seed canonical slug ${service.slug}`
      );
      assert.ok(
        migrationSql.includes(`'${service.title}'`),
        `Migration 001 must seed canonical title ${service.title}`
      );
    }
  });

  test("should have unique IDs and slugs for all services", () => {
    const ids = new Set(MQTECH_SERVICES.map((s) => s.id));
    const slugs = new Set(MQTECH_SERVICES.map((s) => s.slug));

    assert.strictEqual(ids.size, 6, "All service IDs must be unique");
    assert.strictEqual(slugs.size, 6, "All service slugs must be unique");
  });

  test("should only include approved delivery modes", () => {
    const validModes = new Set(["IN_STORE", "ON_SITE"]);

    for (const service of MQTECH_SERVICES) {
      assert.ok(
        service.deliveryModes.length > 0,
        `Service ${service.id} must specify at least one delivery mode`
      );
      for (const mode of service.deliveryModes) {
        assert.ok(
          validModes.has(mode),
          `Delivery mode ${mode} in service ${service.id} is invalid`
        );
      }
    }
  });

  test("should not introduce any prohibited PC configurators or e-commerce categories", () => {
    const forbiddenKeywords = ["configurator", "build-pc-shop", "e-commerce", "linh-kien-gia-re", "cuu-du-lieu", "bao-tri-ve-sinh"];

    for (const service of MQTECH_SERVICES) {
      for (const keyword of forbiddenKeywords) {
        assert.ok(
          !service.slug.includes(keyword),
          `Prohibited keyword ${keyword} detected in service slug ${service.slug}`
        );
      }
    }
  });
});
