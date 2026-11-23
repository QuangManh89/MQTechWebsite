import Link from "next/link";

interface BrandLogoProps {
  brandName: string;
  subTagline: string;
  variant?: "light" | "dark";
}

function splitBrandParts(brandName: string): {
  prefix: string;
  accent: string;
  suffix: string;
} {
  const trimmed = brandName.trim();
  // Highlight "MQ" + "Tech" + optional suffix (e.g. " - Computer Service")
  const match = trimmed.match(/^(MQ)(Tech)(.*)$/i);
  if (match) {
    return {
      prefix: match[1],
      accent: match[2],
      suffix: match[3].replace(/^\s*[-–—·]\s*/, "").trim(),
    };
  }
  const dashIdx = trimmed.indexOf("-");
  if (dashIdx > 0) {
    return {
      prefix: trimmed.slice(0, dashIdx).trim(),
      accent: "",
      suffix: trimmed.slice(dashIdx + 1).trim(),
    };
  }
  return { prefix: trimmed, accent: "", suffix: "" };
}

export function BrandLogo({
  brandName,
  subTagline,
  variant = "light",
}: BrandLogoProps) {
  const isDark = variant === "dark";
  const { prefix, accent, suffix } = splitBrandParts(brandName);

  return (
    <Link
      href="/"
      className="group inline-flex min-h-11 min-w-0 items-center gap-2.5 sm:gap-3 shrink-0"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105 ${
          isDark
            ? "bg-navy-surface ring-1 ring-brand-glow/35"
            : "bg-navy ring-1 ring-navy/20 shadow-card"
        }`}
      >
        <img
          src="/brand/logo-dark.svg"
          alt=""
          width={36}
          height={36}
          decoding="async"
          aria-hidden="true"
          className="h-9 w-9"
        />
      </div>

      <div className="flex min-w-0 flex-col">
        <span className="font-heading flex items-baseline gap-1.5 leading-tight truncate max-w-[200px] sm:max-w-none">
          <span className="text-lg font-extrabold tracking-tight">
            <span className={isDark ? "text-ink-inverse" : "text-navy"}>
              {prefix}
            </span>
            {accent && (
              <span className={isDark ? "text-brand-glow" : "text-brand"}>
                {accent}
              </span>
            )}
          </span>
          {suffix && (
            <span
              className={`hidden sm:inline text-xs font-semibold tracking-tight ${
                isDark ? "text-ink-inverse-muted" : "text-ink-muted"
              }`}
            >
              {suffix}
            </span>
          )}
        </span>
        <span
          className={`text-xs font-bold uppercase tracking-wider truncate max-w-[200px] sm:max-w-none ${
            isDark ? "text-brand-glow" : "text-brand"
          }`}
        >
          {subTagline}
        </span>
      </div>
    </Link>
  );
}
