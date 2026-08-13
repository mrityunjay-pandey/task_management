import { apiFetch } from "@/lib/api";
import type { User } from "@/types/user";

export interface UpdateProfileInput {
  email?: string;
  title?: string;
  username?: string;
}

export const authService = {
  loginAsGuest: () =>
    apiFetch<User>("/auth/guest", { method: "POST" }),

  getCurrentUser: () => apiFetch<User>("/auth/me"),

  updateProfile: (input: UpdateProfileInput) =>
    apiFetch<User>("/auth/me", { method: "PATCH", body: JSON.stringify(input) }),

  logout: () => apiFetch<void>("/auth/logout", { method: "POST" }),
};
