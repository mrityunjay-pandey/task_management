"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";

const AppLayoutContext = createContext<{ openSidebar: () => void } | null>(null);

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
  const { status } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Each page renders its own PageHeader (title/actions differ per
            page), but the mobile hamburger button needs to open THIS
            layout's sidebar state. AppLayoutContext exposes just that one
            function so pages don't need sidebar state passed as a prop. */}
        <AppLayoutContext.Provider value={{ openSidebar: () => setIsSidebarOpen(true) }}>
          {children}
        </AppLayoutContext.Provider>
      </div>
    </div>
  );
}
