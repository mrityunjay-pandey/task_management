"use client";

import { useState, useRef, useEffect } from "react";
import { TASK_STATUSES, PRIORITIES, STATUS_LABELS, PRIORITY_LABELS } from "@/types/task";
import type { TaskStatus, Priority } from "@/types/task";

interface FilterMenuProps {
  status: TaskStatus | undefined;
  priority: Priority | undefined;
  onStatusChange: (status: TaskStatus | undefined) => void;
  onPriorityChange: (priority: Priority | undefined) => void;
}

type ActiveSubmenu = "status" | "priority" | null;

export function FilterMenu({
  status,
  priority,
  onStatusChange,
  onPriorityChange,
}: FilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<ActiveSubmenu>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeCount = (status ? 1 : 0) + (priority ? 1 : 0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => {
          setIsOpen((v) => !v);
          setActiveSubmenu(null);
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <FilterIcon />
        Filter
        {activeCount > 0 ? (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
            {activeCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-30 mt-1 flex">
          {/* Top level flyout menu */}
          <div
            role="menu"
            className="w-52 rounded-lg border border-border bg-card p-1.5 shadow-lg"
          >
            <div className="mb-1 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Filter by
            </div>

            {/* Status Item */}
            <button
              type="button"
              onClick={() => setActiveSubmenu(activeSubmenu === "status" ? null : "status")}
              onMouseEnter={() => setActiveSubmenu("status")}
              className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                activeSubmenu === "status"
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-foreground hover:bg-background"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Status</span>
                {status ? (
                  <span className="rounded bg-accent/20 px-1.5 py-0.2 text-[10px] font-medium text-accent">
                    {STATUS_LABELS[status]}
                  </span>
                ) : null}
              </div>
              <ChevronRightIcon />
            </button>

            {/* Priority Item */}
            <button
              type="button"
              onClick={() => setActiveSubmenu(activeSubmenu === "priority" ? null : "priority")}
              onMouseEnter={() => setActiveSubmenu("priority")}
              className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                activeSubmenu === "priority"
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-foreground hover:bg-background"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Priority</span>
                {priority ? (
                  <span className="rounded bg-accent/20 px-1.5 py-0.2 text-[10px] font-medium text-accent">
                    {PRIORITY_LABELS[priority]}
                  </span>
                ) : null}
              </div>
              <ChevronRightIcon />
            </button>

            {/* Disabled / Future Filter Items matching Figma */}
            <DisabledFilterItem label="Members" tooltip="Multi-assignee filtering not available yet" />
            <DisabledFilterItem label="Due Date" tooltip="Date range filtering not available yet" />
            <DisabledFilterItem label="Teams" tooltip="Teams not configured yet" />
            <DisabledFilterItem label="Labels" tooltip="Label filtering not available yet" />
            <DisabledFilterItem label="Reporter" tooltip="Reporter filtering not available yet" />

            {activeCount > 0 ? (
              <div className="mt-1.5 border-t border-border pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange(undefined);
                    onPriorityChange(undefined);
                    setActiveSubmenu(null);
                  }}
                  className="flex w-full items-center justify-center rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-background hover:text-foreground"
                >
                  Clear all filters
                </button>
              </div>
            ) : null}
          </div>

          {/* Secondary Submenu (Nested Flyout) */}
          {activeSubmenu === "status" ? (
            <div
              role="menu"
              className="ml-1 w-48 rounded-lg border border-border bg-card p-1.5 shadow-lg"
            >
              <div className="mb-1 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </div>
              <FilterOption
                label="All Statuses"
                selected={!status}
                onClick={() => {
                  onStatusChange(undefined);
                }}
              />
              {TASK_STATUSES.map((s) => (
                <FilterOption
                  key={s}
                  label={STATUS_LABELS[s]}
                  selected={status === s}
                  onClick={() => {
                    onStatusChange(s);
                  }}
                />
              ))}
            </div>
          ) : activeSubmenu === "priority" ? (
            <div
              role="menu"
              className="ml-1 w-48 rounded-lg border border-border bg-card p-1.5 shadow-lg"
            >
              <div className="mb-1 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Priority
              </div>
              <FilterOption
                label="All Priorities"
                selected={!priority}
                onClick={() => {
                  onPriorityChange(undefined);
                }}
              />
              {PRIORITIES.map((p) => (
                <FilterOption
                  key={p}
                  label={PRIORITY_LABELS[p]}
                  selected={priority === p}
                  onClick={() => {
                    onPriorityChange(p);
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function DisabledFilterItem({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div
      title={tooltip}
      className="flex w-full cursor-not-allowed items-center justify-between rounded-md px-2.5 py-1.5 text-sm text-muted-foreground opacity-45"
    >
      <span>{label}</span>
      <ChevronRightIcon />
    </div>
  );
}

function FilterOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
        selected ? "font-medium text-foreground bg-accent/5" : "text-muted-foreground hover:bg-background hover:text-foreground"
      }`}
    >
      <span>{label}</span>
      {selected ? <CheckIcon /> : null}
    </button>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 3H12L8 8V11.5L6 12.5V8L2 3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
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

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
