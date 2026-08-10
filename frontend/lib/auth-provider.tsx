"use client";

import { createContext, useEffect, useState, useCallback } from "react";
import type { User } from "@/types/user";
import { authService } from "@/services/auth.service";

interface AuthContextValue {
  user: User | null;
  // "checking" = still verifying the session on load (e.g. after a refresh).
  // Kept separate from a plain boolean so the UI can show a loading state
  // instead of briefly flashing the login screen before the session check finishes.
  status: "checking" | "authenticated" | "guest";
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("checking");

  // On every page load (including after a refresh), ask the backend
  // "am I still logged in?" via the httpOnly cookie - this is what makes
  // the guest session survive a refresh without touching localStorage.
  useEffect(() => {
    authService
      .getCurrentUser()
      .then((u) => {
        setUser(u);
        setStatus("authenticated");
      })
      .catch(() => {
        setUser(null);
        setStatus("guest");
      });
  }, []);

  const loginAsGuest = useCallback(async () => {
    const u = await authService.loginAsGuest();
    setUser(u);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setStatus("guest");
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
