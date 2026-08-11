"use client";

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
        <div className="flex items-center gap-2 px-4 py-4">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
            aria-hidden="true"
          >
            {user?.guestName?.[0]?.toUpperCase() ?? "D"}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {user?.guestName ?? "Workspace"}
          </span>
        </div>

        <nav className="flex-1 px-2" aria-label="Main navigation">
          <p className="px-2 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Workspace
          </p>
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
        </nav>

        <div className="border-t border-border p-2">
          <ThemeMenu />
        </div>
      </aside>
    </>
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
