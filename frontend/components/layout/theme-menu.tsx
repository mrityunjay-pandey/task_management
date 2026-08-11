"use client";

import { useState, useRef, useEffect } from "react";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuth } from "@/hooks/use-auth";
import { COLOR_MODES } from "@/types/theme";
import type { ColorMode } from "@/types/theme";

const COLOR_SWATCH: Record<ColorMode, string> = {
  amber: "#f59e0b",
  blue: "#3b82f6",
  pink: "#ec4899",
  rose: "#f43f5e",
  emerald: "#10b981",
  black: "#111827",
};

const COLOR_LABEL: Record<ColorMode, string> = {
  amber: "Amber",
  blue: "Blue",
  pink: "Pink",
  rose: "Rose",
  emerald: "Emerald",
  black: "Black",
};

// Matches the Figma flow exactly: click the avatar -> menu with "Change
// Theme" and "Color Mode" rows -> each opens its own submenu on hover/click.
export function ThemeMenu() {
  const { user, logout } = useAuth();
  const { mode, color, setMode, setColor } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [submenu, setSubmenu] = useState<"theme" | "color" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSubmenu(null);
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
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: COLOR_SWATCH[color] }}
          aria-hidden="true"
        >
          {user?.guestName?.[0]?.toUpperCase() ?? "G"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {user?.guestName ?? "Guest"}
          </span>
        </span>
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-20 mb-1 w-56 rounded-lg border border-border bg-card p-1 shadow-lg"
        >
          <MenuRow
            label="Change Theme"
            onClick={() => setSubmenu(submenu === "theme" ? null : "theme")}
            active={submenu === "theme"}
          />
          {submenu === "theme" ? (
            <div className="ml-2 mb-1 flex flex-col gap-0.5 border-l border-border pl-2">
              <SubOption
                label="Light"
                selected={mode === "light"}
                onClick={() => setMode("light")}
              />
              <SubOption
                label="Dark"
                selected={mode === "dark"}
                onClick={() => setMode("dark")}
              />
            </div>
          ) : null}

          <MenuRow
            label="Color Mode"
            onClick={() => setSubmenu(submenu === "color" ? null : "color")}
            active={submenu === "color"}
          />
          {submenu === "color" ? (
            <div className="ml-2 mb-1 flex flex-col gap-0.5 border-l border-border pl-2">
              {COLOR_MODES.map((c) => (
                <SubOption
                  key={c}
                  label={COLOR_LABEL[c]}
                  selected={color === c}
                  onClick={() => setColor(c)}
                  swatch={COLOR_SWATCH[c]}
                />
              ))}
            </div>
          ) : null}

          <div className="my-1 border-t border-border" />
          <button
            role="menuitem"
            onClick={() => logout()}
            className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-background"
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuRow({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-background ${active ? "bg-background" : ""}`}
    >
      {label}
      <span aria-hidden="true">›</span>
    </button>
  );
}

function SubOption({
  label,
  selected,
  onClick,
  swatch,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  swatch?: string;
}) {
  return (
    <button
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-background"
    >
      {swatch ? (
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: swatch }}
          aria-hidden="true"
        />
      ) : null}
      <span className="flex-1">{label}</span>
      {selected ? <CheckIcon /> : null}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.5 7.5L5.5 10.5L11.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
