"use client";

interface PageHeaderProps {
  title: string;
  onMenuClick: () => void;
  children?: React.ReactNode;
}

// The hamburger button only renders visually on mobile (md:hidden) -
// it's what opens the Sidebar drawer on small screens.
export function PageHeader({ title, onMenuClick, children }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3 md:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="rounded-md p-1.5 text-foreground hover:bg-background md:hidden"
      >
        <MenuIcon />
      </button>
      <h1 className="text-base font-semibold text-foreground">{title}</h1>
      <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 5.5H17M3 10H17M3 14.5H17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
