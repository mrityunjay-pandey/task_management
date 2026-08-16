"use client";

import { useState, useRef, useEffect } from "react";

export interface VisibleFields {
  priority: boolean;
  dueDate: boolean;
}

interface FieldsMenuProps {
  fields: VisibleFields;
  onChange: (fields: VisibleFields) => void;
}

// Matches the Figma "Fields" dropdown (checkboxes controlling which columns
// show in List view). Members/Status/Labels/Reporter aren't included since
// this app doesn't have those as separate toggleable table columns the way
// the Figma reference's richer multi-user version does.
export function FieldsMenu({ fields, onChange }: FieldsMenuProps) {
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
          className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-border bg-card p-2 shadow-lg"
        >
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
    <label className="flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-background">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 rounded border-input-border accent-accent"
      />
    </label>
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
