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

export function FilterMenu({
  status,
  priority,
  onStatusChange,
  onPriorityChange,
}: FilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeCount = (status ? 1 : 0) + (priority ? 1 : 0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
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
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-border bg-card p-2 shadow-lg"
        >
          <p className="px-1 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Status
          </p>
          <FilterOption
            label="All"
            selected={!status}
            onClick={() => onStatusChange(undefined)}
          />
          {TASK_STATUSES.map((s) => (
            <FilterOption
              key={s}
              label={STATUS_LABELS[s]}
              selected={status === s}
              onClick={() => onStatusChange(s)}
            />
          ))}

          <div className="my-2 border-t border-border" />

          <p className="px-1 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Priority
          </p>
          <FilterOption
            label="All"
            selected={!priority}
            onClick={() => onPriorityChange(undefined)}
          />
          {PRIORITIES.map((p) => (
            <FilterOption
              key={p}
              label={PRIORITY_LABELS[p]}
              selected={priority === p}
              onClick={() => onPriorityChange(p)}
            />
          ))}
        </div>
      ) : null}
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
      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-background"
    >
      {label}
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

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
