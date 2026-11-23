import React from "react";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
  className?: string;
  draggable?: boolean;
}

const NEXT_IMAGE_WIDTHS = [384, 640, 828, 1080, 1200, 1920] as const;

function buildUnsplashVariant(rawUrl: string, targetWidth: number): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.searchParams.set("auto", "format");
    parsed.searchParams.set("fit", "crop");
    parsed.searchParams.set("q", "80");
    parsed.searchParams.set("w", String(targetWidth));
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

function buildCloudflareCgiVariant(rawUrl: string, targetWidth: number): string {
  try {
    const parsed = new URL(rawUrl);
    const cleanPath = parsed.pathname.replace(/^\/+/, "");
    return `${parsed.origin}/cdn-cgi/image/width=${targetWidth},quality=80,format=auto/${cleanPath}`;
  } catch {
    return rawUrl;
  }
}

function isNextOptimizableAsset(rawUrl: string): boolean {
  if (/\.svg(\?|$)/i.test(rawUrl)) return false;
  if (
    rawUrl.startsWith("/uploads/") ||
    rawUrl.startsWith("/brand/") ||
    rawUrl.startsWith("/banners/")
  ) {
    return true;
  }
  try {
    const parsed = new URL(rawUrl);
    return (
      parsed.hostname.endsWith(".r2.dev") ||
      parsed.hostname.endsWith(".r2.cloudflarestorage.com") ||
      parsed.hostname === "images.pexels.com"
    );
  } catch {
    return false;
  }
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  className,
  draggable,
}: ResponsiveImageProps) {
  let srcSet: string | undefined;
  let resolvedSrc = src;
  const fallbackW = width >= 1600 ? 1920 : 1080;

  if (src.includes("images.unsplash.com")) {
    srcSet = [480, 768, 1080, 1440]
      .map((w) => `${buildUnsplashVariant(src, w)} ${w}w`)
      .join(", ");
    resolvedSrc = buildUnsplashVariant(src, 1080);
  } else if (
    process.env.NEXT_PUBLIC_CF_IMAGE_RESIZING === "true" &&
    /^https?:\/\//i.test(src) &&
    !/\.svg(\?|$)/i.test(src)
  ) {
    srcSet = [640, 1080, 1440, 1920]
      .map((w) => `${buildCloudflareCgiVariant(src, w)} ${w}w`)
      .join(", ");
    resolvedSrc = buildCloudflareCgiVariant(src, fallbackW);
  } else if (isNextOptimizableAsset(src)) {
    const q = width >= 1600 ? 85 : 80;
    srcSet = NEXT_IMAGE_WIDTHS.map(
      (w) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${q} ${w}w`
    ).join(", ");
    resolvedSrc = `/_next/image?url=${encodeURIComponent(src)}&w=${fallbackW}&q=${q}`;
  }

  return (
    <img
      src={resolvedSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      draggable={draggable}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding={priority ? "sync" : "async"}
      className={className}
    />
  );
}
