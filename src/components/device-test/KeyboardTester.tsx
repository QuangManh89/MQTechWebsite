"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Delete,
  RotateCcw,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface KeyDef {
  code: string;
  label: string;
  sub?: string; // Top-left shifted legend
  macLabel?: string;
  span?: number; // Out of 60 units for main block (1u = 4)
  icon?: "backspace";
}

interface SpacerDef {
  spacer: true;
  id: string;
  span: number;
}

type MainRowItem = KeyDef | SpacerDef;

function isSpacer(item: MainRowItem): item is SpacerDef {
  return "spacer" in item;
}

// Main 15u block (60 columns: 1u = 4 cols)
const MAIN_ROWS: MainRowItem[][] = [
  // Row 0: Function row (4 + 4 + 16 + 2 + 16 + 2 + 16 = 60)
  [
    { code: "Escape", label: "esc", span: 4 },
    { spacer: true, id: "gap-esc", span: 4 },
    { code: "F1", label: "F1", span: 4 },
    { code: "F2", label: "F2", span: 4 },
    { code: "F3", label: "F3", span: 4 },
    { code: "F4", label: "F4", span: 4 },
    { spacer: true, id: "gap-f4", span: 2 },
    { code: "F5", label: "F5", span: 4 },
    { code: "F6", label: "F6", span: 4 },
    { code: "F7", label: "F7", span: 4 },
    { code: "F8", label: "F8", span: 4 },
    { spacer: true, id: "gap-f8", span: 2 },
    { code: "F9", label: "F9", span: 4 },
    { code: "F10", label: "F10", span: 4 },
    { code: "F11", label: "F11", span: 4 },
    { code: "F12", label: "F12", span: 4 },
  ],
  // Row 1: Number row (13 * 4 + 8 = 60)
  [
    { code: "Backquote", label: "`", sub: "~", span: 4 },
    { code: "Digit1", label: "1", sub: "!", span: 4 },
    { code: "Digit2", label: "2", sub: "@", span: 4 },
    { code: "Digit3", label: "3", sub: "#", span: 4 },
    { code: "Digit4", label: "4", sub: "$", span: 4 },
    { code: "Digit5", label: "5", sub: "%", span: 4 },
    { code: "Digit6", label: "6", sub: "^", span: 4 },
    { code: "Digit7", label: "7", sub: "&", span: 4 },
    { code: "Digit8", label: "8", sub: "*", span: 4 },
    { code: "Digit9", label: "9", sub: "(", span: 4 },
    { code: "Digit0", label: "0", sub: ")", span: 4 },
    { code: "Minus", label: "-", sub: "_", span: 4 },
    { code: "Equal", label: "=", sub: "+", span: 4 },
    { code: "Backspace", label: "⌫", icon: "backspace", span: 8 },
  ],
  // Row 2: QWERTY (6 + 12 * 4 + 6 = 60)
  [
    { code: "Tab", label: "tab", span: 6 },
    { code: "KeyQ", label: "Q", span: 4 },
    { code: "KeyW", label: "W", span: 4 },
    { code: "KeyE", label: "E", span: 4 },
    { code: "KeyR", label: "R", span: 4 },
    { code: "KeyT", label: "T", span: 4 },
    { code: "KeyY", label: "Y", span: 4 },
    { code: "KeyU", label: "U", span: 4 },
    { code: "KeyI", label: "I", span: 4 },
    { code: "KeyO", label: "O", span: 4 },
    { code: "KeyP", label: "P", span: 4 },
    { code: "BracketLeft", label: "[", sub: "{", span: 4 },
    { code: "BracketRight", label: "]", sub: "}", span: 4 },
    { code: "Backslash", label: "\\", sub: "|", span: 6 },
  ],
  // Row 3: Home row (7 + 11 * 4 + 9 = 60)
  [
    { code: "CapsLock", label: "caps", span: 7 },
    { code: "KeyA", label: "A", span: 4 },
    { code: "KeyS", label: "S", span: 4 },
    { code: "KeyD", label: "D", span: 4 },
    { code: "KeyF", label: "F", span: 4 },
    { code: "KeyG", label: "G", span: 4 },
    { code: "KeyH", label: "H", span: 4 },
    { code: "KeyJ", label: "J", span: 4 },
    { code: "KeyK", label: "K", span: 4 },
    { code: "KeyL", label: "L", span: 4 },
    { code: "Semicolon", label: ";", sub: ":", span: 4 },
    { code: "Quote", label: "'", sub: '"', span: 4 },
    { code: "Enter", label: "return", span: 9 },
  ],
  // Row 4: Shift row (9 + 10 * 4 + 11 = 60)
  [
    { code: "ShiftLeft", label: "shift", span: 9 },
    { code: "KeyZ", label: "Z", span: 4 },
    { code: "KeyX", label: "X", span: 4 },
    { code: "KeyC", label: "C", span: 4 },
    { code: "KeyV", label: "V", span: 4 },
    { code: "KeyB", label: "B", span: 4 },
    { code: "KeyN", label: "N", span: 4 },
    { code: "KeyM", label: "M", span: 4 },
    { code: "Comma", label: ",", sub: "<", span: 4 },
    { code: "Period", label: ".", sub: ">", span: 4 },
    { code: "Slash", label: "/", sub: "?", span: 4 },
    { code: "ShiftRight", label: "shift", span: 11 },
  ],
];

// Row 5: Bottom modifier row (sums to 60)
const BOTTOM_ROW_PC: KeyDef[] = [
  { code: "ControlLeft", label: "ctrl", span: 5 },
  { code: "MetaLeft", label: "win", span: 5 },
  { code: "AltLeft", label: "alt", span: 5 },
  { code: "Space", label: "", span: 25 },
  { code: "AltRight", label: "alt", span: 5 },
  { code: "MetaRight", label: "win", span: 5 },
  { code: "ContextMenu", label: "menu", span: 5 },
  { code: "ControlRight", label: "ctrl", span: 5 },
];

const BOTTOM_ROW_MAC: KeyDef[] = [
  { code: "ControlLeft", label: "ctrl", span: 5 },
  { code: "AltLeft", label: "opt", span: 5 },
  { code: "MetaLeft", label: "cmd", span: 6 },
  { code: "Space", label: "", span: 28 },
  { code: "MetaRight", label: "cmd", span: 6 },
  { code: "AltRight", label: "opt", span: 5 },
  { code: "ControlRight", label: "ctrl", span: 5 },
];

interface LogEntry {
  id: number;
  time: string;
  type: "DOWN" | "UP";
  key: string;
  code: string;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "TEXTAREA" || target.isContentEditable) return true;
  if (tag === "INPUT") {
    const inputType = (target as HTMLInputElement).type;
    // Allow text-like inputs if user ever focuses one, but NOT checkboxes/radios
    return !["checkbox", "radio", "button", "submit", "reset"].includes(
      inputType
    );
  }
  return false;
}

export function KeyboardTester({
  onStatusChange,
}: {
  onStatusChange?: (status: "good" | "issue" | "untested") => void;
}) {
  const [layout, setLayout] = useState<"PC" | "MAC">("PC");
  const [preventShortcuts, setPreventShortcuts] = useState(true);
  const [activeCodes, setActiveCodes] = useState<Set<string>>(new Set());
  const [testedCodes, setTestedCodes] = useState<Set<string>>(new Set());
  const [maxRollover, setMaxRollover] = useState(0);
  const [eventLogs, setEventLogs] = useState<LogEntry[]>([]);
  const [userFeedback, setUserFeedback] = useState<"good" | "issue" | null>(
    null
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeCodesRef = useRef<Set<string>>(new Set());
  const contextKeyDownRef = useRef(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      if (preventShortcuts) {
        // Intercept EVERY key in capture phase so F1-F12, Tab, Alt, Space,
        // Enter, Arrows, PgUp/PgDn, Home/End, Backspace, /, ', Ctrl+key, etc.
        // cannot scroll the page, click focused buttons, or trigger browser actions.
        e.preventDefault();
        e.stopPropagation();

        // Blur any focused button/checkbox so Space/Enter never re-triggers it
        if (
          document.activeElement instanceof HTMLElement &&
          document.activeElement !== document.body &&
          !isEditableTarget(document.activeElement)
        ) {
          document.activeElement.blur();
        }
      }

      const code = e.code;
      if (!code) return;

      if (code === "ContextMenu") {
        contextKeyDownRef.current = true;
      }

      activeCodesRef.current.add(code);
      const currentCount = activeCodesRef.current.size;

      setActiveCodes(new Set(activeCodesRef.current));
      setTestedCodes((prev) => {
        if (prev.has(code)) return prev;
        const next = new Set(prev);
        next.add(code);
        return next;
      });
      setMaxRollover((prev) => Math.max(prev, currentCount));

      // Avoid spamming event log on held key auto-repeat
      if (!e.repeat) {
        const now = new Date();
        const timeStr = `${String(now.getMinutes()).padStart(2, "0")}:${String(
          now.getSeconds()
        ).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;

        setEventLogs((prev) => [
          {
            id: Date.now() + Math.random(),
            time: timeStr,
            type: "DOWN",
            key: e.key,
            code,
          },
          ...prev.slice(0, 9),
        ]);
      }
    },
    [preventShortcuts]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      if (preventShortcuts) {
        // Critical on Windows Chrome/Edge: preventing default on keyup stops
        // Alt and F10 from focusing the browser menu bar on key release!
        e.preventDefault();
        e.stopPropagation();
      }

      const code = e.code;
      if (!code) return;

      if (code === "ContextMenu") {
        setTimeout(() => {
          contextKeyDownRef.current = false;
        }, 120);
      }

      activeCodesRef.current.delete(code);
      setActiveCodes(new Set(activeCodesRef.current));

      const now = new Date();
      const timeStr = `${String(now.getMinutes()).padStart(2, "0")}:${String(
        now.getSeconds()
      ).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;

      setEventLogs((prev) => [
        {
          id: Date.now() + Math.random(),
          time: timeStr,
          type: "UP",
          key: e.key,
          code,
        },
        ...prev.slice(0, 9),
      ]);
    },
    [preventShortcuts]
  );

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;
      if (preventShortcuts) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [preventShortcuts]
  );

  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      // Block context menu triggered by the physical Menu (ContextMenu) key
      if (
        preventShortcuts &&
        (contextKeyDownRef.current ||
          activeCodesRef.current.has("ContextMenu") ||
          e.button === -1)
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [preventShortcuts]
  );

  const handleWindowBlur = useCallback(() => {
    // Clear active pressed states if OS intercepts Win / Alt+Tab
    activeCodesRef.current.clear();
    setActiveCodes(new Set());
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keypress", handleKeyPress, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });
    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("keypress", handleKeyPress, { capture: true });
      window.removeEventListener("keyup", handleKeyUp, { capture: true });
      window.removeEventListener("contextmenu", handleContextMenu, {
        capture: true,
      });
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [handleKeyDown, handleKeyPress, handleKeyUp, handleContextMenu, handleWindowBlur]);

  function handleReset() {
    activeCodesRef.current.clear();
    setActiveCodes(new Set());
    setTestedCodes(new Set());
    setMaxRollover(0);
    setEventLogs([]);
    setUserFeedback(null);
    onStatusChange?.("untested");
  }

  function handleFeedback(status: "good" | "issue") {
    setUserFeedback(status);
    onStatusChange?.(status);
  }

  function renderKeyCap(
    key: KeyDef,
    options?: { className?: string; style?: React.CSSProperties; tall?: boolean }
  ) {
    const isActive = activeCodes.has(key.code);
    const isTested = testedCodes.has(key.code);
    const displayLabel =
      layout === "MAC" && key.macLabel ? key.macLabel : key.label;

    return (
      <div
        key={key.code}
        id={`key-${key.code}`}
        style={options?.style}
        className={cn(
          "relative flex items-center justify-center rounded-md border select-none transition-all duration-75",
          options?.tall ? "h-full" : "h-11 sm:h-12",
          isActive
            ? "border-[#60a5fa] bg-[#2563eb] text-white shadow-[0_0_14px_rgba(59,130,246,0.7)] scale-[0.96] z-10"
            : isTested
            ? "border-[#34d399]/75 bg-[#1b3a2e] text-[#6ee7b7] shadow-[inset_0_1px_0_rgba(110,231,183,0.12)]"
            : "border-[#46403b] bg-[#2b2724] text-[#e7e4e0] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-[#635b54]",
          options?.className
        )}
      >
        {key.sub && (
          <span
            className={cn(
              "absolute left-1.5 top-1 text-[10px] leading-none font-normal",
              isActive
                ? "text-white/90"
                : isTested
                ? "text-[#6ee7b7]/80"
                : "text-[#9c958d]"
            )}
          >
            {key.sub}
          </span>
        )}
        {key.icon === "backspace" ? (
          <Delete className="h-4 w-4" aria-label="Backspace" />
        ) : (
          <span
            className={cn(
              "truncate px-1 leading-none",
              key.sub
                ? "mt-1.5 text-xs sm:text-[13px] font-medium"
                : "text-[11px] sm:text-xs font-medium"
            )}
          >
            {displayLabel}
          </span>
        )}
      </div>
    );
  }

  const bottomRow = layout === "PC" ? BOTTOM_ROW_PC : BOTTOM_ROW_MAC;

  return (
    <div ref={containerRef} className="space-y-6">
      <h2 className="sr-only">
        Kiểm tra bàn phím máy tính trực tuyến (Keyboard Tester)
      </h2>

      {/* Top Controls & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-full border border-line bg-surface-subtle p-1">
            <button
              type="button"
              onClick={(e) => {
                setLayout("PC");
                e.currentTarget.blur();
              }}
              aria-pressed={layout === "PC"}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors min-h-9",
                layout === "PC"
                  ? "bg-brand text-ink-inverse shadow-sm"
                  : "text-ink-muted hover:text-navy"
              )}
            >
              Windows / PC
            </button>
            <button
              type="button"
              onClick={(e) => {
                setLayout("MAC");
                e.currentTarget.blur();
              }}
              aria-pressed={layout === "MAC"}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors min-h-9",
                layout === "MAC"
                  ? "bg-brand text-ink-inverse shadow-sm"
                  : "text-ink-muted hover:text-navy"
              )}
            >
              macOS / MacBook
            </button>
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-ink-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={preventShortcuts}
              onChange={(e) => {
                setPreventShortcuts(e.target.checked);
                e.currentTarget.blur();
              }}
              className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
            />
            <span>Khóa phím chức năng (không ảnh hưởng trình duyệt)</span>
          </label>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono tabular-nums">
            <span className="text-ink-muted">
              Đã kiểm tra:{" "}
              <strong className="text-emerald-600 text-sm">
                {testedCodes.size}
              </strong>{" "}
              phím
            </span>
            <span className="text-ink-muted">
              Rollover cao nhất:{" "}
              <strong className="text-navy text-sm">{maxRollover}</strong> phím
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              handleReset();
              e.currentTarget.blur();
            }}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-navy shadow-sm transition-colors hover:border-brand hover:text-brand"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Kiểm tra lại</span>
          </button>
        </div>
      </div>

      {/* Full-Size Dark ANSI 104-Key Mechanical Plate */}
      <div className="overflow-x-auto rounded-2xl border border-[#3a3430] bg-[#24201d] p-4 shadow-card-hover sm:p-5">
        <div className="min-w-[1000px] flex items-stretch gap-4">
          {/* BLOCK 1: Main Alphanumeric + Function Row (15u = 60 cols) */}
          <div className="flex-[15] flex flex-col gap-1.5">
            {MAIN_ROWS.map((row, rIdx) => (
              <div
                key={rIdx}
                className="grid gap-1.5"
                style={{ gridTemplateColumns: "repeat(60, minmax(0, 1fr))" }}
              >
                {row.map((item) =>
                  isSpacer(item) ? (
                    <div
                      key={item.id}
                      style={{ gridColumn: `span ${item.span} / span ${item.span}` }}
                      aria-hidden="true"
                    />
                  ) : (
                    renderKeyCap(item, {
                      style: {
                        gridColumn: `span ${item.span || 4} / span ${item.span || 4}`,
                      },
                    })
                  )
                )}
              </div>
            ))}

            {/* Bottom Modifier Row */}
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: "repeat(60, minmax(0, 1fr))" }}
            >
              {bottomRow.map((key) =>
                renderKeyCap(key, {
                  style: {
                    gridColumn: `span ${key.span || 4} / span ${key.span || 4}`,
                  },
                })
              )}
            </div>
          </div>

          {/* BLOCK 2: Navigation & Arrow Cluster (3 cols x 6 rows) */}
          <div className="flex-[3] grid grid-cols-3 grid-rows-6 gap-1.5">
            {/* Row 0: empty space aligning with F-keys */}
            <div className="col-span-3" aria-hidden="true" />

            {/* Row 1: ins, home, pg up */}
            {renderKeyCap({ code: "Insert", label: "ins" })}
            {renderKeyCap({ code: "Home", label: "home" })}
            {renderKeyCap({ code: "PageUp", label: "pg up" })}

            {/* Row 2: del, end, pg dn */}
            {renderKeyCap({ code: "Delete", label: "del" })}
            {renderKeyCap({ code: "End", label: "end" })}
            {renderKeyCap({ code: "PageDown", label: "pg dn" })}

            {/* Row 3: empty space */}
            <div className="col-span-3" aria-hidden="true" />

            {/* Row 4: Up arrow centered */}
            <div aria-hidden="true" />
            {renderKeyCap({ code: "ArrowUp", label: "↑" })}
            <div aria-hidden="true" />

            {/* Row 5: Left, Down, Right arrows */}
            {renderKeyCap({ code: "ArrowLeft", label: "←" })}
            {renderKeyCap({ code: "ArrowDown", label: "↓" })}
            {renderKeyCap({ code: "ArrowRight", label: "→" })}
          </div>

          {/* BLOCK 3: Full Numpad (4 cols x 6 rows, tall + and tall enter, wide 0) */}
          <div className="flex-[4] grid grid-cols-4 grid-rows-6 gap-1.5">
            {/* Row 0: empty space aligning with F-keys */}
            <div className="col-span-4" aria-hidden="true" />

            {/* Row 1: num, /, *, - */}
            {renderKeyCap({ code: "NumLock", label: "num" })}
            {renderKeyCap({ code: "NumpadDivide", label: "/" })}
            {renderKeyCap({ code: "NumpadMultiply", label: "*" })}
            {renderKeyCap({ code: "NumpadSubtract", label: "-" })}

            {/* Row 2: 7, 8, 9, tall + (row-span-2) */}
            {renderKeyCap({ code: "Numpad7", label: "7" })}
            {renderKeyCap({ code: "Numpad8", label: "8" })}
            {renderKeyCap({ code: "Numpad9", label: "9" })}
            {renderKeyCap(
              { code: "NumpadAdd", label: "+" },
              { className: "row-span-2", tall: true }
            )}

            {/* Row 3: 4, 5, 6 (+ continues in col 4) */}
            {renderKeyCap({ code: "Numpad4", label: "4" })}
            {renderKeyCap({ code: "Numpad5", label: "5" })}
            {renderKeyCap({ code: "Numpad6", label: "6" })}

            {/* Row 4: 1, 2, 3, tall enter (row-span-2) */}
            {renderKeyCap({ code: "Numpad1", label: "1" })}
            {renderKeyCap({ code: "Numpad2", label: "2" })}
            {renderKeyCap({ code: "Numpad3", label: "3" })}
            {renderKeyCap(
              { code: "NumpadEnter", label: "enter" },
              { className: "row-span-2", tall: true }
            )}

            {/* Row 5: wide 0 (col-span-2), . (enter continues in col 4) */}
            {renderKeyCap(
              { code: "Numpad0", label: "0" },
              { className: "col-span-2" }
            )}
            {renderKeyCap({ code: "NumpadDecimal", label: "." })}
          </div>
        </div>

        {/* Color Legend Strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#38332f] pt-3 text-[11px] text-[#a39c94]">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-[#46403b] bg-[#2b2724]" />
              <span>Chưa bấm</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-[#60a5fa] bg-[#2563eb]" />
              <span>Đang nhấn</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-[#34d399]/75 bg-[#1b3a2e]" />
              <span>Đã nhận tín hiệu</span>
            </span>
          </div>
          <span className="text-[11px] text-[#8d867f]">
            Đã chặn F1–F12, Tab, Alt, Space, Enter, Mũi tên, PgUp/PgDn, Menu, Ctrl+phím khỏi trình duyệt
          </span>
        </div>
      </div>

      {/* Live Event Stream Log & Key Stats */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h3 className="font-heading text-sm font-bold text-navy mb-3 flex items-center justify-between">
            <span>Nhật ký tín hiệu phím (Live Key Events)</span>
            <span className="font-mono text-xs font-normal text-ink-muted">
              Đang nhấn đồng thời: {activeCodes.size} phím
            </span>
          </h3>

          {eventLogs.length === 0 ? (
            <p className="py-6 text-center text-xs text-ink-muted">
              Hãy nhấn bất kỳ phím nào trên bàn phím máy tính của bạn để bắt đầu kiểm tra.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {eventLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-line-subtle bg-surface-subtle p-2 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "rounded px-1 text-xs font-bold",
                        log.type === "DOWN"
                          ? "bg-brand text-ink-inverse"
                          : "bg-surface-muted text-ink-muted"
                      )}
                    >
                      {log.type}
                    </span>
                    <span className="text-xs text-ink-subtle">{log.time}</span>
                  </div>
                  <p className="mt-1 font-bold text-navy truncate">
                    {log.key === " " ? "Space" : log.key}
                  </p>
                  <p className="text-xs text-ink-muted truncate">{log.code}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Evaluation Card */}
        <div className="lg:col-span-4 rounded-2xl border border-line bg-surface p-5 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-sm font-bold text-navy mb-2">
              Đánh giá bàn phím của bạn
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Các phím đổi màu xanh lá là phím hoạt động bình thường. Nếu phím bấm
              không phản hồi hoặc bị kẹt/nhảy chữ liên tục, hãy ghi nhận bên dưới:
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  handleFeedback("good");
                  e.currentTarget.blur();
                }}
                className={cn(
                  "flex-1 min-h-11 inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
                  userFeedback === "good"
                    ? "border-status-success-solid bg-status-success-bg text-status-success-ink"
                    : "border-line bg-surface text-ink-body hover:border-brand/40"
                )}
              >
                <CheckCircle2 className="h-4 w-4 text-status-success-solid" />
                <span>Hoạt động tốt</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  handleFeedback("issue");
                  e.currentTarget.blur();
                }}
                className={cn(
                  "flex-1 min-h-11 inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
                  userFeedback === "issue"
                    ? "border-status-danger-solid bg-status-danger-bg text-status-danger-ink"
                    : "border-line bg-surface text-ink-body hover:border-brand/40"
                )}
              >
                <AlertCircle className="h-4 w-4 text-status-danger-solid" />
                <span>Có phím liệt / kẹt</span>
              </button>
            </div>
          </div>

          {userFeedback === "issue" && (
            <div className="mt-4 rounded-xl border border-status-danger-line bg-status-danger-bg p-3.5 text-xs text-status-danger-ink space-y-2">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Phát hiện liệt phím / chập mạch phím</span>
              </p>
              <p className="leading-relaxed">
                MQTech hỗ trợ thay bàn phím laptop lấy liền 30 phút, bảo hành 6 - 12 tháng tại TP. Buôn Ma Thuột.
              </p>
              <Link
                href={`/dat-lich?dich_vu=${encodeURIComponent(
                  "Sửa Chữa Laptop Windows Chuyên Sâu"
                )}&mo_ta=${encodeURIComponent("Bàn phím bị liệt/kẹt phím qua test online")}`}
                className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-ink-inverse shadow-sm hover:bg-brand-hover"
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>Đặt lịch thay phím lấy ngay</span>
              </Link>
            </div>
          )}

          {userFeedback === "good" && (
            <div className="mt-4 rounded-xl border border-status-success-line bg-status-success-bg p-3 text-xs text-status-success-ink flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-status-success-solid" />
              <span>Tuyệt vời! Bàn phím hoạt động đầy đủ các phím đã test.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
