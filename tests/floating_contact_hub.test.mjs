import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Floating Contact Hub & Facebook Messenger Integration", () => {
  const hubFilePath = path.resolve("src/components/layout/FloatingContactHub.tsx");
  const layoutFilePath = path.resolve("src/app/layout.tsx");
  const footerFilePath = path.resolve("src/components/layout/Footer.tsx");
  const homePagePath = path.resolve("src/app/page.tsx");

  test("should have FloatingContactHub component created with valid Messenger, Zalo, and Hotline targets", () => {
    assert.ok(fs.existsSync(hubFilePath), "FloatingContactHub.tsx must exist");
    const content = fs.readFileSync(hubFilePath, "utf8");

    // Check direct Messenger link with verified Fanpage username
    assert.ok(
      content.includes("https://m.me/suamaytinhbmt"),
      "Must contain direct Messenger link: https://m.me/suamaytinhbmt"
    );

    // Check Zalo link
    assert.ok(
      content.includes("https://zalo.me/0987482573"),
      "Must contain direct Zalo link: https://zalo.me/0987482573"
    );

    // Check Hotline phone
    assert.ok(
      content.includes("tel:0987482573"),
      "Must contain tel:0987482573"
    );
    assert.ok(
      content.includes("0987 482 573"),
      "Must display formatted hotline: 0987 482 573"
    );

    // Check security attributes for external links
    assert.ok(
      content.includes('target="_blank"'),
      "External links must have target=_blank"
    );
    assert.ok(
      content.includes('rel="noopener noreferrer"'),
      "External links must have rel=noopener noreferrer"
    );

    // Check accessibility ARIA attributes
    assert.ok(
      content.includes('aria-expanded='),
      "Must include aria-expanded attribute"
    );
    assert.ok(
      content.includes('aria-haspopup="true"'),
      "Must include aria-haspopup attribute"
    );
  });

  test("should mount FloatingContactHub inside RootLayout for site-wide presence", () => {
    assert.ok(fs.existsSync(layoutFilePath), "RootLayout must exist");
    const layoutContent = fs.readFileSync(layoutFilePath, "utf8");

    assert.ok(
      layoutContent.includes("FloatingContactHub"),
      "RootLayout must import and render FloatingContactHub"
    );
    assert.ok(
      layoutContent.includes("<FloatingContactHub />"),
      "RootLayout must include <FloatingContactHub /> component"
    );
  });

  test("should include verified Facebook Fanpage link in Footer", () => {
    assert.ok(fs.existsSync(footerFilePath), "Footer must exist");
    const footerContent = fs.readFileSync(footerFilePath, "utf8");

    assert.ok(
      footerContent.includes("https://www.facebook.com/suamaytinhbmt/"),
      "Footer must link to https://www.facebook.com/suamaytinhbmt/"
    );
  });

  test("should declare Facebook Fanpage in Schema.org sameAs for LocalBusiness Entity SEO", () => {
    assert.ok(fs.existsSync(homePagePath), "HomePage must exist");
    const homeContent = fs.readFileSync(homePagePath, "utf8");

    assert.ok(
      homeContent.includes("https://www.facebook.com/suamaytinhbmt/"),
      "HomePage Schema.org must declare Facebook Fanpage in sameAs array"
    );
    assert.ok(
      homeContent.includes("sameAs"),
      "HomePage Schema.org must contain sameAs property"
    );
  });
});
