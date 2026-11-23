"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function MotionReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [animateReady, setAnimateReady] = useState(false);
  const [revealed, setRevealed] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    // Already in initial viewport: keep visible immediately without flash
    if (rect.top < window.innerHeight * 0.95) {
      return;
    }

    setRevealed(false);
    setAnimateReady(true);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -48px 0px", threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={
        animateReady && delay > 0
          ? { transitionDelay: `${Math.round(delay * 1000)}ms` }
          : undefined
      }
      className={cn(
        animateReady &&
          "transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        animateReady && !revealed
          ? "opacity-0 translate-y-3"
          : "opacity-100 translate-y-0",
        className
      )}
    >
      {children}
    </div>
  );
}
