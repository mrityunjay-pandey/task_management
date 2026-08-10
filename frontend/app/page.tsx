"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

// Root route is just a traffic director: send authenticated guests to the
// dashboard, everyone else to the login screen. It has no UI of its own
// while the session check is in flight.
export default function Home() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    } else if (status === "guest") {
      router.replace("/login");
    }
  }, [status, router]);

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
