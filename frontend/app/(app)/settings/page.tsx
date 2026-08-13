"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
      <aside className="w-full shrink-0 border-b border-border bg-card p-3 md:w-56 md:border-b-0 md:border-r">
        <Link
          href="/tasks"
          className="mb-4 flex items-center gap-1.5 px-2 text-sm text-muted-foreground hover:text-foreground"
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
      className={`rounded-lg px-3 py-1.5 text-left text-sm font-medium ${
        active ? "bg-background text-foreground" : "text-muted-foreground hover:bg-background"
      }`}
    >
      {label}
    </button>
  );
}

function ProfileSection() {
  const { user, updateProfile } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [title, setTitle] = useState(user?.title ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedRecently, setSavedRecently] = useState(false);

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

  return (
    <div className="max-w-md">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Profile</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Profile picture</span>
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground"
            aria-hidden="true"
          >
            {user?.guestName?.[0]?.toUpperCase() ?? "G"}
          </span>
        </div>

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="you@example.com"
        />

        <Input
          label="Full name"
          value={user?.guestName ?? ""}
          disabled
          title="Guest display names are auto-generated and can't be edited"
        />

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Your job title or role"
          maxLength={100}
        />

        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="One word, like a nickname or first name"
          maxLength={50}
        />

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
            <span className="text-sm text-green-600" role="status">
              Saved
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function ThemeSection() {
  const { mode, setMode } = useAppTheme();
  return (
    <div className="max-w-md">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Theme</h2>
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
        {(["light", "dark"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
              mode === m ? "border-accent bg-accent/5" : "border-border"
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
      <h2 className="mb-4 text-lg font-semibold text-foreground">Color Mode</h2>
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-5">
        {COLOR_MODES.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-pressed={color === c}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm ${
              color === c ? "border-accent bg-accent/5" : "border-border"
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
