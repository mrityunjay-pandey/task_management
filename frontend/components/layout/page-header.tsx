"use client";

interface PageHeaderProps {
  title: React.ReactNode;
  onMenuClick: () => void;
  children?: React.ReactNode;
}

// The sidebar toggle button renders on both desktop and mobile -
// matching the Figma icon (▯│) at the top-left of the main content area.
export function PageHeader({ title, onMenuClick, children }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3 md:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
        className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <SidebarToggleIcon />
      </button>
      <div className="text-base font-semibold text-foreground">{title}</div>
      <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function SidebarToggleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2" y="2.5" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.5 2.5V15.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
