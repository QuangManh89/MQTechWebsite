import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import { getSiteSettings } from "@/lib/site-data";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563EB",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    settings.siteUrl ||
    "https://suamaytinhbmt.id.vn"
  ).replace(/\/$/, "");

  return {
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: "./",
    },
    title: {
      default:
        "MQTech - Computer Service | Sửa Máy Tính Tại Nhà BMT (Tân Lập, Tân An)",
      template: "%s | MQTech - Computer Service BMT",
    },
    description:
      "Dịch vụ sửa máy tính tại nhà BMT, cài Win 10/11, sửa Laptop, MacBook, vệ sinh tra keo và nâng cấp SSD/RAM. Có mặt siêu tốc 15 - 20 phút tại P. Tân Lập, P. Tân An & trung tâm TP. Buôn Ma Thuột.",
    keywords: [
      "sửa máy tính tại nhà BMT",
      "sửa máy tính phường Tân Lập",
      "sửa máy tính phường Tân An",
      "cài win tại nhà Buôn Ma Thuột",
      "sửa laptop Buôn Ma Thuột",
      "sửa macbook Đắk Lắk",
      "vệ sinh laptop BMT",
      "MQTech Computer Service",
    ],
    verification: settings.googleSiteVerification
      ? { google: settings.googleSiteVerification }
      : undefined,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: baseUrl,
      siteName: settings.brandName,
      title:
        "MQTech - Computer Service | Sửa Máy Tính Tại Nhà BMT (Tân Lập, Tân An)",
      description:
        "Có mặt siêu tốc 15 - 20 phút tại P. Tân Lập, P. Tân An và trung tâm TP. Buôn Ma Thuột. Kiểm tra miễn phí, báo giá trước khi sửa, bảo hành điện tử minh bạch.",
      images: [{ url: "/brand/og-banner.png", width: 1200, height: 630 }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const ga4Id = settings.googleAnalyticsId?.trim();

  return (
    <html lang="vi">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Manrope:wght@500;600;700;800&display=swap"
        />
        <link
          rel="preconnect"
          href="https://images.unsplash.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="font-body bg-surface text-ink antialiased">
        {ga4Id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`}
              strategy="afterInteractive"
            />
            <Script id="mqtech-ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(ga4Id)});`}
            </Script>
          </>
        )}
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
