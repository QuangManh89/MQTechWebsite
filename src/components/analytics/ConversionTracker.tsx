"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function ConversionTracker() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href") || "";
      if (!href) return;

      const pagePath = window.location.pathname;

      if (href.startsWith("tel:")) {
        trackEvent("click_hotline", {
          link_url: href,
          page_path: pagePath,
        });
      } else if (/(?:^|\/\/)(?:www\.)?zalo\.me(?:\/|\?|$)/i.test(href)) {
        trackEvent("click_zalo", {
          link_url: href,
          page_path: pagePath,
        });
      } else if (/(?:^|\/\/)(?:www\.)?(?:m\.me|messenger\.com)(?:\/|\?|$)/i.test(href)) {
        trackEvent("click_messenger", {
          link_url: href,
          page_path: pagePath,
        });
      }
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
