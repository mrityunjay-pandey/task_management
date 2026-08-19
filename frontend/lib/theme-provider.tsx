"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeMode, ColorMode } from "@/types/theme";
import { combineTheme } from "@/types/theme";

const MODES: ThemeMode[] = ["light", "dark"];
const COLORS: ColorMode[] = ["amber", "blue", "pink", "rose", "emerald", "black"];

// Every valid "mode-color" combination, e.g. ["light-amber", "light-blue", ...,
// "dark-black"]. next-themes needs this full list up front so its blocking
// inline script can apply the right data-theme attribute before first paint -
// that's what prevents a flash of the wrong theme on load.
const ALL_THEMES = MODES.flatMap((mode) =>
  COLORS.map((color) => combineTheme(mode, color)),
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      themes={ALL_THEMES}
      defaultTheme="light-black"
      enableSystem={false}
      storageKey="task-management-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
