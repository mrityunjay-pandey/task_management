"use client";

import { useState, useRef, useEffect } from "react";

export interface VisibleFields {
  priority: boolean;
  dueDate: boolean;
  members: boolean;
  status: boolean;
  labels: boolean;
  reporter: boolean;
}

interface FieldsMenuProps {
  viewMode: "board" | "list";
  onViewModeChange: (mode: "board" | "list") => void;
  fields: VisibleFields;
  onChange: (fields: VisibleFields) => void;
}

export function FieldsMenu({
  viewMode,
  onViewModeChange,
  fields,
  onChange,
}: FieldsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
        <FieldsIcon />
        Fields
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-56 rounded-lg border border-border bg-card p-2.5 shadow-lg"
        >
          {/* Top: List / Board Tab Switcher */}
          <div className="mb-3 flex rounded-lg border border-border bg-background p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListIcon />
              List
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("board")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
                viewMode === "board"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BoardIcon />
              Board
            </button>
          </div>

          <div className="mb-1 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Columns / Fields
          </div>

          <div className="flex flex-col gap-0.5">
            <FieldOption
              label="Priority"
              checked={fields.priority}
              onChange={(checked) => onChange({ ...fields, priority: checked })}
            />
            <FieldOption
              label="Due Date"
              checked={fields.dueDate}
              onChange={(checked) => onChange({ ...fields, dueDate: checked })}
            />
            <FieldOption
              label="Members"
              checked={fields.members}
              onChange={(checked) => onChange({ ...fields, members: checked })}
            />
            <FieldOption
              label="Status"
              checked={fields.status}
              onChange={(checked) => onChange({ ...fields, status: checked })}
            />
            <FieldOption
              label="Labels"
              checked={fields.labels}
              onChange={(checked) => onChange({ ...fields, labels: checked })}
            />
            <FieldOption
              label="Reporter"
              checked={fields.reporter}
              onChange={(checked) => onChange({ ...fields, reporter: checked })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FieldOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-background transition-colors"
    >
      <span>{label}</span>
      <span
        className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
          checked
            ? "border-foreground bg-foreground text-background"
            : "border-input-border bg-card"
        }`}
      >
        {checked ? <CheckIcon /> : null}
      </span>
    </button>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.5 7.5L5.5 10.5L11.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FieldsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1.5" y="2" width="3" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <rect x="5.5" y="2" width="3" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <rect x="9.5" y="2" width="3" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 3.5H11.5M2.5 7H11.5M2.5 10.5H11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function BoardIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="4.5" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="7.5" y="2" width="4.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
