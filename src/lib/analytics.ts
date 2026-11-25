export type GtagEventParams = Record<string, string | number | boolean>;

type GtagFunction = (...args: unknown[]) => void;

type WindowWithGtag = Window & {
  gtag?: GtagFunction;
};

export function trackEvent(
  eventName: string,
  params?: GtagEventParams
): void {
  if (typeof window === "undefined") return;
  const gtag = (window as WindowWithGtag).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", eventName, params || {});
  } catch {
    // Silent fail if GA4 / adblocker interferes
  }
}
