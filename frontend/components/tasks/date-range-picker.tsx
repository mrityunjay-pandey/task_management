"use client";

import { useState, useRef, useEffect } from "react";

interface DateRangePickerProps {
  startDate?: string | null;
  dueDate?: string | null;
  onChange: (startDate?: string, dueDate?: string) => void;
}

export function DateRangePicker({
  startDate,
  dueDate,
  onChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial month to display
  const initialDate = startDate ? new Date(startDate) : dueDate ? new Date(dueDate) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-11

  // Range selection mode: "start" | "end"
  const [selectingMode, setSelectingMode] = useState<"start" | "end">("start");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startStr = startDate ? startDate.slice(0, 10) : "";
  const dueStr = dueDate ? dueDate.slice(0, 10) : "";

  function formatShort(dateStr: string) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function handlePrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function handleSelectDay(day: number) {
    const yStr = currentYear.toString();
    const mStr = (currentMonth + 1).toString().padStart(2, "0");
    const dStr = day.toString().padStart(2, "0");
    const pickedDateStr = `${yStr}-${mStr}-${dStr}`;

    if (selectingMode === "start") {
      // If end date exists and picked start is after end, reset end date
      if (dueStr && pickedDateStr > dueStr) {
        onChange(pickedDateStr, undefined);
      } else {
        onChange(pickedDateStr, dueStr || undefined);
      }
      setSelectingMode("end");
    } else {
      // Selecting end date
      if (startStr && pickedDateStr < startStr) {
        // If clicked earlier than start date, treat as new start date
        onChange(pickedDateStr, undefined);
        setSelectingMode("end");
      } else {
        onChange(startStr || undefined, pickedDateStr);
        setSelectingMode("start");
      }
    }
  }

  // Calculate calendar days
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-input-border bg-card px-3 text-xs text-foreground transition-colors hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon />
          {startStr || dueStr ? (
            <span className="font-medium">
              {startStr ? formatShort(startStr) : "No start"}
              {" → "}
              {dueStr ? formatShort(dueStr) : "No end"}
            </span>
          ) : (
            <span className="text-muted-foreground">Select start & due dates</span>
          )}
        </div>
        <ChevronDownIcon />
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label="Date range calendar picker"
          className="absolute left-0 top-full z-40 mt-1 w-64 rounded-xl border border-border bg-card p-3 shadow-xl"
        >
          {/* Header Month / Year Navigation */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">{monthName}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1 text-center text-[10px] font-medium text-muted-foreground">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
            {/* Prev month fill */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div
                key={`prev-${i}`}
                className="flex h-7 items-center justify-center text-[11px] text-muted-foreground/30"
              >
                {daysInPrevMonth - firstDayOfWeek + i + 1}
              </div>
            ))}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const yStr = currentYear.toString();
              const mStr = (currentMonth + 1).toString().padStart(2, "0");
              const dStr = day.toString().padStart(2, "0");
              const dateStr = `${yStr}-${mStr}-${dStr}`;

              const isStart = dateStr === startStr;
              const isDue = dateStr === dueStr;
              const isInRange = startStr && dueStr && dateStr > startStr && dateStr < dueStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`flex h-7 w-full items-center justify-center text-xs transition-colors rounded ${
                    isStart || isDue
                      ? "bg-accent font-semibold text-accent-foreground"
                      : isInRange
                      ? "bg-accent/15 text-foreground rounded-none"
                      : "text-foreground hover:bg-background"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[11px]">
            <span className="text-muted-foreground">
              {selectingMode === "start" ? "Pick Start Date" : "Pick Due Date"}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onChange(undefined, undefined);
                  setSelectingMode("start");
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="font-medium text-accent hover:underline"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M1.5 5H10.5M4 1.5V3M8 1.5V3" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M7.5 2.5L4 6L7.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
