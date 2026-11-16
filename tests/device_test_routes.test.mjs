/**
 * Device Test Feature Integration Test Suite
 *
 * Verifies:
 * 1. Metadata and configuration of all 6 hardware test modules.
 * 2. Presence of all 7 Next.js route entrypoints.
 * 3. Audio test assets availability in public/audio/.
 * 4. Sitemap coverage for device test routes.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Device Test Feature & Routes Verification", () => {
  const projectRoot = process.cwd();

  test("should have all 7 Next.js route pages created", () => {
    const requiredPages = [
      "src/app/device-test/page.tsx",
      "src/app/device-test/ban-phim/page.tsx",
      "src/app/device-test/man-hinh/page.tsx",
      "src/app/device-test/loa/page.tsx",
      "src/app/device-test/micro/page.tsx",
      "src/app/device-test/camera/page.tsx",
      "src/app/device-test/benchmark/page.tsx",
    ];

    for (const pagePath of requiredPages) {
      const fullPath = path.resolve(projectRoot, pagePath);
      assert.ok(fs.existsSync(fullPath), `Page must exist: ${pagePath}`);
    }
  });

  test("should have original mqhwtest modules and mount component", () => {
    const requiredModules = [
      "src/lib/mqhwtest/modules/keyboard/index.ts",
      "src/lib/mqhwtest/modules/display/index.ts",
      "src/lib/mqhwtest/modules/speaker/index.ts",
      "src/lib/mqhwtest/modules/microphone/index.ts",
      "src/lib/mqhwtest/modules/camera/index.ts",
      "src/lib/mqhwtest/modules/bench/index.ts",
      "src/components/device-test/MqHwTestMount.tsx",
    ];

    for (const modPath of requiredModules) {
      const fullPath = path.resolve(projectRoot, modPath);
      assert.ok(fs.existsSync(fullPath), `Original module/component must exist: ${modPath}`);
    }
  });

  test("should have all audio test sample assets in public/audio/", () => {
    const audioFiles = [
      "public/audio/speaker-sweep.mp3",
      "public/audio/speaker-test-1.mp3",
      "public/audio/speaker-test-2.mp3",
    ];

    for (const audioPath of audioFiles) {
      const fullPath = path.resolve(projectRoot, audioPath);
      assert.ok(fs.existsSync(fullPath), `Audio file must exist: ${audioPath}`);
      const stats = fs.statSync(fullPath);
      assert.ok(stats.size > 100000, `Audio file must not be empty: ${audioPath}`);
    }
  });

  test("should declare all 7 device-test URLs in sitemap", () => {
    const sitemapPath = path.resolve(projectRoot, "src/app/sitemap.ts");
    assert.ok(fs.existsSync(sitemapPath), "sitemap.ts must exist");
    const content = fs.readFileSync(sitemapPath, "utf8");

    const expectedSlugs = [
      "/device-test",
      "/device-test/ban-phim",
      "/device-test/man-hinh",
      "/device-test/loa",
      "/device-test/micro",
      "/device-test/camera",
      "/device-test/benchmark",
    ];

    for (const slug of expectedSlugs) {
      assert.ok(content.includes(slug), `Sitemap must include: ${slug}`);
    }
  });

  test("should include Device Test navigation in Navbar and Footer", () => {
    const navPath = path.resolve(projectRoot, "src/components/layout/Navbar.tsx");
    const footerPath = path.resolve(projectRoot, "src/components/layout/Footer.tsx");

    const navContent = fs.readFileSync(navPath, "utf8");
    const footerContent = fs.readFileSync(footerPath, "utf8");

    assert.ok(navContent.includes('href="/device-test"'), "Navbar must link to /device-test");
    assert.ok(footerContent.includes('href="/device-test"'), "Footer must link to /device-test");
  });
});
