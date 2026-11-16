"use client";

import React, { useEffect, useRef } from "react";
import "@/lib/mqhwtest/styles/tokens.css";
import "@/lib/mqhwtest/styles/main.css";

export type MqHwTestModuleId =
  | "keyboard"
  | "display"
  | "speaker"
  | "microphone"
  | "camera"
  | "benchmark";

interface MqHwTestMountProps {
  moduleId: MqHwTestModuleId;
  className?: string;
}

export function MqHwTestMount({ moduleId, className = "" }: MqHwTestMountProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function loadAndMount() {
      if (!el) return;
      if (moduleId === "keyboard") {
        const { mountKeyboard } = await import("@/lib/mqhwtest/modules/keyboard/keyboard");
        if (!cancelled && el) cleanup = mountKeyboard(el);
      } else if (moduleId === "display") {
        const { mountDisplay } = await import("@/lib/mqhwtest/modules/display/display");
        if (!cancelled && el) cleanup = mountDisplay(el);
      } else if (moduleId === "speaker") {
        const { mountSpeaker } = await import("@/lib/mqhwtest/modules/speaker/speaker");
        if (!cancelled && el) cleanup = mountSpeaker(el);
      } else if (moduleId === "microphone") {
        const { mountMicrophone } = await import("@/lib/mqhwtest/modules/microphone/microphone");
        if (!cancelled && el) cleanup = mountMicrophone(el);
      } else if (moduleId === "camera") {
        const { mountCamera } = await import("@/lib/mqhwtest/modules/camera/camera");
        if (!cancelled && el) cleanup = mountCamera(el);
      } else if (moduleId === "benchmark") {
        const { mountBench } = await import("@/lib/mqhwtest/modules/bench/bench");
        if (!cancelled && el) cleanup = mountBench(el);
      }
    }

    void loadAndMount();

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
      if (el) el.innerHTML = "";
    };
  }, [moduleId]);

  return <div ref={containerRef} className={`mqhwtest-root w-full ${className}`.trim()} />;
}
