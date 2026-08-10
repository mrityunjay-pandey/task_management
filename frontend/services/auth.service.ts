import { apiFetch } from "@/lib/api";
import type { User } from "@/types/user";

export const authService = {
  loginAsGuest: () =>
    apiFetch<User>("/auth/guest", { method: "POST" }),

  getCurrentUser: () => apiFetch<User>("/auth/me"),

  logout: () => apiFetch<void>("/auth/logout", { method: "POST" }),
};
