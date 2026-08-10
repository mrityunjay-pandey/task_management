"use client";

import { useAuth } from "@/hooks/use-auth";

// Placeholder for now - the real Tasks board/list view is built in the
// next phase. This just confirms the guest session + redirect flow works
// end-to-end before we build the real UI on top of it.
export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-foreground">
          Signed in as <strong>{user?.guestName}</strong>
        </p>
        <button
          onClick={() => logout()}
          className="mt-4 text-sm text-muted-foreground underline"
        >
          Log out
        </button>
      </div>
    </main>
  );
}
