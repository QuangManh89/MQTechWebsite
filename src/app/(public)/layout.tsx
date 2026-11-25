import { getSiteSettings } from "@/lib/site-data";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingQuickContact } from "@/components/layout/FloatingQuickContact";
import { ConversionTracker } from "@/components/analytics/ConversionTracker";

export const revalidate = 300;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col bg-surface-page text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-ink-inverse focus:shadow-lg"
      >
        Bỏ qua điều hướng đến nội dung chính
      </a>
      <Navbar
        brandName={settings.brandName}
        subTagline={settings.subTagline}
        hotline={settings.hotline}
        hotlineRaw={settings.hotlineRaw}
      />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer settings={settings} />
      <FloatingQuickContact
        hotline={settings.hotline}
        hotlineRaw={settings.hotlineRaw}
        zaloUrl={settings.zaloUrl}
        messengerUrl={settings.messengerUrl}
      />
      <ConversionTracker />
    </div>
  );
}
