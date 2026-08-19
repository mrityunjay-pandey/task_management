"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { COLOR_MODES } from "@/types/theme";
import type { ColorMode } from "@/types/theme";
import { ApiError } from "@/lib/api";

type Tab = "profile" | "theme" | "color";

const COLOR_SWATCH: Record<ColorMode, string> = {
  amber: "#f59e0b",
  blue: "#3b82f6",
  pink: "#ec4899",
  rose: "#f43f5e",
  emerald: "#10b981",
  black: "#111827",
};

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="flex h-full flex-col overflow-y-auto md:flex-row">
      <aside className="w-full shrink-0 border-b border-border bg-card p-3 md:w-60 md:border-b-0 md:border-r">
        <Link
          href="/tasks"
          className="mb-4 flex items-center gap-1.5 px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to app
        </Link>
        <nav className="flex flex-row gap-1 md:flex-col" aria-label="Settings navigation">
          <TabButton label="Profile" active={tab === "profile"} onClick={() => setTab("profile")} />
          <TabButton label="Theme" active={tab === "theme"} onClick={() => setTab("theme")} />
          <TabButton label="Color" active={tab === "color"} onClick={() => setTab("color")} />
        </nav>
      </aside>

      <div className="flex-1 p-4 md:p-8">
        {tab === "profile" ? <ProfileSection /> : null}
        {tab === "theme" ? <ThemeSection /> : null}
        {tab === "color" ? <ColorSection /> : null}
      </div>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function ProfileSection() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(user?.email ?? "");
  const [title, setTitle] = useState(user?.title ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedRecently, setSavedRecently] = useState(false);

  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSaveError(null);

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        email: email || undefined,
        title: title || undefined,
        username: username || undefined,
      });
      setSavedRecently(true);
      setTimeout(() => setSavedRecently(false), 2000);
    } catch (err) {
      setSaveError(
        err instanceof ApiError ? err.message : "Couldn't save your profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLeaveWorkspace() {
    setIsLeaving(true);
    try {
      await logout();
      router.push("/login");
    } finally {
      setIsLeaving(false);
      setIsLeaveOpen(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Profile</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Figma Row Layout: bordered container with rows separated by bottom borders */}
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            {/* Row 1: Profile picture */}
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm font-medium text-foreground">Profile picture</span>
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground"
                aria-hidden="true"
              >
                {user?.guestName?.[0]?.toUpperCase() ?? "G"}
              </span>
            </div>

            {/* Row 2: Email */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4">
              <label htmlFor="profile-email" className="text-sm font-medium text-foreground min-w-[120px]">
                Email
              </label>
              <div className="flex-1 max-w-sm flex flex-col items-end">
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-9 w-full rounded-lg border border-input-border bg-card px-3 text-sm text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-right"
                />
                {errors.email ? (
                  <span className="mt-1 text-xs text-destructive">{errors.email}</span>
                ) : null}
              </div>
            </div>

            {/* Row 3: Full name */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4">
              <span className="text-sm font-medium text-foreground min-w-[120px]">Full name</span>
              <div className="flex-1 max-w-sm flex items-center sm:justify-end">
                <span
                  className="text-sm text-muted-foreground"
                  title="Guest display names are auto-generated and can't be edited"
                >
                  {user?.guestName ?? "Guest User"}
                </span>
              </div>
            </div>

            {/* Row 4: Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4">
              <label htmlFor="profile-title" className="text-sm font-medium text-foreground min-w-[120px]">
                Title
              </label>
              <div className="flex-1 max-w-sm flex flex-col items-end">
                <input
                  id="profile-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Your job title or role"
                  maxLength={100}
                  className="h-9 w-full rounded-lg border border-input-border bg-card px-3 text-sm text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-right"
                />
              </div>
            </div>

            {/* Row 5: Username */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4">
              <label htmlFor="profile-username" className="text-sm font-medium text-foreground min-w-[120px]">
                Username
              </label>
              <div className="flex-1 max-w-sm flex flex-col items-end">
                <input
                  id="profile-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="One word, like nickname"
                  maxLength={50}
                  className="h-9 w-full rounded-lg border border-input-border bg-card px-3 text-sm text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-right"
                />
              </div>
            </div>
          </div>

          {saveError ? (
            <p role="alert" className="text-sm text-destructive">
              {saveError}
            </p>
          ) : null}

          <div className="flex items-center gap-3">
            <Button type="submit" isLoading={isSaving}>
              Save Changes
            </Button>
            {savedRecently ? (
              <span className="text-sm text-green-600 font-medium" role="status">
                Saved
              </span>
            ) : null}
          </div>
        </form>
      </div>

      {/* Workspace access Section matching Figma */}
      <div className="pt-2">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Workspace access</h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-5">
          <span className="text-sm text-muted-foreground">
            Remove yourself from the workspace
          </span>
          <button
            type="button"
            onClick={() => setIsLeaveOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-[#fef2f2] dark:bg-red-950/40 px-4 py-2 text-sm font-medium text-[#ef4444] dark:text-red-400 transition-colors hover:bg-[#fee2e2] dark:hover:bg-red-950/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Leave Workspace
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isLeaveOpen}
        title="Leave Workspace?"
        description="Are you sure you want to leave this workspace? You will be signed out of your current guest session."
        isConfirming={isLeaving}
        onConfirm={handleLeaveWorkspace}
        onCancel={() => setIsLeaveOpen(false)}
      />
    </div>
  );
}

function ThemeSection() {
  const { mode, setMode } = useAppTheme();
  return (
    <div className="max-w-md">
      <h2 className="mb-4 text-xl font-semibold text-foreground">Theme</h2>
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
        {(["light", "dark"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
              mode === m ? "border-accent bg-accent/5" : "border-border hover:bg-background"
            }`}
          >
            <span className="capitalize text-foreground">{m}</span>
            {mode === m ? <CheckIcon /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorSection() {
  const { color, setColor } = useAppTheme();
  return (
    <div className="max-w-md">
      <h2 className="mb-4 text-xl font-semibold text-foreground">Color Mode</h2>
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-5">
        {COLOR_MODES.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-pressed={color === c}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
              color === c ? "border-accent bg-accent/5" : "border-border hover:bg-background"
            }`}
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: COLOR_SWATCH[c] }}
              aria-hidden="true"
            />
            <span className="flex-1 capitalize text-foreground">{c}</span>
            {color === c ? <CheckIcon /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.5 7.5L5.5 10.5L11.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
