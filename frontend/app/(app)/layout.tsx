"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";

interface AppLayoutContextType {
  openSidebar: () => void;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  isDesktopCollapsed: boolean;
}

const AppLayoutContext = createContext<AppLayoutContextType | null>(null);

export function useAppLayout() {
  const ctx = useContext(AppLayoutContext);
  if (!ctx) throw new Error("useAppLayout must be used within AppLayout");
  return ctx;
}

// Wraps every authenticated route (/tasks, /projects, /settings). Redirects
// to /login if the session check comes back negative - this is the one
// place that guards the whole authenticated section of the app, rather
// than repeating the check on every page.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const isSettings = pathname?.startsWith("/settings");

  useEffect(() => {
    if (status === "guest") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground"
          role="status"
          aria-label="Loading"
        />
      </main>
    );
  }

  function toggleSidebar() {
    // On small screens toggle the mobile drawer, on desktop toggle collapse
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen((v) => !v);
    } else {
      setIsDesktopCollapsed((v) => !v);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {!isSettings ? (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isDesktopCollapsed={isDesktopCollapsed}
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col transition-all duration-200">
        <AppLayoutContext.Provider
          value={{
            openSidebar: () => setIsSidebarOpen(true),
            toggleSidebar,
            isSidebarOpen,
            isDesktopCollapsed,
          }}
        >
          {children}
        </AppLayoutContext.Provider>
      </div>
    </div>
  );
}
