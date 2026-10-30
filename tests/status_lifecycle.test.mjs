import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  isValidStatusTransition,
  VALID_STATUS_TRANSITIONS,
  REQUEST_STATUS_META,
} from "../src/lib/constants/status-lifecycle.ts";

describe("Service Request Status Lifecycle Transitions", () => {
  test("should allow valid forward transitions from AWAITING_CONFIRMATION", () => {
    assert.strictEqual(
      isValidStatusTransition("AWAITING_CONFIRMATION", "CONFIRMED"),
      true
    );
    assert.strictEqual(
      isValidStatusTransition("AWAITING_CONFIRMATION", "CANCELLED"),
      true
    );
  });

  test("should forbid illegal jumps from AWAITING_CONFIRMATION", () => {
    assert.strictEqual(
      isValidStatusTransition("AWAITING_CONFIRMATION", "COMPLETED"),
      false,
      "Cannot jump directly from unconfirmed to completed"
    );
    assert.strictEqual(
      isValidStatusTransition("AWAITING_CONFIRMATION", "IN_PROGRESS"),
      false,
      "Cannot start repair without confirming request first"
    );
  });

  test("should allow valid transitions from CONFIRMED", () => {
    assert.strictEqual(isValidStatusTransition("CONFIRMED", "IN_PROGRESS"), true);
    assert.strictEqual(isValidStatusTransition("CONFIRMED", "CANCELLED"), true);
    assert.strictEqual(isValidStatusTransition("CONFIRMED", "COMPLETED"), false);
  });

  test("should allow valid transitions from IN_PROGRESS", () => {
    assert.strictEqual(
      isValidStatusTransition("IN_PROGRESS", "WAITING_FOR_APPROVAL"),
      true
    );
    assert.strictEqual(isValidStatusTransition("IN_PROGRESS", "COMPLETED"), true);
    assert.strictEqual(isValidStatusTransition("IN_PROGRESS", "CANCELLED"), true);
  });

  test("should allow valid transitions from WAITING_FOR_APPROVAL", () => {
    assert.strictEqual(
      isValidStatusTransition("WAITING_FOR_APPROVAL", "IN_PROGRESS"),
      true
    );
    assert.strictEqual(
      isValidStatusTransition("WAITING_FOR_APPROVAL", "CANCELLED"),
      true
    );
    assert.strictEqual(
      isValidStatusTransition("WAITING_FOR_APPROVAL", "COMPLETED"),
      false
    );
  });

  test("should treat COMPLETED and CANCELLED as terminal states", () => {
    assert.strictEqual(VALID_STATUS_TRANSITIONS.COMPLETED.length, 0);
    assert.strictEqual(VALID_STATUS_TRANSITIONS.CANCELLED.length, 0);

    assert.strictEqual(isValidStatusTransition("COMPLETED", "IN_PROGRESS"), false);
    assert.strictEqual(isValidStatusTransition("CANCELLED", "CONFIRMED"), false);
  });

  test("should reject transitions to the same status", () => {
    assert.strictEqual(isValidStatusTransition("CONFIRMED", "CONFIRMED"), false);
    assert.strictEqual(isValidStatusTransition("IN_PROGRESS", "IN_PROGRESS"), false);
  });

  test("should define metadata for all valid statuses", () => {
    const statuses = [
      "AWAITING_CONFIRMATION",
      "CONFIRMED",
      "IN_PROGRESS",
      "WAITING_FOR_APPROVAL",
      "COMPLETED",
      "CANCELLED",
    ];

    for (const status of statuses) {
      assert.ok(REQUEST_STATUS_META[status]);
      assert.ok(REQUEST_STATUS_META[status].label);
      assert.ok(REQUEST_STATUS_META[status].badgeClass);
    }
  });
});
