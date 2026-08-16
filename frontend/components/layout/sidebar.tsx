"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeMenu } from "./theme-menu";
import { useAuth } from "@/hooks/use-auth";

const NAV_ITEMS = [
  { href: "/tasks", label: "Tasks", icon: TasksIcon },
  { href: "/projects", label: "Projects", icon: ProjectsIcon },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fixed on desktop, an overlay drawer on mobile - isOpen/onClose only
// matter below the md breakpoint (see the mobile classes below).
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  // Matches the Figma design's collapsible "Workspace" nav section
  // (separate from the profile/theme menu at the bottom).
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed z-40 flex h-full w-64 shrink-0 flex-col border-r border-border bg-card
          transition-transform duration-200 md:static md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Workspace switcher - single-workspace app, so this is presentational
            (matches the Figma chevron affordance) rather than a real switcher.
            Documented as a scope decision in README. */}
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-4 text-left hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          aria-label="Workspace switcher"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
            aria-hidden="true"
          >
            {user?.guestName?.[0]?.toUpperCase() ?? "D"}
          </span>
          <span className="flex-1 text-sm font-semibold text-foreground">
            {user?.guestName ?? "Workspace"}
          </span>
          <ChevronUpDownIcon />
        </button>

        <nav className="flex-1 px-2" aria-label="Main navigation">
          <button
            type="button"
            onClick={() => setIsWorkspaceOpen((v) => !v)}
            aria-expanded={isWorkspaceOpen}
            className="flex w-full items-center justify-between rounded-md px-2 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            Workspace
            <ChevronDownIcon collapsed={!isWorkspaceOpen} />
          </button>

          {isWorkspaceOpen ? (
            <ul className="flex flex-col gap-0.5">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname?.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onClose}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                        ${
                          isActive
                            ? "bg-accent/10 text-accent"
                            : "text-foreground hover:bg-background"
                        }`}
                    >
                      <Icon />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </nav>

        <div className="border-t border-border p-2">
          <ThemeMenu />
        </div>
      </aside>
    </>
  );
}

function ChevronUpDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M4 5.5L7 3L10 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 8.5L7 11L10 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={`transition-transform ${collapsed ? "-rotate-90" : ""}`}
    >
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TasksIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 5a1 1 0 011-1h3l1.5 2H13a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1V5z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}
