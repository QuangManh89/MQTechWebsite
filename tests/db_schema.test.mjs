import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("PostgreSQL Relational Schema Boundary Verification", () => {
  const schemaPath = path.resolve(process.cwd(), "src/lib/db/schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  test("should declare service_requests table with unpredictable reference_code", () => {
    assert.ok(
      schemaSql.includes("CREATE TABLE IF NOT EXISTS service_requests"),
      "service_requests table must be declared"
    );
    assert.ok(
      schemaSql.includes("reference_code VARCHAR(16) UNIQUE NOT NULL"),
      "reference_code column must be unique and not null"
    );
  });

  test("should enforce AWAITING_CONFIRMATION as default request status and include all valid statuses", () => {
    assert.ok(
      schemaSql.includes("status VARCHAR(32) DEFAULT 'AWAITING_CONFIRMATION' NOT NULL"),
      "Default status must be AWAITING_CONFIRMATION"
    );
    assert.ok(
      schemaSql.includes("WAITING_FOR_APPROVAL"),
      "WAITING_FOR_APPROVAL status must be included in CHECK constraint"
    );
  });

  test("should declare device_category and service_address columns", () => {
    assert.ok(
      schemaSql.includes("device_category VARCHAR(32) DEFAULT 'LAPTOP' NOT NULL"),
      "device_category column must be declared"
    );
    assert.ok(
      schemaSql.includes("service_address TEXT"),
      "service_address column must be declared"
    );
  });

  test("should not include password fields in service_requests", () => {
    assert.ok(
      !schemaSql.includes("windows_password"),
      "Never store windows_password in service_requests table"
    );
    assert.ok(
      !schemaSql.includes("device_password"),
      "Never store device_password in service_requests table"
    );
  });

  test("should declare request_status_history table with cascade deletion", () => {
    assert.ok(
      schemaSql.includes("CREATE TABLE IF NOT EXISTS request_status_history"),
      "request_status_history table must be declared"
    );
    assert.ok(
      schemaSql.includes("ON DELETE CASCADE"),
      "Status history must link cleanly to requests"
    );
  });
});
